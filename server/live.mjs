import url from 'url';
import WebSocket from 'ws';
const liveWS = new WebSocket.Server({ noServer: true });

let syncTimings = [];
let clientsWaitingToSync = []

liveWS.on('connection', function connection(ws, request) {
  const streamName = url.parse(request.url).pathname.split('/')[2];

  ws.on('message', function incoming(rawdata) {
    const data = JSON.parse(rawdata);

    switch(data.flag) {
      case 'sync-response':
        // -1 so we ignore the original requester and don't wait for them to respond
        let numClients = -1;
        liveWS.clients.forEach(client => {if(client.readyState === WebSocket.OPEN) numClients++});

        syncTimings.push(data);
        if(syncTimings.length == numClients) {
          let minimumTime = Number.MAX_SAFE_INTEGER;
          syncTimings.forEach(timing => {
            if(!timing.synced) return;

            minimumTime = Math.min(minimumTime, timing.time)
          })
          if(minimumTime == Number.MAX_SAFE_INTEGER) break;
          clientsWaitingToSync.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              const responseMessage = {flag:'sync-response', time:minimumTime}
              client.send(JSON.stringify(responseMessage));
            }
          });
          
          clientsWaitingToSync = [];
        }

        break;
      case 'sync-request':
        syncTimings = [];  
        clientsWaitingToSync.push(ws)
        liveWS.clients.forEach(function each(client) {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(rawdata);
          }
        });
        break;
      default:
        liveWS.clients.forEach(function each(client) {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(rawdata);
          }
        });
    }
  });
});

export default liveWS;