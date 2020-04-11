import VueRouter from 'vue-router';

export default new VueRouter({
  mode: 'history',
  routes: [
    { path: '/snowflake', component: () => import('@/components/Snowflake') },
    { path: '/firescar', component: () => import('@/components/Firescar') },
    { path: '/pebbles', component: () => import('@/components/Pebbles') },
    { path: '/bubbles', component: () => import('@/components/Bubbles') },
    { path: '*', component: () => import('@/components/Opener') },
    { path: '/live/:stream', component: () => import('@/components/Live') },
  ],
});
