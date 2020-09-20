import SimplePeer from 'simple-peer';
import wrtc from 'wrtc';
import { WSClient } from './client.mjs';

class ClientGroupManager {
  constructor(name) {
    this.name = name;
    this.clients = {};
    this.clientsWaitingToSync = []; //clients who have requested a timecheck
    this.numResponsesRequested = 0; //number of clients we need to respond to get an estimate of the time to sync to
  }

  addClient(ws) {
    //ws shouldn't be in the global scope of arguments, but must be scoped to this function
    this.clients[ws.id] = new WSClient(ws);

    ws.on('close', () => {
      Object.values(this.clients).forEach((client) => {
        const message = { flag: 'peerDisconnect', name: this.clients[ws.id].name, lastFrameTime: client.lastFrameTime };
        client.websocket.send(JSON.stringify(message));
      });
      delete this.clients[ws.id];
    });

    ws.on('open', () => {
      console.log('hello world');
    });

    const webrtcClient = new SimplePeer({
      initiator: true,
      trickle: false,
      wrtc,
    });

    webrtcClient.on('signal', (signal) => {
      const data = {
        flag: 'webrtcSignal',
        signal,
      };
      console.log('signal', data);
      ws.send(JSON.stringify(data));
    });

    webrtcClient.on('data', (data) => {
      console.log('got message', data);
    });

    webrtcClient.on('stream', (stream) => {
      console.log('add new stream');
      webrtcClient.addStream(stream);
    });

    webrtcClient.on('error', (err) => { console.log('rtc error', err); });

    ws.on('message', (rawdata) => {
      const data = JSON.parse(rawdata);
      if(!this.clients[ws.id]) return;
      switch(data.flag) {
        case 'webrtcSignal':
          console.log('webrtcSignal', data);
          webrtcClient.signal(data.signal);
          break;
        case 'syncResponse':
          this.clients[ws.id].lastFrameTime = data.lastFrameTime;
          this.clients[ws.id].isPaused = data.isPaused;
          this.clients[ws.id].ackedSyncRequest = true;

          const numSyncResponses = Object.values(this.clients).reduce((a, b) => (b.ackedSyncRequest ? a + 1 : a), 0);

          if(numSyncResponses < this.numResponsesRequested) break;

          let minimumTime = Number.MAX_SAFE_INTEGER;
          let isPaused = false;
          Object.values(this.clients).forEach((client) => {
            if(!client.ackedSyncRequest) return;

            minimumTime = Math.min(minimumTime, client.lastFrameTime);
            isPaused |= client.isPaused;
          });
          if(minimumTime == Number.MAX_SAFE_INTEGER) break;
          this.clientsWaitingToSync.forEach((clientWS) => {
            const responseMessage = {
              flag: 'syncResponse',
              lastFrameTime: minimumTime,
              isPaused,
            };
            clientWS.send(JSON.stringify(responseMessage));
          });

          this.clientsWaitingToSync = [];
          Object.values(this.clients).forEach((client) => {
            client.ackedSyncRequest = false;
          });

          break;
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
        case 'clientStatus':
          const status = Object.values(this.clients)
            .map((x) => ({
              name: x.name,
              lastFrameTime: x.lastFrameTime,
            }));
          ws.send(JSON.stringify({ flag: 'clientStatus', status }));
        case 'ping':
          this.clients[ws.id].update(data);
          ws.send(JSON.stringify({ flag: 'pong' }));
          break;
        default:
          //default is to echo the data to everyone
          this.broadcastMessage(rawdata, ws);
      }
    });
  }

  broadcastMessage(rawdata, ws) {
    Object.values(this.clients).forEach((client) => {
      if(client.id == ws.id) return;
      client.websocket.send(rawdata);
    });
  }
}

export { ClientGroupManager };
