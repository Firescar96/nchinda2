import childProcess from 'child_process';
import { WSClient } from './WSClient.mjs';
import WebrtcClient from './WebrtcClient.mjs';

class ClientGroupManager {
  constructor(name) {
    this.name = name;
    this.clients = {};
    this.rtcClients = {};
    this.isLiveVideo = true;
    this.clientsWaitingToSync = []; //clients who have requested a timecheck
    this.numResponsesRequested = 0; //number of clients we need to respond to get an estimate of the time to sync to
    this.liveVideoMoov = []; //save the first output from ffmpeg, for initializing new clients

    this.initializeLiveTranscoder();
  }

  initializeLiveTranscoder(name) {
    //helpful documentation on ffmpeg streaming https://trac.ffmpeg.org/wiki/StreamingGuide
    //and on some flags https://ffmpeg.org/ffmpeg-all.html#rtsp
    //what do the numbers in an avc codec mean https://lists.ffmpeg.org/pipermail/ffmpeg-user/2015-October/028984.html
    //https://stackoverflow.com/questions/48588511/prepare-mp4-videos-for-media-source-extensions-api-using-ffmpeg
    //a pretty complete list of ffmpeg flags https://gist.github.com/tayvano/6e2d456a9897f55025e25035478a3a50
    const mediaSpawnOptions = [
      '-re', //realtime? I heard it's good for livestreams and bad for writing to a file, streaming doesn't seem to work without it, the output is more regular with this flag
      '-i',
      `rtmp://nchinda2.com/live/${this.name}`,
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
      //-tune zerolatency left out, doesn't seem to do anything
      '-f',
      'mp4', //use the mp4 container
      //https://stackoverflow.com/questions/16658873/how-to-minimize-the-delay-in-a-live-streaming-with-ffmpeg none of these seem to have an affect
      //none of these options that are supposed to speedup seem to do anything
      //-flags cgop+low_delay non of these flags work
      '-x264opts',
      'keyint=2', //lower keyint than this significantly hurts quality
      '-preset',
      'ultrafast',
      '-pix_fmt',
      'yuv420p', //required for browsers to be able to play this
      '-reset_timestamps',
      '1', //this syncs up the timestamps when fragments are received in the browser
      '-movflags',
      'frag_keyframe+empty_moov+omit_tfhd_offset+default_base_moof+disable_chpl', //empty_moov empirically seems to help make sure only the first two blocks of data from ffmpeg are required for initialization
      '-profile:v',
      'main', //changes the codec
      '-level:v',
      '3.2', //changes the codec
      //it seems like after the reset_timestamps the buffer gets filled to fast if this isn't kept the same
      //'-g', //change Group of Picture size, default of 12 is too long -> image stuttering in live video, and long start time latency
      //'12', //lower number changes quality too much, and increases the amount of work the encoder/decoder have to do
      '-b:a',
      '128k', //random internet sources say don't go above this
      '-codec:v',
      'h264',
      '-codec:a',
      'aac',
      '-',
    ];

    this.mediaStream = childProcess.spawn('ffmpeg', mediaSpawnOptions, {
      detached: false,
      //if we don't ignore stdin then ffmpeg will stop and show a control panel with a 'c' comes up in the output
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    const liveStreamCallback = (data) => {
      const rawdata = JSON.stringify({
        flag: 'liveStreamData',
        data: data.toJSON().data,
      });
      //the required number of init segments needed empirically seems to be related to the GoP, like maybe gop+1 or gop+2?
      if(this.liveVideoMoov.length < 2) this.liveVideoMoov.push(rawdata);
      this.broadcastRTCMessage(rawdata);
    };
    this.mediaStream.stdout.on('data', liveStreamCallback);

    //setInterval(() => {
    //liveStreamCallback({ toJSON() { return { data: 'my data' }; } });
    //}, 500);
  }

  addClient(ws) {
    //ws shouldn't be in the global scope of arguments, but must be scoped to this function
    this.clients[ws.id] = new WSClient(ws);

    if(this.liveVideoMoov) this.liveVideoMoov.forEach((x) => ws.send(x));

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
          this.rtcClients[ws.id].client.signal(data.signal);
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
          const currentlyTyping = Object.values(this.clients).filter((c) => c.isActiveTyping).map((c) => c.name);

          ws.send(JSON.stringify({ flag: 'pong', currentlyTyping }));
          break;
        }
        default:
          //default is to echo the data to everyone
          this.broadcastMessage(rawdata, ws);
      }
    });

    const rtcClient = new WebrtcClient();
    this.rtcClients[ws.id] = rtcClient;

    rtcClient.client.on('signal', (signal) => {
      const rawdata = JSON.stringify({
        flag: 'webrtcSignal',
        signal,
      });
      ws.send(rawdata);
    });
  }

  broadcastMessage(rawdata, ws) {
    Object.values(this.clients).forEach((client) => {
      if(ws && client.id == ws.id) return;
      client.websocket.send(rawdata);
    });
  }

  broadcastRTCMessage(rawdata, ws) {
    Object.values(this.rtcClients).forEach((client) => {
      if(ws && client.id == ws.id) return;
      if(!client.client.connected) return;
      client.client.send(rawdata);
    });
  }

  destroy() {
    Object.values(this.rtcClients).forEach((client) => {
      client.client.destroy();
    });
    //this.videoStream.kill('SIGINT');
    //this.audioStream.kill('SIGINT');
    this.mediaStream.kill();
  }
}

export { ClientGroupManager };
