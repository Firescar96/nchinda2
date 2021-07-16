/**
 * WebRTCClient is currently unused but may be used in the future for a video alternative to text chat
 * The messaging manager creates an instance and connect but doesn't do anything with it
 */

class WebRTCClient {
  constructor(sendMessage, receiveData) {
    this.client = new SimplePeer({
      initiator: true,
      trickle: false,
    });
    this.stream = null;

    this.client.on('error', (err) => console.log('error', err));

    this.client.on('data', receiveData);

    this.client.on('stream', (stream) => {
      this.stream = stream;
    });

    this.client.on('error', (err) => { console.log('rtc error', err); });

    //navigator.mediaDevices.getUserMedia({
    //video: true,
    //audio: true,
    //}).then((stream) => {
    //console.log('create new stream');
    //this.client.addStream(stream);
    //});
    //video.tech().el().srcObject = webrtcClient.stream
  }
}

export default WebRTCClient;
