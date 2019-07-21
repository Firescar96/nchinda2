<template>
  <div id="firescarPage">
    <div id="lavalamp">
      <div class="fire">
        <div v-for="ball in lavaballs" :key="ball" class="burn" />
        <div v-for="ball in lavaballs" :key="ball" class="burn heat" />
      </div>
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
        <span class="termUser">firecar96@comsat1</span>
        <span class="termDir">~/public</span> $ cat posts/{{ selectedPost.index }}.md
        <div ref="generatedText" v-html="selectedPost.fullText" />
        <br>
        <span class="termUser">firecar96@comsat1</span>
        <span class="termDir">~/public</span> $
        <span class="cursor" />
      </div>
    </div>
  </div>
</template>

<script>
import Component from 'vue-class-component';
import marked from 'marked';

const NUM_POSTS = 1;
export default
@Component()
class Welcome {
  data() {
    return {
      posts: [],
      selectedPost: null,
      lavaballs: new Array(15),
    };
  }

  async created() {
    let posts = [];
    for(let i = NUM_POSTS; i > 0; i--) {
      posts.push(fetch(`/static/firescar/${i}.md`));
    }
    posts = await Promise.all(posts);
    posts = posts.map(async post => post.text());
    posts = await Promise.all(posts);
    posts = posts.map((post) => {
      const tokens = marked.lexer(post);
      let [title, date] = tokens.splice(0, 2);

      [title, date] = [title, date].map((_raw) => {
        const raw = [_raw];
        raw.links = {};
        return marked.parser(raw);
      });

      const fullText = marked.parser(tokens);

      return {
        title, date, fullText,
      };
    });

    posts.forEach((post, index) => { post.index = index + 1; });
    this.posts = posts;
  }
}
</script>
<style lang="scss">
@font-face {
    font-family: "VT323";
    src: url("../../static/fonts/VT323/VT323-Regular.ttf");
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
      position: absolute;
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

      .termUser {
        color: #00AA00;
      }

      .termDir {
        color: #5555FF;
      }

      p, li {
        margin: 0;
        line-height: 30px;
        white-space: pre;
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
