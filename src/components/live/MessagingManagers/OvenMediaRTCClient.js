class OvenMediaRTCClient {
  constructor(videoController) {
    //signalWS connects to OvenMediaPlayer to negotiate a WebRTC connection to get stream data
    this.signalWS = new WebSocket('wss://nchinda2.com:3334/live/lobby');

    this.signalWS.onmessage = this.gotMessageFromServer.bind(this);

    this.signalWS.onopen = () => {
      this.signalWS.send(JSON.stringify({ command: 'request_offer' }));
    };

    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.services.mozilla.com' },
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    }, null);

    this.peerConnection.onicecandidate = this.gotIceCandidate.bind(this);

    this.peerConnection.ontrack = (event) => {
      videoController.livePlayer.srcObject.addTrack(event.track);
    };
  }

  async gotMessageFromServer(message) {
    const messageData = JSON.parse(message.data);
    if(messageData.command !== 'offer') return;

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
