<template>
  <div id="bubblesPage">
    <div id="cloudsContainer">
      <video autoplay loop>
        <!-- original video taken from https://www.youtube.com/watch?v=dRLB1ScXbEA -->
        <source src="/static/videos/clouds-5m.webm" type="video/webm"></source>
      </video>
    </div>

    <svg v-show="!selectedPost" id="bubblesGraphic" />

    <div v-for="(post, index) in posts" v-show="!selectedPost" :key="index" class="postSummary">
      <div class="link" @click="selectedPost=post" v-html="post.title" />
      <div v-html="post.date" />
    </div>

    <div v-if="selectedPost" id="selectedPost" ref="selectedPost">
      <div id="postContent" ref="postContent">
        <div id="messageBody">
          <div ref="generatedText" v-html="selectedPost.fullText" />
        </div>
        <div class="divider" />
        <div id="shippingBody">
          <div class="back" @click="selectedPost=null">
            X
          </div>
          <div id="stamp">
            <img src="/static/images/mexican-postage.jpg">
          </div>

          <div id="address">
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
import { parseMarkdown } from '../utils';

//this way bubble is only imported once via one network request
import bubbleImg from '@/../static/images/bubble.png';


const NUM_POSTS = 1;
export default
@Component()
class Welcome {
  data() {
    return {
      posts: [],
      selectedPost: null,
      bubbles: [],
      simulation: null,
      bubbleGenerator: null,
    };
  }

  async created() {
    let posts = [];
    for(let i = NUM_POSTS; i > 0; i--) {
      posts.push(fetch(`/static/bubbles/${i}.md`));
    }
    posts = await Promise.all(posts);
    posts = posts.map(async post => post.text());
    posts = await Promise.all(posts);
    posts = posts.map(post => parseMarkdown(post));

    this.posts = posts;
  }

  generateUUID() {
    return '66-6-6-6-666'.replace(/6/g, _ => (`${Math.random().toString(16)}00000`).slice(2, 6));
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
      .attr('transform', d => `translate(${d.x},${d.y})`);
    nodeEnter
      .append('circle')
      .attr('fill', 'transparent')
      .attr('r', d => d.r);
    nodeEnter
      .append('svg:image')
      .attr('xlink:href', bubbleImg)
      .attr('x', -25)
      .attr('y', -25)
      .attr('height', 50)
      .attr('width', 50);
  }

  mounted() {
    if(this.bubbleGenerator) return;
    this.simulation = forceSimulation(this.bubbles);
    this.bubbleGenerator = interval(() => {
      this.bubbles.push({
        id: this.generateUUID(),
        updateTime: Date.now(),
        x: -50,
        y: window.innerHeight,
        r: 15,
        vx: Math.random() * 0.7 + 0.2,
        vy: -(0.3),
      });
      this.updateGraphic();
    }, 300);

    this.simulation
      .alpha(1)
      .alphaTarget(1)
      .velocityDecay(0)
      .force('boyancy', forceY(-100).strength(0.00001))
      .force('source', (a, b) => {
        this.bubbles.forEach((bubble) => {
          //loose model for friction, does not go negative cause that would be bad
          bubble.vx = Math.max(bubble.vx - 0.006 * Math.sqrt(bubble.vx), 0.0000001);
          //the wind
          bubble.vx += 0.001;
          bubble.x += bubble.vx * (Date.now() - bubble.updateTime);
          bubble.y += bubble.vy;
          bubble.updateTime = Date.now();
        });
      })
      .on('tick', () => {
        select('svg')
          .selectAll('g.bubble')
          .attr('transform', d => `translate(${d.x},${d.y})`);

        for(let i = this.bubbles.length - 1; i >= 0; i--) {
          if(this.bubbles[i].x > window.innerWidth + 50 || this.bubbles[i].y < 0) {
            this.bubbles.splice(i, 1);
            this.updateGraphic();
          }
        }
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

  $fireColor: #9600ff;
  $fireColorT: rgba(255,80,0,0);
  $dur: 1s;
  $blur: 0.02em;
  $fireRad: 3em;
  $parts: 50;
  $partSize: 2em;

  #bubblesGraphic {
    width: 100%;
    height: 100%;
    z-index: -1;
    position: absolute;
    top: 0;
    left: 0;
    filter: blur(1px);
  }

  #cloudsContainer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -2;
    overflow: hidden;

  }

  .postSummary {
    text-align: left;
    padding-left: 20px;

   .link {
      cursor:grab;

      &:hover {
        text-decoration: underline;
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

    #postContent {
      width: 960px;
      height: 500px;
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
      }

      .divider {
        margin: auto 5px;
        border: solid 1px black;
        width: 0;
        height: 80%;
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
