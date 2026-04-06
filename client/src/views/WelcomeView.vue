<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()
const showConfirm = ref(false)

const cards = [
  {
    key: 'dashboard',
    icon: '📊',
    title: 'Mon Dashboard',
    description: 'Vue globale de vos investissements, marchés en temps réel et performances.',
    route: '/dashboard',
    color: '#4f46e5',
    gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
  },
  {
    key: 'portfolios',
    icon: '💼',
    title: 'Mes Portefeuilles',
    description: 'Gérez vos positions crypto, suivez vos gains et pertes par portefeuille.',
    route: '/portfolios',
    color: '#0891b2',
    gradient: 'linear-gradient(135deg, #0891b2, #0e7490)',
  },
  {
    key: 'actus',
    icon: '📰',
    title: 'Actus Cryptos',
    description: 'Restez informé des dernières nouvelles du marché crypto en temps réel.',
    route: '/actus',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669, #047857)',
  },
]

async function confirmLogout() {
  showConfirm.value = false
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="welcome-page">
    <header class="welcome-header">
      <span class="brand">CryptoFolio</span>
      <div class="header-right">
        <span class="username">{{ authStore.user?.username }}</span>
        <button class="btn-logout" @click="showConfirm = true">Déconnexion</button>
      </div>
    </header>

    <main class="welcome-main">
      <div class="hero">
        <h1 class="hero-title">Bienvenue, <span class="hero-name">{{ authStore.user?.username }}</span> 👋</h1>
        <p class="hero-subtitle">Que souhaitez-vous faire aujourd'hui ?</p>
      </div>

      <div class="cards-grid">
        <div
          v-for="card in cards"
          :key="card.key"
          class="nav-card"
          :style="{ '--card-gradient': card.gradient }"
          @click="router.push(card.route)"
        >
          <div class="card-glow"></div>
          <span class="card-icon">{{ card.icon }}</span>
          <h2 class="card-title">{{ card.title }}</h2>
          <p class="card-desc">{{ card.description }}</p>
          <span class="card-arrow">Accéder →</span>
        </div>
      </div>
    </main>
  </div>

  <ConfirmDialog
    v-if="showConfirm"
    message="Voulez-vous vraiment vous déconnecter ?"
    @confirm="confirmLogout"
    @cancel="showConfirm = false"
  />
</template>

<style scoped>
.welcome-page {
  min-height: 100vh;
  background: #0f0f1a;
  display: flex;
  flex-direction: column;
}

.welcome-header {
  padding: 1.25rem 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: #a5b4fc;
  letter-spacing: -0.02em;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username {
  font-size: 0.875rem;
  color: #64748b;
}

.btn-logout {
  padding: 0.35rem 0.875rem;
  background: transparent;
  border: 1px solid #1e293b;
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

.welcome-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
}

.hero {
  text-align: center;
  margin-bottom: 3.5rem;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 0.75rem;
  letter-spacing: -0.03em;
}

.hero-name {
  background: linear-gradient(135deg, #a5b4fc, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: #64748b;
  margin: 0;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  width: 100%;
  max-width: 900px;
}

.nav-card {
  position: relative;
  background: #1a1a2e;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.nav-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  border-color: rgba(255,255,255,0.12);
}

.nav-card:hover .card-glow {
  opacity: 1;
}

.card-glow {
  position: absolute;
  top: -60px;
  left: -60px;
  width: 200px;
  height: 200px;
  background: var(--card-gradient);
  border-radius: 50%;
  opacity: 0;
  filter: blur(60px);
  transition: opacity 0.4s;
  pointer-events: none;
}

.card-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
}

.card-desc {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
  flex: 1;
}

.card-arrow {
  font-size: 0.875rem;
  font-weight: 600;
  color: #a5b4fc;
  transition: transform 0.2s;
  display: inline-block;
  margin-top: 0.5rem;
}

.nav-card:hover .card-arrow {
  transform: translateX(4px);
}
</style>
