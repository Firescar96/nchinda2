<template>
  <div id="app">
    <nav>
      <div>
        <router-link id="snowflakeLink" to="/snowflake">
          Snowflake
        </router-link>
      </div>
      <div>
        <router-link id="pebblesLink" to="/pebbles">
          Pebbles
        </router-link>
      </div>
      <div>
        <router-link id="firescarLink" to="/firescar">
          Firescar
        </router-link>
      </div>
      <div>
        <router-link id="bubblesLink" to="/bubbles">
          Bubbles
        </router-link>
      </div>
    </nav>
    <router-view class="main" />
    <link href="https://vjs.zencdn.net/7.6.6/video-js.css" rel="stylesheet" >
  </div>
</template>
<style src='overlayscrollbars/css/OverlayScrollbars.css'></style>
<style src='videojs-seek-buttons/dist/videojs-seek-buttons.css'></style>
<style lang="scss" src='material-icons/iconfont/material-icons.scss'></style>
<style lang="scss">
html, body {
  margin: 0;
}

#app {
  display: flex;
  position: relative; //all children should use this as their top level container
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  nav {
    display: flex;
    justify-content: space-evenly;
    background: black;
    font-size: 30px;
    z-index: 100;

    a {
      text-decoration: none;
    }
    #snowflakeLink {
      color: skyblue;
    }
    #pebblesLink {
      color: green;
    }
    #bubblesLink {
      color:grey;
    }
    #firescarLink {
      color: red;
    }
  }

  .main {
    width: 100vw;
    flex: 1;
  }
}
</style>
