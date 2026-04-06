<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useAuthStore } from '@/stores/auth.js'
import { useTheme } from '@/composables/useTheme.js'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { dark, toggle } = useTheme()
const showConfirm = ref(false)

async function confirmLogout() {
  showConfirm.value = false
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="navbar">
    <span class="brand">CryptoFolio</span>

    <div class="nav-links">
      <RouterLink to="/dashboard" :class="{ active: route.path === '/dashboard' }">
        Tableau de bord
      </RouterLink>
      <RouterLink to="/portfolios" :class="{ active: route.path.startsWith('/portfolios') }">
        Portefeuilles
      </RouterLink>
      <RouterLink to="/markets" :class="{ active: route.path === '/markets' }">
        Marchés
      </RouterLink>
      <RouterLink to="/actus" :class="{ active: route.path === '/actus' }">
        Actus Cryptos
      </RouterLink>
    </div>

    <div class="nav-right">
      <button class="btn-theme" @click="toggle">
        <svg v-if="dark" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <span>{{ dark ? 'Dark' : 'Light' }}</span>
      </button>
      <span class="username">{{ authStore.user?.username }}</span>
      <button class="btn-logout" @click="showConfirm = true">Déconnexion</button>
    </div>
  </nav>

  <ConfirmDialog
    v-if="showConfirm"
    message="Voulez-vous vraiment vous déconnecter ?"
    @confirm="confirmLogout"
    @cancel="showConfirm = false"
  />
</template>

<style scoped>
.navbar {
  background: #1a1a2e;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.brand {
  font-size: 1.2rem;
  font-weight: 700;
  color: #a5b4fc;
  white-space: nowrap;
}

.nav-links {
  display: flex;
  gap: 0.25rem;
  flex: 1;
}

.nav-links a {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.4rem 0.875rem;
  border-radius: 6px;
  transition: all 0.2s;
  white-space: nowrap;
}

.nav-links a:hover,
.nav-links a.active {
  background: rgba(165, 180, 252, 0.1);
  color: #a5b4fc;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  white-space: nowrap;
}

.username {
  font-size: 0.875rem;
  color: #64748b;
}

.btn-logout {
  padding: 0.35rem 0.75rem;
  background: transparent;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #64748b;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.btn-theme {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: transparent;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 0.35rem 0.65rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  line-height: 1;
  transition: border-color 0.2s, color 0.2s;
  font-family: inherit;
}

.btn-theme:hover {
  border-color: #a5b4fc;
  color: #a5b4fc;
}
</style>
