<template>
  <div>
  <nav>
    <div><router-link to="/snowflake">Snowflake</router-link></div>
    <div><router-link to="/pebbles">Pebbles</router-link></div>
    <div><router-link to="/firescar">Firescar</router-link></div>
    <div><router-link to="/bubbles">Bubbles</router-link></div>
  </nav>
  <div>
    Nchinda Nchinda
  </div>
  </div>
</template>

<script>
import Component from 'vue-class-component';

export default
@Component()
class Welcome {
  mounted() {
    
  }

  created() {

  }
};
</script>
<style>
nav {
  height: 20px;
  display: flex;
  flex-direction: row;
}
</style>
