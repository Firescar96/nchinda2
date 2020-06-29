import url from 'url';
import engineio from 'engine.io';
import { httpServer, httpsServer, httpsPort } from './server.mjs';
import { WSClient } from './client.mjs';
const liveWS = engineio.attach(httpsServer, {
  pingTimeout: 2000,
  pingInterval: 10000,
  transports: ['websocket'],
});


class ClientGroupManager {
  constructor(name) {
    this.name = name;
    this.clients = {};
    this.clientsWaitingToSync = [] // clients who have requested a timecheck
    this.numResponsesRequested = 0; //number of clients we need to respond to get an estimate of the time to sync to
  }

  addClient(ws) {
    // ws shouldn't be in the global scope of arguments, but must be scoped to this function
    this.clients[ws.id] = new WSClient(ws);

    ws.on('close', () => {
      delete this.clients[ws.id];
    })

    ws.on('message', (rawdata) => {
      const data = JSON.parse(rawdata);
      if (!this.clients[ws.id]) return;
      switch (data.flag) {
        case 'sync-response':
          this.clients[ws.id].lastFrameTime = data.lastFrameTime;
          this.clients[ws.id].ackedSyncRequest = true;

          const numSyncResponses = Object.values(this.clients).reduce((a, b) => b.ackedSyncRequest ? a + 1 : a, 0)

          if (numSyncResponses < this.numResponsesRequested) break;

          let minimumTime = Number.MAX_SAFE_INTEGER;
          Object.values(this.clients).forEach(client => {
            if (!client.ackedSyncRequest) return;

            minimumTime = Math.min(minimumTime, client.lastFrameTime)
          })
          if (minimumTime == Number.MAX_SAFE_INTEGER) break;
          this.clientsWaitingToSync.forEach(clientWS => {
            const responseMessage = { flag: 'sync-response', lastFrameTime: minimumTime }
            clientWS.send(JSON.stringify(responseMessage))
          });

          this.clientsWaitingToSync = [];
          Object.values(this.clients).forEach((client) => {
            client.ackedSyncRequest = false
          });

          break;
        case 'sync-request':
          this.numResponsesRequested = Object
            .keys(this.clients).length - 1;
          this.numSyncResponses = 0;
          this.clientsWaitingToSync.push(ws)

          //if there are clients waiting then we are already doing a syncrequest
          //but we still have to do another if they want one
          Object.values(this.clients).forEach((client) => {
            if (client.id == ws.id) return;
            client.websocket.send(rawdata);
            client.ackedSyncRequest = false
          });
          break;
        case 'ping':
          this.clients[ws.id].update(data)
          ws.send(JSON.stringify({ flag: 'pong' }))
          break;
        // default is to echo the data to everyone
        default:
          Object.values(this.clients).forEach((client) => {
            if (client.id == ws.id) return;
            client.websocket.send(rawdata);
          });
      }
    });
  }
}

const streamClients = {}

liveWS.on('connection', function connection(socket) {
  socket.once('message', (data) => {
    const message = JSON.parse(data)
    streamClients[message.name] = streamClients[message.name] || new ClientGroupManager(message.name);
    streamClients[message.name].addClient(socket);
  })
});

export default liveWS;