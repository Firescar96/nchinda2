<template>
  <div id="bubblesPage">
    <div>Bubbles</div>

    - var parts = 50;
    .fire
    - while (parts--) {
    .particle
    - }

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

  mounted() {}

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

body {
	background-color: rgb(48,8,8);
	margin: 0;
}
.fire {
	font-size: 24px;
	filter: blur($blur);
	margin: 3em auto 0 auto;
	position: relative;
	width: 10em;
	height: 12em;
}
.particle {
	animation: rise $dur ease-in infinite, color $dur infinite;
	border-radius: 50%;
	mix-blend-mode: screen;
	opacity: 0;
	position: absolute;
	bottom: 0;
	width: $partSize;
	height: $partSize;
	// spread particles out in time and x-position to get desired effect
	@for $p from 1 through $parts {
		&:nth-of-type(#{$p}) {
			animation-delay: $dur * random();
			left: calc((100% - #{$partSize}) * #{($p - 1)/$parts});
		}
	}
}
@keyframes rise {
	from {
		opacity: 0;
		transform: translateY(0) scale(1);
	}
	25% {
		opacity: 1;
	}
	to {
		opacity: 0;
		transform: translateY(-10em) scale(0);
	}
}
@keyframes color {
	from {
		background-image: radial-gradient(#960055 20%, rgba(255,0,0,0) 70%);
	}
	to {
		background-image: radial-gradient(#960000 20%, rgba(255,0,0,0) 70%);
	}
}

  .postSummary {
    text-align: left;
  }
}
</style>
