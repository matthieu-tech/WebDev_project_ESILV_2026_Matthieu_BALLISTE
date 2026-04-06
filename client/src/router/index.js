import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/welcome' },
    { path: '/welcome', component: () => import('@/views/WelcomeView.vue') },
    { path: '/login', component: () => import('@/views/LoginView.vue'), meta: { public: true } },
    { path: '/register', component: () => import('@/views/RegisterView.vue'), meta: { public: true } },
    { path: '/dashboard', component: () => import('@/views/DashboardView.vue') },
    { path: '/portfolios', component: () => import('@/views/PortfoliosView.vue') },
    { path: '/portfolios/:id', component: () => import('@/views/PortfolioDetailView.vue') },
    { path: '/markets', component: () => import('@/views/MarketView.vue') },
    { path: '/actus', component: () => import('@/views/ActusView.vue') },
  ],
})

router.beforeEach(async (to) => {
  if (to.meta.public) return true
  const authStore = useAuthStore()
  if (!authStore.user) await authStore.fetchCurrentUser()
  if (!authStore.user) return '/login'
  return true
})

export default router
