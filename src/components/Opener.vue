<template>
  <div id="opener">
    <div id="personaBox">
      <router-link id="snowflakeSection" to="/snowflake" class="personaSection" />
      <div class="personaRow">
        <router-link id="pebblesSection" to="/pebbles" class="personaSection" />
        <router-link id="firescarSection" to="/firescar" class="personaSection" />
      </div>
      <router-link id="bubblesSection" to="/bubbles" class="personaSection" />
    </div>
  </div>
</template>

<style lang="scss">
  @font-face {
      font-family: "IndieFlower";
      src: url("/fonts/Indie_Flower/IndieFlower-Regular.ttf");
  }

  #opener {
    background: black;
    display: flex;
  }

  #personaBox {
    display: inline-block;
    margin: auto;

    .personaRow {
      display: flex;
      width: 600px;
      justify-content: space-between;
    }

    .personaSection {
      width: 200px;
      height: 200px;
      margin: auto;
      border: solid 1px white;
      transform: rotateZ(45deg);
      display: block;

      &:before {
        content: "";
        top: 0;
        left: 0;
        position: absolute;
        width: 100%;
        height: 100%;
      transform: rotateZ(-45deg);
      }
    }

    #snowflakeSection:before {
      background-image: url('/images/snowflake-logo.png');
      background-repeat: no-repeat;
      background-size: 180px;
      background-position-x: 10px;
      background-position-y: 0px;
    }
    #firescarSection:before {
      background-image: url('/images/firescar-logo.png');
      background-repeat: no-repeat;
      background-size: 240px;
      background-position-x: -20px;
      background-position-y: -10px;
    }
    #pebblesSection:before {
      background-image: url('/images/pebbles-logo.png');
      background-size: cover;
      background-repeat: no-repeat;
      background-size: 180px;
      background-position-x: 10px;
      background-position-y: 0px;
    }
    #bubblesSection:before {
      background-image: url('/images/bubbles-logo.png');
      background-size: cover;
    }
  }
</style>
