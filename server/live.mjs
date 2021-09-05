import engineio from 'engine.io';
import { httpServer, httpsServer } from './server.mjs';
import { ClientGroupManager } from './ClientGroupManager.mjs';

const liveWS = engineio();

liveWS.attach(httpServer, {
  pingTimeout: 2000,
  pingInterval: 4000,
  transports: ['websocket'],
});

liveWS.attach(httpsServer, {
  pingTimeout: 2000,
  pingInterval: 4000,
  transports: ['websocket'],
});

const streamClients = {};
function onConnection(socket) {
  socket.once('message', (data) => {
    const message = JSON.parse(data);
    socket.roomName = message.name;
    streamClients[message.name] = streamClients[message.name] || new ClientGroupManager(message.name);
    streamClients[message.name].addClient(socket);
  });

  socket.on('close', () => {
    setTimeout(() => {
      if(!streamClients[socket.roomName]) return;
      //if this is the last client delete all history of this room
      if(Object.keys(streamClients[socket.roomName].clients).length === 1) {
        streamClients[socket.roomName].destroy();
        delete streamClients[socket.roomName];
      }
    },
    10000);
  });
}

liveWS.on('connection', onConnection);
