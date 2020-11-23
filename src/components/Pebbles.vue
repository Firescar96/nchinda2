<template>
  <div id="pebblesPage">
    <div v-for="(post, index) in posts" :key="index" class="postSummary">
      <div class="link" @click="selectPost(post.index)" v-html="post.title" />
      <div v-html="post.date" />
    </div>

    <div v-if="selectedPost" id="selectedPost" ref="selectedPost">
      <div id="windowFrame">
        <span>Pesterchum - <span v-html="selectedPost.title" /></span>
        <div class="back" @click="selectPost(null)">
          <span>X</span>
        </div>
      </div>
      <div id="header">
        Welcome to <span class="highlight">[shitpost central]</span>
      </div>
      <div id="notHeader">
        <div id="postContent" ref="postContent">
          <div id="joinMessage">
            Pebbles joined the chat at <span v-html="selectedPost.date" />
          </div>
          <div id="generatedText" ref="generatedText" v-html="selectedPost.fullText" />
          <div id="messageBox">
            <span>Message:</span> <textarea placeholder="trollbox coming soon" rows="2" disabled />
            <input type="submit" disabled>
          </div>
        </div>
        <div id="usersBox">
          <div><span class="highlight">[shitpost central]</span></div>
          <div>[<span class="fakeLink">Online Users</span>]</div>
          <div>[<span class="fakeLink">All</span>]</div>
          <div>[<span class="fakeLink">Pebbles</span>]</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Component from 'vue-class-component';
import { loadPosts } from '@/utility';

const NUM_POSTS = 4;
export default
@Component()
class Pebbles {
  data() {
    return {
      posts: [],
      selectedPost: null,
    };
  }

  async created() {
    await loadPosts('pebbles', NUM_POSTS, this);
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
    font-family: "NovaFlat";
    src: url("/fonts/Nova_Flat/NovaFlat-Regular.ttf");
}

#pebblesPage {
  font-family: NovaFlat;
  animation: puke 5s infinite alternate;
  background: #4d1600;

  .postSummary {
    padding-left: 20px;
    text-align: left;
    color: wheat;

    .link {
      cursor:grab;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  #selectedPost {
    position: absolute;
    overflow: hidden;
    top: 0;
    left: 0;
    right:0;
    bottom:0;
    background: navajowhite;
    z-index: 1000;

    #windowFrame {
      display: flex;
      width: 100%;
      height: 30px;
      background-image: linear-gradient(#38acff, blue, #4e8dff);
      border: inset 2px teal;
      color: white;
      text-align: left;
      justify-content: space-between;

      span {
        margin: auto 0;
      }

      h1 {
        font-size: 1em;
        display: inline;
      }

      .back {
        margin: auto 10px;
        width: 20px;
        height: 20px;
        font-family: sans-serif;
        font-size: 18px;
        font-weight: bold;
        border: solid 1px white;
        background-image: linear-gradient(-45deg, #ff3838, #ff0000, #ffdbdb);
        display: flex;
        justify-content: center;
        cursor: grab;
      }
    }

    .highlight {
      color: red;
    }

    .fakeLink {
      color: blue;
    }

    #notHeader {
      display: flex;

      #postContent {
        width: 960px;
        margin: auto;
        text-align: left;

        #joinMessage {
          color:blue;
          padding: 20px 10px 0 10px;
          background: antiquewhite;
          p {display: inline}
        }

        #generatedText {
          padding: 0 10px 20px 10px;
          background: antiquewhite;
          height: 600px;
          overflow-y: auto;

          // hide title and date
          h1, .date {
            display: none;
          }

          p:before, li:before {
            content: 'Pebbles:';
            margin-right: 10px;
            color: green;
          }

          ul {
            list-style: none;
            padding: 0;
          }
        }

        #messageBox {
          background: burlywood;
          min-height: 100px;
          display: flex;
          justify-content: center;

          textarea {
            width: 600px;
          }
          * {
            margin: auto 10px;
          }
        }
      }

      #usersBox {
        flex: 1;
        flex-direction: column;

        div {
          margin: 40px 0;
        }
      }
    }
  }
}
</style>
