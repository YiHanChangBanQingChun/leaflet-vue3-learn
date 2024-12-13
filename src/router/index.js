import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/HelloWorld',
    name: 'HelloWorld',
    component: () => import('../components/HelloWorld.vue')
  },
  {
    path: '/FunctionOne',
    name: 'FunctionOne',
    component: () => import('../components/FunctionOne.vue')
  }
  // 添加其他路由配置
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;