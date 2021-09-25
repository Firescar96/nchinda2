import Component from 'vue-class-component';
import { shallowRef } from '@vue/composition-api';

const { SimplePeer } = window;

@Component({
  props: {
    videoController: Object,
    websocketConnection: Object,
  },
  setup() {
    return {
      audioInputs: shallowRef([]),
      audioOutputs: shallowRef([]),
      streamToName: shallowRef({}),
      _audioInputEnabled: shallowRef(true),
    };
  },
})
class WebRTCClient {
  created() {
    this.selectedStream = null;

    this.setupWebRTCConnection();
    this.setupMediaSources();
  }

  setupWebRTCConnection() {
    this.connection = new SimplePeer({
      initiator: false,
      trickle: false,
    });

    //it's important this stream handler is placed early on, before the signal handler so we don't miss any messages from peers
    this.connection.on('stream', (stream) => {
      const audioContext = new AudioContext();
      const audioGainNode = audioContext.createGain();

      const audioSource = audioContext.createMediaStreamSource(stream);
      const audioDestination = audioContext.createMediaStreamDestination();
      audioSource.connect(audioGainNode);
      audioGainNode.connect(audioDestination);
      audioGainNode.gain.value = 0.5;
      window.stream = audioDestination.stream;
      //window.peer =
      this.videoController.$set(this.videoController.peerStreams, this.videoController.peerStreams.length, {
        stream, //original stream is used to track with peer is connected and eventually can be used for video
        audioStream: audioDestination.stream, //this supports gain
        volume: 0.5,
        audioGainNode,
      });
    });

    this.connection.on('error', () => this.setupWebRTCConnection());

    this.connection.on('signal', (signal) => {
      const rawdata = JSON.stringify({
        flag: 'webrtcSignal',
        signal,
      });
      this.websocketConnection.send(rawdata);
    });
  }

  get audioInputEnabled() {
    return this._audioInputEnabled;
  }

  set audioInputEnabled(mutedState) {
    if(!this.selectedStream) return;
    this.selectedStream.getAudioTracks().forEach((track) => {
      track.enabled = mutedState;
    });
    this._audioInputEnabled = mutedState;
  }

  async setupMediaSources() {
    //this creates the popup for the user to give microphone access
    await navigator.mediaDevices.getUserMedia({ audio: true });

    await this.getDevices();
  }

  async getDevices() {
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
    if(this.selectedStream) this.connection.removeStream(this.selectedStream);

    this.selectedStream = stream;
    this.connection.addStream(stream);
  }

  async changeAudioSource(audioSource) {
    const constraints = {
      audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    await this.gotStream(stream);
    await this.getDevices();
  }
}

export default WebRTCClient;
