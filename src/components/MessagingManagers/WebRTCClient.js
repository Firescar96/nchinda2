/**
 * WebRTCClient is currently unused but may be used in the future for a video alternative to text chat
 * The messaging manager creates an instance and connect but doesn't do anything with it
 */

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
