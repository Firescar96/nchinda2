<template>
  <div id="settingsSection">
    <div id="nameSelectionBox">
      <p>My Name:</p>
      <input id="nameSelection" v-model="messaging.myName" type="text">
    </div>

    <div>
      Audio Inputs
      <v-select
        v-model="selectedAudioSource"
        :options="messaging.webrtcClient.audioInputs"
        :reduce="x => x.value"
        append-to-body
        @input="changeAudioSource"
      />
      Audio Outputs
      <v-select
        v-model="selectedAudioSink"
        :options="messaging.webrtcClient.audioOutputs"
        :reduce="x => x.value"
        append-to-body
        @input="changeAudioSink"
      />
    </div>
  </div>
</template>
<script>
import Component from 'vue-class-component';

export default
@Component({
  props: {
    messaging: {
      type: Object,
      required: true,
    },
  },
})
class Settings {
  data() {
    return {
      selectedAudioSource: null,
      selectedAudioSink: null,
    };
  }

  changeAudioSource() {
    this.messaging.webrtcClient.changeAudioSource(this.selectedAudioSource);
  }

  changeAudioSink() {
    this.messaging.webrtcClient.changeAudioSink(this.selectedAudioSink);
  }
}
</script>
<style lang="scss">
  #settingsSection {
    display: flex;
    flex: 1;
    flex-direction: column;

    #nameSelectionBox {
      margin-top: 15px;
      margin-bottom: 50px;
      display: flex;
      flex-direction: column;
      padding: 0 10px;

      p {
        margin: 0 2px;
      }

      span {
        width: 20%;
      }

      input {
        flex: 1;
        margin: 10px auto;
      }
    }

    .v-select {
      svg {
        fill: #ddd;
      }
      .vs__dropdown-toggle {
        border-color: #aaa;
      }
      .vs__selected {
        color: #eee;
      }
    }
  }
</style>
