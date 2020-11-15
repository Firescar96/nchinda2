import WebsocketClient from './WebsocketClient';
import WebRTCClient from './WebRTCClient';
import constants from '../constants';

const { SKIP_BACK_SECONDS } = constants;

class MessagingManager {
  constructor(lobbyName, myName, video, displayMessage, livePlayer, switchToLive, switchToUnlive) {
    this.lobbyName = lobbyName;
    this.myName = myName;
    this.isLiveVideo = true;
    this.streamJoined = false;
    this.video = video;
    this.livePlayer = livePlayer;
    this.switchToLive = switchToLive;
    this.switchToUnlive = switchToUnlive;
    this.displayMessage = displayMessage;
    this.webrtcClient = new WebRTCClient();
    this.websocketClient = new WebsocketClient(lobbyName, this.sendMessage.bind(this), this.receiveData.bind(this));

    this.webrtcClient.client.on('signal', (signal) => {
      this.sendMessage({ flag: 'webrtcSignal', signal });
    });


    //save the eventhandlers so they can be en/disabled dynamically
    this.eventHandlers = {
      play: (e) => this.sendMessage({ flag: 'play', isPaused: false, action: 'syncAction' }),
      pause: () => this.sendMessage({ flag: 'pause', isPaused: true, action: 'syncAction' }),
      seek: () => this.sendMessage({ flag: 'seek', replace: true, action: 'syncAction' }),
      seekForward: () => this.sendMessage({ flag: 'seekForward', action: 'syncAction' }),
      seekBack: () => this.sendMessage({ flag: 'seekBack', action: 'syncAction' }),
      seekToLive: () => this.sendMessage({ flag: 'seekToLive', action: 'syncAction' }),
    };
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
      this.livePlayer.source.write(messageData);
      return;
    }

    if(message.flag == 'webrtcSignal') {
      this.webrtcClient.client.signal(message.signal);
      return;
    }

    if(message.flag === 'syncRequest' && this.streamJoined) {
      const isPaused = this.isLiveVideo ? this.livePlayer.paused : this.video.paused();
      this.sendMessage({
        flag: 'syncResponse',
        isPaused,
        isLiveVideo: this.isLiveVideo,
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

    console.log('message.flag', message)
    if(message.flag == 'seekToLive') this.switchToLive();
    if(message.flag == 'seekToUnlive') this.switchToUnlive();
    
    if(['play', 'pause', 'seek', 'seekBack', 'seekForward', 'seekToLive', 'syncResponse'].includes(message.flag) && this.streamJoined) {
      console.log('syncRequest', message)
      this.video.currentTime(message.lastFrameTime);
      
      //!! is required to ensure isPaused is cast to a boolean
      if(this.streamJoined && 'isPaused' in message) {
        const action = message.isPaused ? 'pause' : 'play';

        //adding this in the propagation chain stops event propagating
        this.video.one(action, (e) => e.stopImmediatePropagation());

        //the event must be removed and readded so it comes after the 'one' event that will disable it in the propagation chain
        this.video.off(action, this.eventHandlers[action]);
        this.video.on(action, this.eventHandlers[action]);
        //TODO: hello uncomment the above
        console.log('this.isLiveVideo', this.isLiveVideo)
        if(this.isLiveVideo) this.livePlayer[action]();
        else this.video[action]();
      }
    }

    if(['play', 'pause', 'seek', 'seekBack', 'seekForward', 'seekToLive', 'seekToUnlive'].includes(message.flag)) {
      message.isMeta = true;
      message.action = 'syncAction';
    }

    if(['pong', 'syncRequest', 'syncResponse'].includes(message.flag)) return;
    this.displayMessage(message);
  }
}
export default MessagingManager;
