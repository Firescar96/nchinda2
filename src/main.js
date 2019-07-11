import Vue from "vue";
import App from "./App.vue";
import VueRouter from 'vue-router'

Vue.use(VueRouter)
Vue.config.productionTip = false;

import router from './router'

new Vue({
  render: h => h(App),
  router
}).$mount("#app");
