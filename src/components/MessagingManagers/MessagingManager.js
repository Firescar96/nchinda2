import WebsocketClient from './WebsocketClient';
import WebRTCClient from './WebRTCClient';
import constants from '../constants';

const { SKIP_BACK_SECONDS } = constants;

class MessagingManager {
  constructor(lobbyName, myName, videoController) {
    this.lobbyName = lobbyName;
    this.myName = myName;
    this.videoController = videoController;
    this.streamJoined = false;
    this.websocketClient = new WebsocketClient(lobbyName, this.sendMessage.bind(this), this.receiveData.bind(this));
    this.videoBuffer = [];
    this.isActiveTyping = false;
    this.webrtcClient = new WebRTCClient(this.sendMessage.bind(this), this.receiveData.bind(this));
    this.webrtcClient.peerConnection.ontrack = (event) => {
      this.videoController.livePlayer.srcObject.addTrack(event.track);
    };

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
    //add required parameters to each message
    if(this.videoController.isLiveVideo) message.lastFrameTime = this.videoController.livePlayer.currentTime;
    else message.lastFrameTime = this.videoController.video.currentTime();
    message.isActiveTyping = this.isActiveTyping;
    message.name = this.myName;

    //send it
    this.websocketClient.connection.send(JSON.stringify(message));

    if(message.action === 'syncAction') {
      message.isMeta = true;
      this.videoController.displayMessage(message);
    }
  }

  receiveData(data) {
    const message = JSON.parse(data);

    if(message.flag == 'pong') {
      this.videoController.currentlyTyping = message.currentlyTyping;
    }

    if(message.flag == 'liveStreamData') {
      this.videoBuffer = this.videoBuffer.concat(message.data);

      return;
    }

    //Coming Soon
    if(message.flag == 'webrtcSignal') {
      //this.webrtcClient.client.signal(message.signal);
      return;
    }

    if(message.flag === 'syncRequest' && this.streamJoined) {
      const isPaused = this.videoController.isLiveVideo ? this.videoController.livePlayer.paused : this.videoController.video.paused();
      this.sendMessage({
        flag: 'syncResponse',
        isPaused,
        isLiveVideo: this.videoController.isLiveVideo,
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

    if(message.flag === 'seekToLive') this.videoController.switchToLive();
    if(message.flag === 'seekToUnlive') this.videoController.switchToUnlive();

    if(message.flag == 'syncResponse') {
      if(this.videoController.isLiveVideo != message.isLiveVideo) {
        if(message.isLiveVideo) this.videoController.switchToLive();
        else this.videoController.switchToUnlive();
      }
    }

    if(['play', 'pause', 'seek', 'seekBack', 'seekForward', 'seekToLive', 'syncResponse', 'syncToMe'].includes(message.flag) && this.streamJoined) {
      if(!this.videoController.isLiveVideo) {
        this.videoController.video.currentTime(message.lastFrameTime);
      }
      //!! is required to ensure isPaused is cast to a boolean
      if(this.streamJoined && 'isPaused' in message) {
        const action = message.isPaused ? 'pause' : 'play';
        if(this.videoController.isLiveVideo) {
          this.videoController.livePlayer[action]();
          this.videoController.livePlayer.currentTime = this.videoController.livePlayer.seekable.end(0);
        } else this.videoController.video[action]();
      }
    }

    if(['play', 'pause', 'seek', 'seekBack', 'seekForward', 'seekToLive', 'seekToUnlive'].includes(message.flag)) {
      message.isMeta = true;
      message.action = 'syncAction';
    }

    if(['pong', 'syncRequest', 'syncResponse', 'syncToMe', 'liveStreamData'].includes(message.flag)) return;
    this.videoController.displayMessage(message);
  }
}
export default MessagingManager;
