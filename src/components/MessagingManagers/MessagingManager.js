import WebsocketClient from './WebsocketClient';
import WebRTCClient from './WebRTCClient';
import constants from '../constants';

const { SKIP_BACK_SECONDS } = constants;

class MessagingManager {
  constructor(lobbyName, myName, video, displayMessage, mpegPlayer) {
    this.lobbyName = lobbyName;
    this.myName = myName;
    this.video = video;
    this.mpegPlayer = mpegPlayer;
    this.displayMessage = displayMessage;
    this.webrtcClient = new WebRTCClient();
    this.websocketClient = new WebsocketClient(this.sendMessage.bind(this), this.receiveData.bind(this));

    this.webrtcClient.client.on('signal', (signal) => {
      this.sendMessage({ flag: 'webrtcSignal', signal });
    });
  }

  sendMessage(message) {
    message.lastFrameTime = this.video.currentTime();
    message.name = this.myName;
    this.websocketClient.connection.send(JSON.stringify(message));

    if(message.action === 'syncAction') {
      message.isMeta = true;
      this.displayMessage(message);
    }
  }

  receiveData(data) {
    const message = JSON.parse(data);

    if(message.flag == 'liveStreamData') {
      const messageData = new Uint8Array(message.data).buffer;
      this.mpegPlayer.source.write(messageData);
      return;
    }

    if(message.flag == 'webrtcSignal') {
      this.webrtcClient.client.signal(message.signal);
      return;
    }

    if(message.flag === 'syncRequest' && this.firstPlaySync) {
      this.sendMessage({
        flag: 'syncResponse',
        isPaused: this.video.paused(),
      });
    }

    if(message.flag === 'clientStatus') {
      Object.assign(message, {
        isMeta: true,
        action: 'clientStatus',
        status: message.status,
      });
    }

    if(message.flag === 'peerDisconnect') {
      Object.assign(message, {
        isMeta: true,
        action: 'peerDisconnect',
        time: message.lastFrameTime - SKIP_BACK_SECONDS,
      });
    }

    if(message.flag === 'peerConnect') {
      Object.assign(message, {
        isMeta: true,
        action: 'peerConnect',
      });
    }

    if(['play', 'pause', 'seek', 'seekBack', 'seekForward', 'seekToLive', 'syncResponse'].includes(message.flag) && this.firstPlaySync) {
      this.video.currentTime(message.lastFrameTime);

      //!! is required to ensure isPaused is cast to a boolean
      if(this.firstPlaySync && 'isPaused' in message && !!message.isPaused !== this.video.paused()) {
        const action = message.isPaused ? 'pause' : 'play';

        //adding this in the propagation chain stops event propagating
        this.video.one(action, (e) => e.stopImmediatePropagation());

        //the event must be removed and readded so it comes after the 'one' event that will disable it in the propagation chain
        //this.video.off(action, eventHandlers[action]);
        //this.video.on(action, eventHandlers[action]);
        //TODO: hello uncomment the above
        this.video[action]();
      }
    }

    if(['play', 'pause', 'seek', 'seekBack', 'seekForward', 'seekToLive'].includes(message.flag)) {
      message.isMeta = true;
      message.action = 'syncAction';
    }

    if(['pong', 'syncRequest', 'syncResponse'].includes(message.flag)) return;
    this.displayMessage(message);
  }
}
export default MessagingManager;
