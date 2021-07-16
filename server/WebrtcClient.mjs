import wrtc from 'wrtc';
import SimplePeer from 'simple-peer';

const {
  RTCVideoSource, RTCVideoSink, RTCAudioSource, RTCAudioSink,
} = wrtc.nonstandard;

class WebrtcClient {
  constructor() {
    this.client = new SimplePeer({
      wrtc,
    });

    this.client.on('data', (data) => {
      console.log('got message', data);
    });

    this.client.on('stream', (stream) => {
      console.log('add new stream');
      this.client.addStream(stream);
    });

    this.client.on('error', (err) => { console.log('rtc error', err); });

    const videoSource = new RTCVideoSource();
    const videoTrack = videoSource.createTrack();
    const videoSink = new RTCVideoSink(videoTrack);

    const width = 320;
    const height = 240;
    const videoData = new Uint8ClampedArray(width * height * 1.5);
    const frame = { width, height, data: videoData };

    setInterval(() => {
      //Update the frame in some way before sending.
      videoSource.onFrame(frame);
    });

    videoSink.onframe = ({ frame }) => {
      //Do something with the received frame.
    };

    const audioSource = new RTCAudioSource();
    const audioTrack = audioSource.createTrack();
    const audioSink = new RTCAudioSink(audioTrack);

    const sampleRate = 8000;
    const samples = new Int16Array(sampleRate / 100); //10 ms of 16-bit mono audio

    const audioData = {
      samples,
      sampleRate,
    };

    setInterval(() => {
      //Update audioData in some way before sending.
      audioSource.onData(audioData);
    });

    audioSink.ondata = (data) => {
      //Do something with the received audio samples.
    };

    //setTimeout(() => {
    //clearInterval(interval);
    //videoTrack.stop();
    //videoSink.stop();
    //audioTrack.stop();
    //audioSink.stop();
    //}, 10000);
  }
}

export default WebrtcClient;
