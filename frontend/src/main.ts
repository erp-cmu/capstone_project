import { useAuthStore } from '@/lib/store';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';

import './style.css';

import App from '@/App.vue';
import AboutView from '@/pages/About.vue';
import HomeView from '@/pages/Home.vue';
import LoginView from '@/pages/Login.vue';

const routes = [
  {
    path: '/',
    component: HomeView,
    name: 'home',
    meta: { requiresAuth: false },
  },
  {
    path: '/about',
    component: AboutView,
    name: 'about',
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

router.beforeEach((to, _from) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated; // returns boolean

  // Route requires auth, but user is NOT logged in
  console.log('Checking authentication for route:', to.fullPath);
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login page and save the intended target route
    return { name: 'login', query: { redirect: to.fullPath } };
  } else {
    // Otherwise, allow navigation
    return;
  }
});

const pinia = createPinia();

createApp(App).use(router).use(pinia).mount('#app');
