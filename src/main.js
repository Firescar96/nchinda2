import Vue from 'vue';
import VueRouter from 'vue-router';
import marked from 'marked';
import vSelect from 'vue-select';
import { OverlayScrollbarsPlugin } from 'overlayscrollbars-vue';
import VueCompositionAPI from '@vue/composition-api';
import { TooltipPlugin } from 'bootstrap-vue';
import App from './App';

import router from './router';

Vue.use(OverlayScrollbarsPlugin);

Vue.component('VSelect', vSelect);
Vue.use(VueRouter);
Vue.use(VueCompositionAPI);
Vue.use(TooltipPlugin);
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
