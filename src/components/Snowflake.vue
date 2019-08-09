<template>
  <div id="snowflakePage">
    <div id="fallingSnow">
      <span v-for="i in snowflakes" :key="i" />
    </div>
    <div id="fallingSnow">
      <span v-for="i in snowflakes" :key="i" />
    </div>

    <div v-for="(post, index) in posts" :key="index" class="postSummary">
      <div class="link" @click="selectedPost=post" v-html="post.title" />
      <div v-html="post.date" />
    </div>

    <div v-if="selectedPost" id="selectedPost" ref="selectedPost">
      <div class="back" @click="selectedPost=null">
        ←
      </div>
      <div id="postContent" ref="postContent">
        <div v-html="selectedPost.fullText" />
        <div id="journalBackground" ref="journalBackground" />
      </div>
    </div>
  </div>
</template>

<script>
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import marked from 'marked';

const NUM_POSTS = 2;
export default
@Component()
class Welcome {
  data() {
    return {
      posts: [],
      selectedPost: null,
      snowflakes: new Array(12),
    };
  }

  @Watch('selectedPost')
  async updateBlankLines() {
    if(!this.selectedPost) return;
    //wait for the dom to rerender
    await this.$nextTick();

    //calculate how many spacer lines are needed
    //number of pixels to space from top empirically chosen as 96
    this.$refs.journalBackground.style.marginTop = `${document.querySelector('#postContent h1').offsetHeight + 22}px`;
    const numSpacers = (this.$refs.journalBackground.getBoundingClientRect().height) / 40 - 1;
    for(let i = 0; i < numSpacers; i++) {
      console.log('here', i);
      const div = document.createElement('div');
      div.classList.add('spacer');
      this.$refs.journalBackground.append(div);
    }
  }

  async created() {
    window.updateBlankLines = this.updateBlankLines;
    let posts = [];
    for(let i = NUM_POSTS; i > 0; i--) {
      posts.push(fetch(`/static/snowflake/${i}.md`));
    }
    posts = await Promise.all(posts);
    posts = posts.map(async post => post.text());
    posts = await Promise.all(posts);
    posts = posts.map((post) => {
      const tokens = marked.lexer(post);
      let title = tokens.find(x => x.type === 'heading');
      let [date] = tokens.filter(x => x.type === 'paragraph');

      [title, date] = [title, date].map((_raw) => {
        const raw = [_raw];
        raw.links = {};
        return marked.parser(raw);
      });

      const fullText = marked(post);
      return {
        title, date, fullText,
      };
    });

    this.posts = posts;
  }
}
</script>
<style lang="scss">
@font-face {
    font-family: "Aladin";
    src: url("../../static/fonts/Aladin/Aladin-Regular.ttf");
}

#snowflakePage {
  font-family: 'Aladin';
  font-size: 25px;
  background-color: #bfd0cf;
  background-image: url('../../static/images/snowflake-paper.jpg');
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
    background: snow;
    z-index: 1000;

    .back {
      position: absolute;
      top: 10px;
      left: 20px;
      font-size: 80px;
      cursor: grab;
    }

    #postContent {
      margin: auto;
      max-width: 960px;
      width: 80%;
      min-height: 100%;
      text-align: left;
      padding-left: 2px;
      border-left: double 5px black;
      position: relative;

      h1 {
        margin-top: 0;
      }

      p, li {
        margin: 0;
        // border-bottom: solid 1px black;
        line-height: 40px;
        padding: 0 5px;
      }

      ul {
        margin: 0;
        padding: 0;
        list-style-position: inside;

        li {
          padding-left: 40px;
        }
      }
    }

    #journalBackground {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;

      .spacer {
        height: 39px;
        border-bottom: solid 1px black;
      }
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
      background-image:url("../../static/images/snowflake.png");
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
