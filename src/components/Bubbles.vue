<template>
  <div id="bubblesPage">
    <svg class="bubblesBubbleGraphic" />

    <div
      id="cloudsContainer"
      :class="{focusVideo: focusVideo}"
    >
      <video
        ref="backgroundVid" autoplay loop
        class="video-js vjs-default-skin"
        controls
      />
    </div>

    <div id="postSummaryContainer">
      <div v-for="(post, index) in posts" v-show="!selectedPost" :key="index" class="postSummary">
        <div class="link" @click="selectPost(post.index)" v-html="post.title" />
        <div v-html="post.date" />
      </div>
    </div>

    <div v-if="selectedPost" id="selectedPost" ref="selectedPost">
      <div id="postContent" ref="postContent">
        <div id="messageBody">
          <div ref="generatedText" v-html="selectedPost.fullText" />
        </div>
        <div class="divider" />
        <div id="shippingBody">
          <div class="back" @click="selectPost(null)">
            X
          </div>
          <div id="stamp">
            <img src="/static/images/mexican-postage.jpg">
          </div>

          <div id="address">
            <p>My friend</p>
            <p>3rd and Breath</p>
            <p>Black Rock City, Nevada</p>
            <p>United States</p>
          </div>
        </div>
      </div>
    </div>
    </video>
  </div>
</template>

<script>
import Component from 'vue-class-component';
import {
  select, interval, forceSimulation, forceY,
} from 'd3';
import { loadPosts } from '@/utility';

//this way bubble is only imported once via one network request
import bubbleImg from '@/../static/images/bubble.png';


const NUM_POSTS = 6;
export default
@Component()
class Bubbles {
  data() {
    return {
      posts: [],
      selectedPost: null,
      bubbles: [],
      mouseData: {
        x: 100,
        y: 100,
      },
      bubbleTouchLinks: [],
      simulation: null,
      bubbleGenerator: null,
      focusVideo: false,
    };
  }

  async created() {
    await loadPosts('bubbles', NUM_POSTS, this);

    const player = window.videojs(this.$refs.backgroundVid);
    if(this.$route.query.video) {
      player.src({
        src: `/static/videos/${this.$route.query.video}/master.m3u8`,
        type: 'application/x-mpegURL',
        overrideNative: true,
      });
      this.focusVideo = true;
    } else {
      player.src(
        {
          src: 'https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd',
          //src: '/static/videos/clouds-5m/stream.mpd',
          type: 'application/dash+xml',
        },
      );
    }
  }

  selectPost(index) {
    if(index) {
      this.selectedPost = this.posts[this.posts.length - index];
    } else {
      this.selectedPost = index;
    }

    this.$router.push({ query: { post: index } });
  }

  generateUUID() {
    return '66-6-6-6-666'.replace(/6/g, (_) => (`${Math.random().toString(16)}00000`).slice(2, 6));
  }

  updateGraphic() {
    this.simulation.nodes(this.bubbles);

    const nodes = select('svg')
      .selectAll('g.bubble')
      .data(this.bubbles);
    nodes.exit().remove();

    const nodeEnter = nodes.enter()
      .append('svg:g')
      .attr('class', 'bubble')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);
    nodeEnter
      .append('circle')
      .attr('fill', 'transparent')
      .attr('r', (d) => d.r);
    nodeEnter
      .append('svg:image')
      .attr('xlink:href', bubbleImg)
      .attr('x', -25)
      .attr('y', -25)
      .attr('height', 50)
      .attr('width', 50)
      .attr('opacity', 0.7);
  }

  mounted() {
    if(this.bubbleGenerator) return;
    this.simulation = forceSimulation(this.bubbles);

    this.bubbleGenerator = interval(() => {
      const newBubble = {
        id: this.generateUUID(),
        updateTime: Date.now(),
        x: -50,
        y: window.innerHeight,
        r: 15,
        vx: Math.random() * 0.7 + 0.2,
        vy: -(0.3),
      };

      this.bubbles.push(newBubble);
      this.bubbleTouchLinks.push({ source: newBubble.id, target: 'mouse' });
      this.updateGraphic();
    }, 500);

    console.log('hello', this.simulation.nodes());
    //move the bubble around the page on every tick using a loose physics approximation
    this.simulation
      .alpha(1)
      .alphaTarget(1)
      .velocityDecay(0)
      .force('boyancy', forceY(-100).strength(0.000001))
      .force('source', (a, b) => {
        this.bubbles.forEach((bubble) => {
          const directionX = bubble.vx > 0 ? 1 : -1;
          bubble.vx = Math.abs(bubble.vx);
          //loose model for friction, does not go negative cause that would be bad
          bubble.vx = Math.max(bubble.vx - 0.006 * Math.sqrt(bubble.vx), 0.0000001);
          //the wind
          bubble.vx *= directionX;
          bubble.x += bubble.vx * (Date.now() - bubble.updateTime);
          bubble.y += bubble.vy;
          bubble.updateTime = Date.now();
        });
      })
      .force('polarity', () => {
        this.bubbles.forEach((bubble) => {
          const dx = this.mouseData.x - bubble.x || -1e-6;
          const dy = this.mouseData.y - bubble.y || -1e-6;
          const proximity = Math.sqrt((dx ** 2) + (dy ** 2));
          const magneticForce = 1 / proximity;
          //too close and it will pop
          if(proximity < 20) {
            bubble.vx = 0;
            bubble.vy = 0;
            bubble.x = -1000;
            bubble.y = -1000;
          } else if(magneticForce > 0.01) {
            bubble.vx = dx * magneticForce;
            bubble.vy = dy * magneticForce;
            if(Math.abs(dx) < 2) bubble.vx = 0;
            if(Math.abs(dy) < 2) bubble.vy = 0;
          }
          bubble.updateTime = Date.now();
        });
      })
      .on('tick', () => {
        select('svg')
          .selectAll('g.bubble')
          .attr('transform', (d) => `translate(${d.x},${d.y})`);

        for(let i = this.bubbles.length - 1; i >= 0; i--) {
          if(this.bubbles[i].id == 'mouse') continue;

          if(this.bubbles[i].x < -50 || this.bubbles[i].x > window.innerWidth + 50 || this.bubbles[i].y < 0) {
            this.bubbles.splice(i, 1);
            this.bubbleTouchLinks.splice(i, 1);
            this.updateGraphic();
          }
        }
      });

    //track the mouse
    window.addEventListener('mousemove', (e) => {
      this.mouseData.x = e.clientX;
      this.mouseData.y = e.clientY;
    });
  }

  destroyed() {
    this.bubbleGenerator.stop();
    this.bubbleGenerator = null;
    this.bubbles.splice(0);
    this.simulation.stop();
    select('svg')
      .selectAll('g.bubble')
      .data([]);
  }
}
</script>
<style lang="scss">
@font-face {
    font-family: "IndieFlower";
    src: url("../../static/fonts/Indie_Flower/IndieFlower-Regular.ttf");
}

#bubblesPage {
  font-family: IndieFlower;
  display: flex;

  $fireColor: #9600ff;
  $fireColorT: rgba(255,80,0,0);
  $dur: 1s;
  $blur: 0.02em;
  $fireRad: 3em;
  $parts: 50;
  $partSize: 2em;

  .bubblesBubbleGraphic {
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    // pointer-events: none;
    z-index: 2;

    g {
      pointer-events: all;
    }
  }


  div#cloudsContainer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 10;
    overflow: hidden;
    >div {
      width: 100%;
      height: 100%;
    }

    &:not(.focusVideo) {
      z-index: 1;

      video {
        /* Make video to at least 100% wide and tall */
        min-width: 100%;
        min-height: 100%;

        /* Setting width & height to auto prevents the browser from stretching or squishing the video */
        width: auto;
        height: auto;
      }
      .vjs-control-bar {
        visibility: hidden;
      }
    }
  }

  #postSummaryContainer {
    color: white;
    mix-blend-mode: difference;
    z-index: 2;

    .postSummary {
      text-align: left;
      padding-left: 20px;

      h1 {
        font-size: 3em;
        margin-bottom: 10px;
      }
      p {
        font-size: 1.5em;
        margin: 0;
      }

      .link {
        z-index: 5;
        cursor:grab;
        display: inline-block;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  #selectedPost {
    position: absolute;
    top: 0;
    left: 0;
    right:0;
    bottom:0;
    display: flex;
    z-index: 10;

    #postContent {
      width: 960px;
      min-height: 500px;
      max-height: 80vh;
      margin: auto;
      display: flex;
      background-blend-mode: screen;
      background-color: #dadada;
      background-image: url('/static/images/elmanana.jpg');
      background-size: cover;
      text-align: left;
      padding: 5px;
      border-width: 4px;
      border-style: solid;
      animation: rainbow 60s infinite alternate;

     @keyframes rainbow {
      0% {border-color:red}
      14% {border-color:orange,}
      28% {border-color: yellow,}
      56% {border-color:green, }
      70% {border-color: cyan, }
      84% {border-color: blue,}
      98% {border-color: violet}
      }

      #messageBody {
        flex: 1;
        font-size: 20px;
        overflow-y: auto;
        padding: 5px;
      }

      .divider {
        margin: auto 5px;
        border: solid 1px black;
        width: 1;
        height: 50vh;
      }

      #shippingBody {
        flex: 1;
        display: flex;
        position: relative;

        .back {
          position: absolute;
          top: -5px;
          right: 5px;
          font-size: 30px;
          cursor: grab;
        }

        #stamp {
          position: absolute;
          top: 40px;
          right: 40px;
          width: 60px;
          height: 80px;
          border: solid 1px black;

          img {
            transform: rotate(15deg);
            width: 100%;
            height: 100%;
          }
        }

        #address {
          margin: auto;
          padding-top: 100px;

          p {
            border-bottom: solid 1px black;
            line-height: 40px;
            padding: 5px;

            &:after {
              display: block;
              margin-top: -19px;
              content: "";
            }
          }
        }
      }
    }
  }
}
</style>
