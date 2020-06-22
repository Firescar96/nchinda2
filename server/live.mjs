import url from 'url';
import WebSocket from 'ws';
const liveWS = new WebSocket.Server({ noServer: true });

liveWS.on('connection', function connection(ws, request) {
  const streamName = url.parse(request.url).pathname.split('/')[2];

  ws.on('message', function incoming(data) {
    liveWS.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});

export default liveWS;