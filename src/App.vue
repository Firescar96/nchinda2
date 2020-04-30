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
  </div>
</template>
<style lang="scss">
html, body {
  margin: 0;
}

#app {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;

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
