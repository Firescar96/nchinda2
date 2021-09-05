import childProcess from 'child_process';
import path from 'path';
import fs from 'fs';
import { WSClient } from './WSClient.mjs';

class ClientGroupManager {
  constructor(name) {
    this.name = name;
    this.clients = {};
    this.isLiveVideo = true;
    this.clientsWaitingToSync = []; //clients who have requested a timecheck
    this.numResponsesRequested = 0; //number of clients we need to respond to get an estimate of the time to sync to

    this.initializeLiveTranscoder();
  }

  initializeLiveTranscoder(name) {
    const hlsManifestPath = `/mnt/aux1/nchinda2/hls/${this.name}.m3u8`;
    if(process.env.NODE_ENV == 'production' && !fs.existsSync(hlsManifestPath)) {
      const source = path.resolve(process.cwd(), 'server/base.m3u8');
      fs.copyFileSync(source, hlsManifestPath);
    }

    //helpful documentation on ffmpeg streaming https://trac.ffmpeg.org/wiki/StreamingGuide
    //and on some flags https://ffmpeg.org/ffmpeg-all.html#rtsp
    //what do the numbers in an avc codec mean https://lists.ffmpeg.org/pipermail/ffmpeg-user/2015-October/028984.html
    //https://stackoverflow.com/questions/48588511/prepare-mp4-videos-for-media-source-extensions-api-using-ffmpeg
    //a pretty complete list of ffmpeg flags https://gist.github.com/tayvano/6e2d456a9897f55025e25035478a3a50
    //copies the data from the rtmp live stream over to nginx for a playlist
    const mediaSpawnOptions = [
      '-re', //realtime? I heard it's good for livestreams and bad for writing to a file, streaming doesn't seem to work without it, the output is more regular with this flag
      '-i',
      `http://nchinda2.africa:3274/live/${this.name}/playlist.m3u8`,
      '-reconnect',
      '1',
      '-reconnect_at_eof',
      '1',
      '-reconnect_streamed',
      '1',
      '-reconnect_delay_max',
      '10',
      '-strict',
      'experimental',
      '-vcodec',
      'copy',
      '-acodec',
      'copy',
      '-f',
      'flv',
      `rtmp://nchinda2.africa:2935/live/${this.name}`,
    ];

    this.mediaStream = childProcess.spawn('ffmpeg', mediaSpawnOptions, {
      detached: false,
      //if we don't ignore stdin then ffmpeg will stop and show a control panel with a 'c' comes up in the output
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  }

  addClient(ws) {
    //ws shouldn't be in the global scope of arguments, but must be scoped to this function
    const clientObject = new WSClient(ws);
    this.clients[ws.id] = clientObject;

    ws.on('close', () => {
      Object.values(this.clients).forEach((client) => {
        const message = { flag: 'peerDisconnect', name: this.clients[ws.id].name, lastFrameTime: client.lastFrameTime };
        client.websocket.send(JSON.stringify(message));
      });
      delete this.clients[ws.id];
    });

    ws.on('message', (rawdata) => {
      const data = JSON.parse(rawdata);
      if(!this.clients[ws.id]) return;
      switch(data.flag) {
        case 'webrtcSignal':
          this.clients[ws.id].webrtcConnection.signal(data.signal);
          break;
        case 'syncResponse': {
          this.clients[ws.id].lastFrameTime = data.lastFrameTime;
          this.clients[ws.id].isPaused = data.isPaused;
          this.clients[ws.id].ackedSyncRequest = true;
          if('isLiveVideo' in data) this.isLiveVideo = data.isLiveVideo;

          const numSyncResponses = Object.values(this.clients).reduce((a, b) => (b.ackedSyncRequest ? a + 1 : a), 0);

          if(numSyncResponses < this.numResponsesRequested) break;

          let maximumTime = Number.MIN_SAFE_INTEGER;
          let isPaused = false;
          Object.values(this.clients).forEach((client) => {
            if(!client.ackedSyncRequest) return;

            maximumTime = Math.max(maximumTime, client.lastFrameTime);
            isPaused |= client.isPaused;
          });
          if(maximumTime == Number.MIN_SAFE_INTEGER) break;
          this.clientsWaitingToSync.forEach((clientWS) => {
            const responseMessage = {
              flag: 'syncResponse',
              lastFrameTime: maximumTime,
              isLiveVideo: this.isLiveVideo,
              isPaused,
            };
            clientWS.send(JSON.stringify(responseMessage));
          });

          this.clientsWaitingToSync = [];
          Object.values(this.clients).forEach((client) => {
            client.ackedSyncRequest = false;
          });

          break;
        }
        case 'syncRequest':
          this.numResponsesRequested = Object
            .keys(this.clients).length - 1;
          this.numSyncResponses = 0;
          this.clientsWaitingToSync.push(ws);

          //if there are clients waiting then we are already doing a syncrequest
          //but we still have to do another if they want one
          Object.values(this.clients).forEach((client) => {
            if(client.id == ws.id) return;
            client.websocket.send(rawdata);
            client.ackedSyncRequest = false;
          });
          break;
        case 'syncToMe': {
          this.broadcastMessage(rawdata, ws);
          break;
        }
        case 'clientStatus': {
          const status = Object.values(this.clients)
            .map((x) => ({
              name: x.name,
              lastFrameTime: x.lastFrameTime,
            }));
          ws.send(JSON.stringify({ flag: 'clientStatus', status }));
          break;
        }
        case 'ping': {
          this.clients[ws.id].update(data);
          const currentlyTyping = [];
          Object.values(this.clients).filter((c) => c.isActiveTyping).map((c) => c.name);
          const streamToName = {};

          Object.values(this.clients).forEach((client) => {
            if(client.isActiveTyping) currentlyTyping.push(client.name);
            Object.keys(client.streams).forEach((streamId) => { streamToName[streamId] = client.name; });
          });
          ws.send(JSON.stringify({ flag: 'pong', currentlyTyping, streamToName }));
          break;
        }
        default:
          //default is to echo the data to everyone
          this.broadcastMessage(rawdata, ws);
      }
    });

    clientObject.webrtcConnection.on('signal', (signal) => {
      const rawdata = JSON.stringify({
        flag: 'webrtcSignal',
        signal,
      });
      ws.send(rawdata);
    });

    clientObject.webrtcConnection.on('stream', (stream) => {
      //delete old streams from the local storage and remote clients
      const rawdata = JSON.stringify({
        flag: 'removeStreams',
        streamIds: Object.keys(clientObject.streams),
      });
      clientObject.streams = {};
      this.broadcastMessage(rawdata, ws);

      //save and broadcast the new stream to everyone
      clientObject.streams[stream.id] = stream;
      Object.values(this.clients).forEach((client) => {
        if(client.id === ws.id) return;
        client.webrtcConnection.addStream(stream);
      });
    });

    clientObject.webrtcConnection.on('connect', () => {
      Object.values(this.clients).forEach((client) => {
        if(client.id === clientObject.id) return;
        Object.values(client.streams).forEach((stream) => {
          clientObject.webrtcConnection.addStream(stream);
        });
      });
    });

    clientObject.webrtcConnection.on('error', () => {});
    clientObject.webrtcConnection.on('close', () => {
      const rawdata = JSON.stringify({
        flag: 'removeStreams',
        streamIds: Object.keys(clientObject.streams),
      });
      clientObject.webrtcConnection.destroy();
      this.broadcastMessage(rawdata, ws);
    });
  }

  broadcastMessage(rawdata, ws) {
    Object.values(this.clients).forEach((client) => {
      if(ws && client.id === ws.id) return;
      client.websocket.send(rawdata);
    });
  }

  destroy() {
    Object.values(this.clients).forEach((client) => {
      client.webrtcConnection.destroy();
    });
    this.mediaStream.kill();
  }
}

export { ClientGroupManager };
