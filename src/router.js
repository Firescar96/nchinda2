import VueRouter from 'vue-router';
import Opener from '@/components/Opener';
import Snowflake from '@/components/Snowflake';
import Firescar from '@/components/Firescar';
import Pebbles from '@/components/Pebbles';
import Bubbles from '@/components/Bubbles';

export default new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: Opener },
    { path: '/snowflake', component: Snowflake },
    { path: '/firescar', component: Firescar },
    { path: '/pebbles', component: Pebbles },
    { path: '/bubbles', component: Bubbles },
  ],
});
