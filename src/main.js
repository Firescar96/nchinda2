import Vue from 'vue';
import VueRouter from 'vue-router';
import marked from 'marked';
import { OverlayScrollbarsPlugin } from 'overlayscrollbars-vue';
import App from './App';

import router from './router';

Vue.use(OverlayScrollbarsPlugin);

Vue.use(VueRouter);
Vue.config.productionTip = false;

marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
});

new Vue({
  components: { App },
  template: '<App/>',
  router,
}).$mount('#app');
