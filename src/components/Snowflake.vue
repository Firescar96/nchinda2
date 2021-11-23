<template>
  <div id="snowflakePage">
    <div id="fallingSnow">
      <span v-for="i in snowflakes" :key="i" />
    </div>
    <div id="fallingSnow">
      <span v-for="i in snowflakes" :key="i" />
    </div>

    <div v-for="(post, index) in posts" :key="index" class="postSummary">
      <div class="link" @click="selectPost(post.index)" v-html="post.title" />
      <div v-html="post.date" />
    </div>

    <div v-if="selectedPost" id="selectedPost" ref="selectedPost">
      <div class="back" @click="selectPost(null)">
        ←
      </div>
      <overlay-scrollbars id="postContentBox">
        <div id="postContent" ref="postContent">
          <div id="journalBackground" />
          <div id="journalForeground" v-html="selectedPost.fullText" />
        </div>
      </overlay-scrollbars>
    </div>
  </div>
</template>

<script>
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import { loadPosts } from '@/utility';

const NUM_POSTS = 7;
export default
@Component()
class Snowflake {
  data() {
    return {
      posts: [],
      selectedPost: null,
      snowflakes: new Array(12),
    };
  }

  async created() {
    const posts = [];
    loadPosts('snowflake', NUM_POSTS, this);
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
    font-family: "Aladin";
    src: url("/fonts/Aladin/Aladin-Regular.ttf");
}

#snowflakePage {
  font-family: 'Aladin';
  font-size: 25px;
  background-color: #bfd0cf;
  background-image: url('/images/snowflake-paper.jpg');
  background-blend-mode: color-burn;

  .postSummary {
    max-width: 960px;
    width: 80%;
    margin: auto;

      h1 {
        margin-bottom: 0;
      }

      p {
        margin-top: 0;
      }

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
    z-index: 1000;
    background: #fafdff;
    display:flex;

    .back {
      position: absolute;
      top: 10px;
      left: 20px;
      font-size: 80px;
      cursor: grab;
    }

    #postContentBox {
      height: 100%;
      margin: 0 auto;
    }

    #postContent {
      margin: auto;
      max-width: 960px;
      min-height: 100%;
      padding-left: 10px;
      padding-right: 10px;
      border-left: double 5px black;
      border-right: double 5px black;
      position: relative;
      min-height: 100vh;

      h1 {
        margin: 0;
        margin-bottom: 33px;
      }

      h4, p, li, h3 {
        margin: 0;
        // border-bottom: solid 1px black;
        line-height: 40px;
        padding: 0 5px;
      }

      h3 {
        margin-top: 40px;
      }

      ol, ul {
        margin: 0;
        padding: 0;
        list-style-position: inside;

        li {
          padding-left: 40px;
        }
      }

      ol {
        margin-top: 40px;
        margin-bottom: 40px;
      }

      pre {
        margin-top: -10px;
        margin-bottom: 10px;
        background: #fafdff;
      }

      code {
        line-height: 40px;
      }

      .text-bubbles {
        display: block;
        color: #4697c9;
        margin: 40px 0;
      }

      .text-firescar {
        color: #c94646;
        margin: 40px 0;
        display: block;
      }

      #journalForeground {
        position: relative;
      }
    }

    #journalBackground {
      position: absolute;
      width: 100%;
      height: 100%;
      background: url('./gridpaper.png');
      background-repeat: repeat repeat;
      background-size: 50%;
      opacity: 50%;
    }
  }

  #fallingSnow {
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
    display: flex;
    position: absolute;
    pointer-events: none;
    overflow: hidden;

    &:nth-of-type(2) span {
      animation: fallingSnow 10s infinite linear;
    }

    span:nth-child(2n+1) {
      animation-delay: 7.75s;
    }
    span:nth-child(3n) {
      animation-delay: 3.25s;
    }
    span:nth-child(3n+2) {
      animation-delay: 1.5s;
    }
    span:nth-child(4n) {
      animation-delay: 2.75;
    }
    span:nth-child(5n) {
      animation-delay: 1s;
    }
    span {
      margin: 0 auto;
      width: 30px;
      height: 30px;
      background-size: cover;
      background-image:url("/images/snowflake.png");
      animation: fallingSnow 12s infinite linear;
      transform: translateY(-80px);
    }

    @keyframes fallingSnow {
      0% {
        opacity: 1;

        transform: translate(0, -80px) rotateZ(0deg);
      }
      75% {
        opacity: 1;

      transform: translate(100px, 75vh) rotateZ(270deg);
      }
      100% {
        opacity: 0;

        transform: translate(150px, 100vh) rotateZ(360deg);
      }
    }
  }
}
</style>
