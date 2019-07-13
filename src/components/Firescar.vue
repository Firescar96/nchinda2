<template>
  <div id="firescarPage">
    <div>Firescar96</div>

    <div v-for="(post, index) in posts" :key="index" class="postSummary">
      <div class="link" @click="selectedPost=post" v-html="post.title" />
      <div v-html="post.date" />
    </div>

    <div v-if="selectedPost" id="selectedPost" ref="selectedPost">
      <div class="back" @click="selectedPost=null">
        ←
      </div>
      <div id="postContent" ref="postContent">
        <div ref="generatedText" v-html="selectedPost.fullText" />
      </div>
    </div>
  </div>
</template>

<script>
import Component from 'vue-class-component';
import { parseMarkdown } from '../utils';

const NUM_POSTS = 1;
export default
@Component()
class Welcome {
  data() {
    return {
      posts: [],
      selectedPost: null,
    };
  }

  mounted() {
    //lavalamp wallpaper
  }

  async created() {
    let posts = [];
    for(let i = NUM_POSTS; i > 0; i--) {
      posts.push(fetch(`/static/firescar/${i}.md`));
    }
    posts = await Promise.all(posts);
    posts = posts.map(async post => post.text());
    posts = await Promise.all(posts);
    posts = posts.map(post => parseMarkdown(post));

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

  .postSummary {
    text-align: left;
  }
}
</style>
