<template>
  <div id="firescarPage">
    <div id="lavalamp">
      <div class="fire">
        <div v-for="ball in lavaballs" :key="ball" class="burn" />
        <div v-for="ball in lavaballs" :key="ball" class="burn heat" />
      </div>
    </div>

    <div v-for="post in posts" :key="post.index" class="postSummary">
      <div class="link" @click="selectPost(post.index)" v-html="post.title" />
      <div v-html="post.date" />
    </div>

    <div v-if="selectedPost" id="selectedPost" ref="selectedPost">
      <div class="back" @click="selectPost(null)">
        ←
      </div>

      <!-- citation goes to http://www.patorjk.com/software/taag/ -->
      <overlay-scrollbars id="postContent" ref="postContent" class="os-theme-light">
        <span class="termUser">firecar96@comsat1</span>
        <span class="termDir">~/public</span> $ cat posts/{{ selectedPost.index }}.md
        <div v-html="selectedPost.fullText" />
        <br>
        <span class="termUser">firecar96@comsat1</span>
        <span class="termDir">~/public</span> $
        <span class="cursor" />
      </overlay-scrollbars>
    </div>
  </div>
</template>

<script>
import Component from 'vue-class-component';
import { loadPosts } from '@/utility';

const NUM_POSTS = 11;
export default
@Component()
class Firescar {
  data() {
    return {
      posts: [],
      selectedPost: null,
      lavaballs: new Array(15),
    };
  }

  async created() {
    await loadPosts('firescar', NUM_POSTS, this);
  }

  selectPost(index) {
    if(index) {
      this.selectedPost = this.posts[this.posts.length - index];
    } else {
      this.selectedPost = index;
    }

    this.$router.push({ query: { post: index } });
  }
}
</script>
<style lang="scss">
@font-face {
    font-family: "VT323";
    src: url("/fonts/VT323/VT323-Regular.ttf");
}

#firescarPage {
  font-family: VT323;
  background: #000;

  $fireSize: 800;
  $burnSize: 200;
  $burnCount: 15;

  #lavalamp {
    position: absolute;
    top: 50%;
    right: 0;
    margin-top: #{-$fireSize / 4}px;
    transform: translateY(-50%);

    .fire {
      position: relative;
      width: #{$fireSize}px;
      height: #{$fireSize}px;
      filter: blur(20px) contrast(5);
      border: #{$fireSize/2}px solid #000;
      border-bottom-color: transparent;
      border-radius: 40%;
      box-sizing: border-box;
      transform: scale(0.4, 1);
      animation: lavashade 10s infinite cubic-bezier(0.42, 0.0, 0.58, 1.0);

      .burn {
        position: absolute;
        top: #{$fireSize}px;
        left: #{-$burnSize / 2}px;
        width: #{$burnSize}px;
        height: #{$burnSize}px;
        background: #000;
        border-radius: 100%;

        @for $i from 1 through $burnCount * 2 {
          &.heat:nth-child(#{$i}) {
            height: #{random(50)}px;
          }
          &:nth-child(#{$i}) {
            height: #{random($burnSize / 2)}px;
            margin-left: #{random($fireSize) - $fireSize / 2}px;
            animation: burning #{random(5000) + 12000}ms infinite linear;
          }
        }
      }
    }

    @keyframes burning {
      0% {
        transform: translateY(-300px);
      }
      100% {
        transform: translateY(-#{$fireSize+$burnSize}px);
      }
    }

    @keyframes lavashade {
      0% {
        background: #ff9900;
      }
      5% {
        background: #ff9900;
      }
      45% {
        background: #9600ff;
      }
      55% {
        background: #9600ff;
      }
      95% {
        background: #ff9900;
      }
      100% {
        background: #ff9900;
      }
    }
  }

  .postSummary {
    padding-left: 20px;
    color: white;
    width: 500px;
    text-align: left;

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
    width: 100vw;
    height: 100vh;
    color: white;
    background: black;
    z-index: 1000;
    font-size: 22px;

    .back {
      position: fixed;
      top: 10px;
      left: 20px;
      font-size: 80px;
      cursor: grab;
    }

    #postContent {
      margin: 50px auto 0 auto;
      max-width: 960px;
      width: 80%;
      text-align: left;
      height: 100%;
      padding-right: 15px; //space for the scrollwheel

      // don't show title and date
      h1, h1+p {
        display: none;
      }

      p.title {
        font-family: monospace;
        white-space: pre;
      }

      .termUser {
        color: #00AA00;
      }

      .termDir {
        color: #5555FF;
      }

      p, li {
        margin: 0;
        margin-bottom: 30px;
        line-height: 30px;
      }

      ul {
        margin: 0;
        padding: 0;
        list-style-position: inside;
        list-style-type: none;

        li {
          padding-left: 40px;

          &:before {
            content: "-";
            margin-right: 5px;
          }
        }
      }

      table, img {
        margin: 15px 0;
      }

      th {
        border-bottom: solid 1px white;
      }

      th, td {
        margin: 0;
        padding: 5px 5px;
      }

      code {
        font-size: 16px;
      }

      blockquote {
        margin: 5px 15%;
        padding-left: 10px;
        border-left: 2px solid white;
      }

      img {
        width: 80%;
        margin: 0 10%;
        height: auto;
      }

      .cursor {
        height: 12px;
        width: 10px;
        background: white;
        display: inline-block;
        animation: blinker 2s infinite ease-in-out;
      }

      @keyframes blinker {
        50% {
          opacity: 0;
        }
      }
    }
  }
}
</style>
