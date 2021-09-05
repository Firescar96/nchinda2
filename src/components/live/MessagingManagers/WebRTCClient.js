import Component from 'vue-class-component';
import { shallowReactive } from '@vue/composition-api';

const { SimplePeer } = window;

@Component({
  props: {
    videoController: Object,
    websocketConnection: Object,
  },
  setup() {
    return {
      audioInputs: shallowReactive([]),
      audioOutputs: shallowReactive([]),
      streamToName: shallowReactive({}),
    };
  },
})
class WebRTCClient {
  created() {
    this.connection = new SimplePeer({
      initiator: false,
      trickle: false,
    });

    //it's important this stream handler is placed early on, before the signal handler so we don't miss any messages from peers
    this.connection.on('stream', (stream) => {
      this.videoController.$set(this.videoController.peerStreams, this.videoController.peerStreams.length, {
        stream,
        volume: 1,
      });
    });

    this.connection.on('error', (err) => console.log('websocket error', err));

    this.connection.on('signal', (signal) => {
      const rawdata = JSON.stringify({
        flag: 'webrtcSignal',
        signal,
      });
      this.websocketConnection.send(rawdata);
    });

    this.setupMediaSources();
  }

  async setupMediaSources() {
    this.selectedStream = new MediaStream();

    await this.gotDevices();
  }

  async gotDevices() {
    const deviceInfos = await navigator.mediaDevices.enumerateDevices();
    //Handles being called several times to update labels. Preserve values.
    this.audioInputs = [];
    this.audioOutputs = [];

    for(let i = 0; i !== deviceInfos.length; ++i) {
      const deviceInfo = deviceInfos[i];
      const option = {
        value: deviceInfo.deviceId,
      };
      if(deviceInfo.kind === 'audioinput') {
        option.label = deviceInfo.label || `microphone ${this.audioInputs.length + 1}`;
        this.audioInputs.push(option);
      } else if(deviceInfo.kind === 'audiooutput') {
        option.label = deviceInfo.label || `speaker ${this.audioOutputs.length + 1}`;
        this.audioOutputs.push(option);
      }
    }
  }

  //Attach audio output device to video element using device/sink ID.
  changeAudioSink(audioDestination) {
    if(!this.videoController.$refs.peerVideo) return;
    this.videoController.$refs.peerVideo.forEach((videoElement) => {
      if(typeof videoElement.sinkId !== 'undefined') {
        videoElement.setSinkId(audioDestination);
      } else {
        console.warn('Browser does not support output device selection.');
      }
    });
  }

  async gotStream(stream) {
    this.connection.removeStream(this.selectedStream);
    this.selectedStream = stream;
    this.connection.addStream(stream);
  }

  async changeAudioSource(audioSource) {
    const constraints = {
      audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    await this.gotStream(stream);
    await this.gotDevices();
  }
}

export default WebRTCClient;
