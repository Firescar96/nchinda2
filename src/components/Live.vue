<template>
  <div id="livePage">
    <video
      ref="liveVid"
      class="video-js vjs-default-skin"
    >
      <source :src="'https://nchinda2.africa:8395/hls/'+$route.params.stream+'.m3u8'" type="application/x-mpegURL">
      <source :src="'https://nchinda2.africa:8395/dash/'+$route.params.stream+'.mpd'" type="application/dash+xml">
    </video>

    <div id="chatSideBar">
      <h3 id="chatTitle">
        Trollbox
      </h3>
      <div id="nameSelectionBox">
        <p>My Name:</p>
        <input id="nameSelection" v-model="myName">
      </div>
      <div id="chatMessages" ref="chatMessages">
        <div v-for="(message, index) in messages" :key="index" class="message" :class="{meta: message.name == 'Meta'}">
          <span>{{ message.name }}</span>:
          {{ message.body }}
        </div>
      </div>
      <input id="chatInput" v-model="newMessage" placeholder="...write a message and press enter" @keyup.enter="sendChat">
    </div>
  </div>
</template>

<script>

import Component from 'vue-class-component';

export default
@Component()
class Live {
  data() {
    return {
      messages: [{name: 'Meta', body: 'Welcome, make sure to set your name above.'}],
      newMessage: '',
      myName: '',
    };
  }

  mounted() {
    window.videojs(this.$refs.liveVid, {
    //autoplay: true,
      preload: 'auto',
      controls: true,
      controlBar: {
        pictureInPictureToggle: false,
      },
    });

    let route = window.location.href;
    if(window.location.hostname.includes('localhost')) {
      route = route.replace(/:\d+/, ':8081');
    }

    route = route.replace('https', 'wss').replace('http', 'wss');

    this.websocket = new WebSocket(route);

    this.websocket.onmessage = ({data}) => {
      this.addMessage(JSON.parse(data));
    };
  }

  sendChat() {
    const message = {
      name: this.myName,
      body: this.newMessage,
    };

    this.websocket.send(JSON.stringify(message));
    this.newMessage = '';

    this.addMessage(message);
  }

  async addMessage(data) {
    this.messages.push(data);
    await this.$nextTick();
    this.$refs.chatMessages.scrollTop = this.$refs.chatMessages.scrollHeight;
  }
}
</script>

<style lang="scss">

#livePage {
  position: absolute;
  width: 100vw;
  height: 100vh;
  z-index: 200;
  display: flex;
  flex-direction: row;
  color: white;

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

  .video-js {
    /* The base font size controls the size of everything, not just text.
      All dimensions use em-based sizes so that the scale along with the font size.
      Try increasing it to 15px and see what happens. */
    font-size: 20px;

    /* The main font color changes the ICON COLORS as well as the text */
    color: $primary-foreground-color;
    height: 100%;
    flex: 1;

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

    &:hover .vjs-big-play-button {
      background-color: rgba(0,0,0,.95);
      border-color: #a0422d;
    }

    /* The "Big Play Button" is the play button that shows before the video plays.
      To center it set the align values to center and middle. The typical location
      of the button is the center, but there is trend towards moving it to a corner
      where it gets out of the way of valuable content in the poster image.*/
    .vjs-big-play-button {
      font-size: 2.5em;
      border: 0.06666em solid $primary-foreground-color;
      border-radius: 0.2em;
      outline: none;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }

  #chatSideBar {
    width: 250px;
    display: flex;
    flex-direction: column;
    background: #111;

    #chatTitle {
      color: #f008;
      padding: 0 10px;
    }

    #nameSelectionBox {
      margin: 10px 0;
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
        padding: 10px 0;

        &.meta {
          color: #ddd;
        }
      }
    }

    input#chatInput {
      height: 40px;
      margin: 0 10px;
    }
  }
}
</style>
