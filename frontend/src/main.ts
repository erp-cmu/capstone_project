import { checkLoginStatus } from '@/composables/useAuth';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';

import './style.css';

import App from '@/App.vue';
import EvauationView from '@/pages/Evaluation.vue';
import HomeView from '@/pages/Home.vue';
import LoginView from '@/pages/Login.vue';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10, // 10 seconds
    },
  },
});

const routes = [
  {
    path: '/',
    component: HomeView,
    name: 'home',
    meta: { requiresAuth: false },
  },
  {
    path: '/evaluation',
    component: EvauationView,
    name: 'evaluation',
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    component: LoginView,
    name: 'login',
    meta: { requiresAuth: false },
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(async (to, _from) => {
  const { isAuthenticated } = await queryClient.query({
    queryKey: ['authStatus'],
    queryFn: checkLoginStatus,
  });
  // Route requires auth, but user is NOT logged in
  // console.log('Checking authentication for route:', to.fullPath);
  // console.log('User is authenticated:', isAuthenticated);
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login page and save the intended target route
    return { name: 'login', query: { redirect: to.fullPath } };
  } else {
    // Otherwise, allow navigation
    return;
  }
});

const pinia = createPinia();

createApp(App)
  .use(pinia)
  .use(VueQueryPlugin, { queryClient })
  .use(router)
  .mount('#app');
