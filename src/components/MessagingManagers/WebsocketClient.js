import engineio from 'engine.io-client';

class WebsocketClient {
  constructor(lobbyName, sendMessage, receiveData) {
    this.lobbyName = lobbyName;
    this.sendMessage = sendMessage;
    this.receiveData = receiveData;

    const route = new URL(window.location.href);
    route.protocol = route.protocol.replace('http', 'ws');
    if(route.port) route.port = 8080;

    this.connection = engineio(route.href, { transports: ['websocket'] });
    //join can only be issued once and determines which group of viewers is joined
    //a future implementation will allow different groups to all watch the same stream
    this.connection.send(JSON.stringify({ flag: 'join', name: this.lobbyName }));

    this.connection.on('message', this.receiveData);

    this.connection.on('open', () => {
      setInterval(() => {
        this.sendMessage({ flag: 'ping', name: this.myName });
      }, 500);

      this.sendMessage({ flag: 'peerConnect', name: this.myName });
    });
  }
}

export default WebsocketClient;
