<template>
  <div id="opener">
    <div>
      <div id="livestreamBox">
        <div>Active Livestreams</div>
        <!-- <a id="sportDeath" class="livestream-link" href="/live/roast">
          <img src="/live/sportdeath.png">
          <span>Steer Roast</span>
        </a> -->
        <a class="livestream-link" href="/live/lobby">
          <img src="/live/homestuck_splatter_gamzee_makara_logo_by_kunfuzi-d776nvu.png">
          <div>
            <span>Relax</span>
            <span>Be Me</span>
          </div>
        </a>
      </div>
      <div id="personaBox">
        <router-link id="snowflakeSection" to="/snowflake" class="personaSection" />
        <div class="personaRow">
          <router-link id="pebblesSection" to="/pebbles" class="personaSection" />
          <router-link id="firescarSection" to="/firescar" class="personaSection" />
        </div>
        <router-link id="bubblesSection" to="/bubbles" class="personaSection" />
      </div>
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
  }

  #livestreamBox {
    display: inline-block;
    font-family: IndieFlower;
    color: white;
    margin-top: 20px;
    margin-left: 20px;
    font-size: 40px;

    a {
      display: block;
      text-align: center;
      position: relative;

      img {
        height: 200px;
        width: auto;
      }

      div {
        text-decoration: none !important;
        color: Black;
        position: absolute;
        font-size: 40px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;

        span {
          display: block;
        }
      }

      &:hover {
        div {
          opacity: 1;
          color: white;
        }
        img {
          opacity: .4;
        }
      }
    }
  }

  #personaBox {
    display: inline-block;
    position: absolute;
    top: 50%;
    left: 60%;
    margin: auto;
    transform: translate(-50%, -50%);

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
