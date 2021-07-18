/**
 * WebRTCClient is currently unused but may be used in the future for a video alternative to text chat
 * The messaging manager creates an instance and connect but doesn't do anything with it
 */

class WebRTCClient {
  constructor(sendMessage, receiveData) {
    this.signalWS = new WebSocket('wss://nchinda2.com:3334/live/lobby');
    window.signalWS = this.signalWS;

    this.signalWS.onmessage = this.gotMessageFromServer.bind(this);

    this.signalWS.onopen = () => {
      this.signalWS.send(JSON.stringify({ command: 'request_offer' }));
    };

    //navigator.mediaDevices.getUserMedia({
    //video: true,
    //audio: true,
    //}).then((stream) => {
    //console.log('create new stream');
    //this.client.addStream(stream);
    //});
    //video.tech().el().srcObject = webrtcClient.stream

    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.services.mozilla.com' },
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    }, null);

    window.peerConnection = this.peerConnection;
    this.peerConnection.onicecandidate = this.gotIceCandidate.bind(this);
  }

  async gotMessageFromServer(message) {
    const signal = JSON.parse(message.data);

    switch(signal.command) {
      case 'offer': {
        this.uuid = signal.id;
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));

        signal.candidates.forEach(async (candidate) => {
          await this.peerConnection.addIceCandidate(candidate);
        });

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        this.signalWS.send(JSON.stringify({
          command: 'answer',
          id: this.uuid,
          sdp: answer,
        }));

        break;
      }
      default:
        break;
    }
  }

  gotIceCandidate(event) {
    if(event.candidate !== null) {
      this.signalWS.send(JSON.stringify({
        command: 'candidate',
        id: this.uuid,
        candidates: [event.candidate],
      }));
    }
  }
}

export default WebRTCClient;
