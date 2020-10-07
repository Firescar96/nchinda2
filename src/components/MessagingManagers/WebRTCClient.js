import SimplePeer from 'simple-peer';

class WebRTCClient {
  constructor() {
    this.client = new SimplePeer({
      trickle: false,
    });
    this.stream = null;

    this.client.on('error', (err) => console.log('error', err));

    this.client.on('data', (data) => {
      console.log(`data: ${data}`);
    });

    this.client.on('stream', (stream) => {
      console.log('stream found', stream);
      this.stream = stream;
    });

    this.client.on('error', (err) => { console.log('rtc error', err); });

    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    }).then((stream) => {
      console.log('create new stream');
      this.client.addStream(stream);
    });
  }
}

export default WebRTCClient;
