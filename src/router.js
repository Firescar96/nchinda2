import VueRouter from 'vue-router'
import Opener from "@/components/Opener.vue";
import Snowflake from "@/components/Snowflake.vue";
import Firescar from "@/components/Firescar.vue";
import Pebbles from "@/components/Pebbles.vue";
import Bubbles from "@/components/Bubbles.vue";

export default new VueRouter({
  mode: 'history',
  routes: [
    {path: '/', component: Opener},
    {path: '/snowflake', component: Snowflake},
    {path: '/firescar', component: Firescar},
    {path: '/pebbles', component: Pebbles},
    {path: '/bubbles', component: Bubbles},
  ]
})