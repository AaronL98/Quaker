import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import MapPage from '../pages/MapPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Map',
    component: MapPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
