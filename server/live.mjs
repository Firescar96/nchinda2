import engineio from 'engine.io';
import { httpServer, httpsServer } from './server.mjs';
import { ClientGroupManager } from './ClientGroupManager.mjs';

const liveWS = engineio();

liveWS.attach(httpServer, {
  pingTimeout: 2000,
  pingInterval: 10000,
  transports: ['websocket'],
});

liveWS.attach(httpsServer, {
  pingTimeout: 2000,
  pingInterval: 10000,
  transports: ['websocket'],
});


const streamClients = {}
function onConnection(socket) {
  socket.once('message', (data) => {
    const message = JSON.parse(data)
    streamClients[message.name] = streamClients[message.name] || new ClientGroupManager(message.name);
    streamClients[message.name].addClient(socket);
  })
}

liveWS.on('connection', onConnection);