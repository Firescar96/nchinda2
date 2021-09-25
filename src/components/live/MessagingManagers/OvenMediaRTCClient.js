class OvenMediaRTCClient {
  constructor(videoController) {
    this.videoController = videoController;
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.services.mozilla.com' },
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    }, null);
    this.initializeWS();
  }

  initializeWS() {
    //signalWS connects to OvenMediaPlayer to negotiate a WebRTC connection to get stream data
    this.signalWS = new WebSocket('wss://nchinda2.com:3334/live/lobby');

    this.signalWS.onmessage = this.gotMessageFromServer.bind(this);

    this.signalWS.onopen = () => {
      this.signalWS.send(JSON.stringify({ command: 'request_offer' }));
    };
  }

  async gotMessageFromServer(message) {
    const messageData = JSON.parse(message.data);
    if(messageData.command !== 'offer') return;

    if(this.peerConnection.iceConnectionState === 'new') {
      this.peerConnection.onicecandidate = this.gotIceCandidate.bind(this);

      this.videoController.livePlayer.srcObject = new MediaStream();
      this.peerConnection.ontrack = (event) => {
        event.track.enabled = !this.videoController.isLivePaused; //without this audio output will start immediately when users join the stream
        this.videoController.livePlayer.srcObject.addTrack(event.track);
      };

      this.peerConnection.onconnectionstatechange = this.onconnectionstatechange.bind(this);
    }

    this.uuid = messageData.id;
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(messageData.sdp));

    messageData.candidates.forEach(async (candidate) => {
      await this.peerConnection.addIceCandidate(candidate);
    });

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    this.signalWS.send(JSON.stringify({
      command: 'answer',
      id: this.uuid,
      sdp: answer,
    }));
  }

  onconnectionstatechange() {
    const repeaterID = setInterval(() => {
      if(this.peerConnection.connectionState === 'disconnected') {
        this.peerConnection.close();
        this.peerConnection = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.services.mozilla.com' },
            { urls: 'stun:stun.l.google.com:19302' },
          ],
        }, null);
        this.initializeWS();
        return;
      }

      clearInterval(repeaterID);
      if(!this.videoController.isLivePaused) {
        this.videoController.livePlayer.play();
      }
    }, 500);
  }

  gotIceCandidate(event) {
    if(event.candidate === null) return;
    this.signalWS.send(JSON.stringify({
      command: 'candidate',
      id: this.uuid,
      candidates: [event.candidate],
    }));
  }
}

export default OvenMediaRTCClient;
