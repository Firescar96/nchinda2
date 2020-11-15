<template>
  <div id="livePage">
    <div id="jsmpeg-player" class="video-js vjs-live vjs-liveui" v-show="showLivePlayer">
      <canvas id="canvas" />
      <div class="jsmpeg-controls-bar vjs-control-bar">
        <button @click="livePause" class="vjs-play-control vjs-control vjs-button vjs-playing" type="button" title="Pause">
          <span aria-hidden="true" class="vjs-icon-placeholder"></span>
        </button>
        <button @click="livePlay" class="vjs-play-control vjs-control vjs-button vjs-paused" type="button" title="Play">
          <span aria-hidden="true" class="vjs-icon-placeholder"></span>
        </button>
        <!-- <div class="vjs-volume-panel vjs-control vjs-volume-panel-horizontal">
          <button class="vjs-mute-control vjs-control vjs-button vjs-vol-3" type="button" title="Mute">
            <span aria-hidden="true" class="vjs-icon-placeholder"></span><span class="vjs-control-text" aria-live="polite">Mute</span>
          </button>
          <div class="vjs-volume-control vjs-control vjs-volume-horizontal">
            <div tabindex="0" class="vjs-volume-bar vjs-slider-bar vjs-slider vjs-slider-horizontal" role="slider" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" aria-label="Volume Level" aria-live="polite" aria-valuetext="100%">
              <div class="vjs-volume-level">
                <span class="vjs-control-text"></span>
              </div>
            </div>
          </div>
        </div> -->
        <button @click="liveUnlive" class="vjs-seek-to-live-control vjs-control vjs-at-live-edge" type="button" title="Seek to live, currently playing live">
          <span aria-hidden="true" class="vjs-icon-placeholder"></span>
          <span class="vjs-seek-to-live-text" aria-hidden="true">UNLIVE</span>
        </button>
        <button class="vjs-fullscreen-control vjs-control vjs-button" type="button" title="Fullscreen" aria-disabled="false">
          <span aria-hidden="true" class="vjs-icon-placeholder"></span>
          <span class="vjs-control-text" aria-live="polite">Fullscreen</span>
        </button>
      </div>
    </div>

    <div id="unlive-player" v-show="showUnlivePlayer">
      <video
        ref="liveVid"
        class="video-js vjs-default-skin"
      >
        <source :src="'https://nchinda2.africa:8395/hls/'+$route.params.stream+'.m3u8'" type="application/x-mpegURL">
        <!-- <source :src="'https://nchinda2.africa:8395/dash/'+$route.params.stream+'.mpd'" type="application/dash+xml"> -->
      </video>
    </div>

    <div v-if="!showLivePlayer && !showUnlivePlayer" id="join-button" class="video-js">
      <span>Join Stream</span>
      <button class="vjs-big-play-button" title="Join Stream" @click="joinStream">
        <span aria-hidden="true" class="vjs-icon-placeholder"/>
      </button>
    </div>

    <div id="chatSideBar">
      <h3 id="chatTitle">
        conTROLLbox
      </h3>
      <div id="triggersContainer">
        <div id="sync" @click="messaging.sendMessage({flag: 'syncRequest'})">
          Sync To Others
        </div>
        <div id="sync" @click="messaging.sendMessage({flag: 'clientStatus'})">
          Status Check
        </div>
      </div>
      <div id="nameSelectionBox">
        <p>My Name:</p>
        <input id="nameSelection" v-model="myName">
      </div>
      <overlay-scrollbars id="chatMessages" ref="chatMessages" class="os-theme-light">
        <div v-for="(message, index) in messages" :key="index" class="message" :class="{meta: message.isMeta, myMessage: message.myMessage}">
          <p v-if="!message.myMessage && !message.isMeta">
            {{ message.name }}:
          </p>
          <p class="indentMessage">
            {{ message.text }}
          </p>
          <p v-if="message.action == 'peerDisconnect'" class="indentMessage">
            {{ message.name }} disconnected <a @click="jumpToTime(message.time)">Jump to Time</a>
          </p>
          <p v-if="message.action == 'syncAction'" class="indentMessage">
            {{ message.name }} pressed the <span class="capitalize">{{ toHumanReadable(message.flag) }}</span> button
          </p>
          <p v-if="message.action == 'peerConnect'" class="indentMessage">
            {{ message.name }} connected
          </p>
          <div v-if="message.action == 'clientStatus'" class="indentMessage">
            <div class="clientStatusHeader clientStatusGroup">
              <div class="clientStatusName">
                Name
              </div>
              <div class="clientStatusTime">
                Time
              </div>
            </div>
            <div v-for="status in message.status" :key="status.name" class="clientStatusGroup">
              <div class="clientStatusName">
                {{ status.name }}
              </div>
              <div class="clientStatusTime">
                {{ Math.round(status.lastFrameTime) }}
              </div>
            </div>
          </div>
        </div>
      </overlay-scrollbars>
      <input id="chatInput" v-model="newMessage" placeholder="...write a message and press enter" @keyup.enter="sendChat">
    </div>
  </div>
</template>

<script>
import Component from 'vue-class-component';
import videojs from 'video.js';
import { Watch } from 'vue-property-decorator';
//this attaches seekButtons to videojs
//eslint-disable-next-line no-unused-vars
import seekButtons from 'videojs-seek-buttons';
import { generateName } from '@/utility';
import JSMpeg from '@cycjimmy/jsmpeg-player';
import MessagingManager from './MessagingManagers/MessagingManager';
import constants from './constants';
import JSMpegPipeSource from './JSMpegPipeSource';

const { SKIP_BACK_SECONDS, SKIP_FORWARD_SECONDS } = constants;

export default
@Component()
class Live {
  data() {
    return {
      messages: [{ isMeta: true, name: 'Meta', text: 'Welcome, make sure to set your name above.' }],
      newMessage: '',
      myName: generateName(),
      triggerRemoteSync: false, //when false don't propagate actions to everyone, they are updating our local current time
      livePlayerLoaded: false, //on the first play sync to others
      lastSyncedTime: null,
      showLivePlayer: false,
      showUnlivePlayer: false,
    };
  }

  @Watch('myName')
  changeName(value) {
    this.messaging.myName = value;
  }

  toHumanReadable(input) {
    switch(input) {
      case 'seekForward':
        return 'Jump Forward';
      case 'seekBack':
        return 'Jump Back';
      case 'seekToLive':
        return 'LIVE';
      case 'seekToUnlive':
        return 'UNLIVE';
      default:
        return input;
    }
  }

  mounted() {
    this.livePlayer = new JSMpeg.Player('pipe', {
      source: JSMpegPipeSource,
      canvas: document.getElementById('canvas'),
      pauseWhenHidden: false,
      onPlay: () => {
        if(!this.livePlayerLoaded) {
          this.livePlayer.stop();
          this.livePlayerLoaded = true;
        }
      }
    });
    window.livePlayer = this.livePlayer;
    //initialize videojs with options
    this.video = videojs(this.$refs.liveVid, {
      preload: 'auto',
      controls: true,
      controlBar: {
        pictureInPictureToggle: false,
      },
      techOrder: ['html5'],
      liveui: true,
    });

    //init seekbuttons plugin
    this.video.seekButtons({
      forward: SKIP_FORWARD_SECONDS,
      back: SKIP_BACK_SECONDS,
      backIndex: 0,
    });

    this.messaging = new MessagingManager(this.$route.params.stream, this.myName, this.video, this.displayMessage, this.livePlayer, this.switchToLive, this.switchToUnlive);

    const {eventHandlers} = this.messaging;

    //onReady setup the handlers for different user interactions
    this.video.on('ready', () => {
      this.video.on('play', eventHandlers.play);
      this.video.on('pause', () => {
        // if(!this.showUnlivePlayer) return;
        eventHandlers.pause();
      });
      this.video.controlBar.progressControl.seekBar.on('mouseup', eventHandlers.seek);
      this.video.controlBar.seekForward.on('click', eventHandlers.seekForward);
      this.video.controlBar.seekBack.on('click', eventHandlers.seekBack);
      this.video.controlBar.seekToLive.on('click', () => {
        this.switchToLive();
        eventHandlers.seekToLive();
      });
    });

    window.video = this.video;
  }

  jumpToTime(time) {
    this.video.currentTime(time);
    this.messaging.sendMessage({ flag: 'sync-trigger' });
  }

  sendChat() {
    const message = {
      flag: 'chatMessage',
      text: this.newMessage,
    };

    this.messaging.sendMessage(message);
    this.newMessage = '';

    this.displayMessage(message, true);
  }

  async displayMessage(message, isMyMessage) {
    message.myMessage = isMyMessage;

    if(message.replace === true && this.messages[this.messages.length - 1].name === message.name) {
      this.messages.splice(this.messages.length - 1, 1);
    }

    if(message.flag === 'play' && this.messages[this.messages.length - 1].flag === 'seek') {
      return;
    }

    this.messages.push(message);

    await this.$nextTick();
    window.chats = this.$refs.chatMessages;
    this.$refs.chatMessages.osInstance().scroll('100%');
  }

  joinStream() {
    this.messaging.streamJoined = true;
    //on join request an update to the current time and status of peers
    this.messaging.sendMessage({ flag: 'syncRequest' });

    if(this.messaging.isLiveVideo) this.switchToLive();
    else this.switchToUnlive();
  }

  livePlay() {
    this.livePlayer.play();
    this.messaging.sendMessage({ flag: 'play', isPaused: false, action: 'syncAction' })
  }

  livePause() {
    this.livePlayer.pause();
    this.messaging.sendMessage({ flag: 'pause', isPaused: true, action: 'syncAction' })
  }
  
  liveUnlive() {
    this.switchToUnlive()
 this.messaging.sendMessage({ flag: 'seekToUnlive', replace: true, action: 'syncAction' });
  }

  switchToLive() {
    console.log('switchToLive', this)
    //disable unlive player events, then pause it
    this.showUnlivePlayer = false;
    this.video.pause();

    this.showLivePlayer = true;
    this.livePlayer.play();
    this.messaging.isLiveVideo = true;
  }



  switchToUnlive() {
    console.log('switchToUnlive')
    this.showUnlivePlayer = true;
    this.showLivePlayer = false;

    //start unlive player, then enable events
    this.video.play();

    this.livePlayer.pause();
    this.messaging.isLiveVideo = false;
  }
}
</script>

<style lang="scss">
@import 'videojs-seek-buttons/dist/videojs-seek-buttons.css';

#livePage {
  position: absolute;
  width: 100vw;
  height: 100vh;
  z-index: 200;
  display: flex;
  flex-direction: row;
  color: white;

  #liveVid {
    display: none;
  }

  input {
    background: transparent;
    outline: none;
    border: none;
    border-bottom: solid 1px white;
    padding: 0 5px;
    color: white;
  }

  /*
    Player Skin Designer for Video.js
    http://videojs.com

    To customize the player skin edit
    the CSS below. Click "details"
    below to add comments or questions.
    This file uses some SCSS. Learn more
    at http://sass-lang.com/guide)

    This designer can be linked to at:
    https://codepen.io/heff/pen/EarCt/left/?editors=010
  */

  // The following are SCSS variables to automate some of the values.
  // But don't feel limited by them. Change/replace whatever you want.

  // The color of icons, text, and the big play button border.
  // Try changing to #0f0
  $primary-foreground-color: #a0522d; // #fff default

  // The default color of control backgrounds is mostly black but with a little
  // bit of blue so it can still be seen on all-black video frames, which are common.
  // Try changing to #900
  $primary-background-color: #000000;  // #2B333F default

  // Try changing to true
  $center-big-play-button: true; // true default

  #jsmpeg-player {
    display: flex;
    flex-direction: column;
    justify-content: center;

    canvas {
      width: 100%;
    }

    .jsmpeg-controls-bar {
      width: 100%;
      display: flex;
      margin-top: auto;

      .vjs-play-control {
        height: auto;
      }
      .vjs-seek-to-live-control {
        margin-left: auto;
      }
    }
  }

  .video-js {
    /* The base font size controls the size of everything, not just text.
      All dimensions use em-based sizes so that the scale along with the font size.
      Try increasing it to 15px and see what happens. */
    font-size: 20px;

    /* The main font color changes the ICON COLORS as well as the text */
    color: $primary-foreground-color;
    height: 100%;
    width: 100%;

    .vjs-tech {
      pointer-events: none;
    }

    video {
      outline: none;
    }

    /* The default color of control backgrounds is mostly black but with a little
      bit of blue so it can still be seen on all-black video frames, which are common. */
    .vjs-control-bar,
    .vjs-big-play-button,
    .vjs-menu-button .vjs-menu-content {
      /* IE8 - has no alpha support */
      background-color: $primary-background-color;
      /* Opacity: 1.0 = 100%, 0.0 = 0% */
      background-color: rgba($primary-background-color, 0.9);
    }

    // Make a slightly lighter version of the main background
    // for the slider background.
    $slider-bg-color: lighten($primary-background-color, 90%);
    /* Slider - used for Volume bar and Progress bar */
    .vjs-slider {
      background-color: $slider-bg-color;
      background-color: rgba($slider-bg-color, 0.9);
    }

    /* The slider bar color is used for the progress bar and the volume bar
      (the first two can be removed after a fix that's coming) */
    .vjs-volume-level,
    .vjs-play-progress,
    .vjs-slider-bar {
      background: $primary-foreground-color;
    }

    /* The main progress bar also has a bar that shows how much has been loaded. */
    .vjs-load-progress {
      /* For IE8 we'll lighten the color */
      background: ligthen($slider-bg-color, 80%);
      /* Otherwise we'll rely on stacked opacities */
      background: rgba($slider-bg-color, 0.8);
    }

    /* The load progress bar also has internal divs that represent
      smaller disconnected loaded time ranges */
    .vjs-load-progress div {
      /* For IE8 we'll lighten the color */
      background: ligthen($slider-bg-color, 80%);
      /* Otherwise we'll rely on stacked opacities */
      background: rgba($slider-bg-color, 0.9);
    }
  }

  #unlive-player {
    flex: 1;
  }

  #join-button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &:hover .vjs-big-play-button {
      background-color: rgba(0,0,0,.95);
      border-color: $primary-foreground-color;
    }

    .vjs-big-play-button {
      position: relative;
      font-size: 2.5em;
      border-radius: 0.2em;
      outline: none;
      left: 0;
    }
  }

  #chatSideBar {
    width: 300px;
    display: flex;
    flex-direction: column;
    background: #111;

    #chatTitle {
      color: #f008;
      padding: 0 10px;
    }

    #triggersContainer {
      display: flex;
      justify-content: space-around;
      margin: 10px 0;

      div {
        padding: 10px 20px;
        margin: auto;
        background: #222;
        border-radius: 5px;
        cursor: pointer;
      }
    }

    #nameSelectionBox {
      margin-top: 15px;
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

    #chatMessages {
      flex: 1;
      font-size: 16px;
      border-bottom: solid 2px white;
      padding: 0 10px;
      overflow-y: auto;

      .message {
        padding: 8px 0;
        overflow-wrap: break-word;
        width: 100%; // this ensures overflow-wrap applies at the beginning, so during the animation overlayscrollbars can still calculate how far to scroll
        animation-name: newMessage;
        animation-duration: 1s;

        &.meta {
          color: #aaa;
        }

        &.myMessage {
          text-align: right;
          margin-left: 0;
        }

        p {
          margin: 5px 0;
        }

        .indentMessage {
          margin-left: 20px;
        }

        a {
          color: #ffff16a1;
          cursor: ew-resize;
        }

        .clientStatusHeader {
          border-bottom: solid 1px #ddd;
          margin-bottom: 2px;
        }

        .clientStatusGroup {
          display: flex;
          justify-content: space-between;
          text-align: left;

          .clientStatusName {
            flex: 1;
            margin: auto;
            padding: 2px 5px;
            border-right: solid 1px #ddd;
            border-bottom: solid 1px #555;
          }

          .clientStatusTime {
            width: 60px;
            padding: 2px 5px;
            margin: auto;
            border-bottom: solid 1px #555;
          }
        }
      }

      @keyframes newMessage {
        from {margin-left: -300px}
        to {margin-left: 0}
      }
    }

    input#chatInput {
      height: 40px;
      margin: 0 10px;
    }
  }

  .capitalize {
    text-transform: capitalize;
  }

}
</style>
