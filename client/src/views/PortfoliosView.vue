<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import NavBar from '@/components/NavBar.vue'
import { usePortfolioStore } from '@/stores/portfolio.js'

const router = useRouter()
const store = usePortfolioStore()

const newPortfolioName = ref('')
const error = ref('')
const loading = ref(false)
const showForm = ref(false)

onMounted(async () => {
  await store.fetchPortfolios()
})

function formatCurrency(value) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value)
}

function formatChange(value) {
  if (value == null) return '—'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function changeClass(value) {
  if (value == null) return 'neutral'
  return value >= 0 ? 'positive' : 'negative'
}

async function handleCreate() {
  if (!newPortfolioName.value.trim()) return
  error.value = ''
  loading.value = true
  try {
    await store.createPortfolio(newPortfolioName.value.trim())
    newPortfolioName.value = ''
    showForm.value = false
  } catch (err) {
    error.value = err.error || 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}

async function handleDelete(id) {
  if (!confirm('Supprimer ce portfolio ?')) return
  await store.deletePortfolio(id)
}

function portfolioGainLoss(p) {
  const invested = store.portfolioInvestedValue(p)
  if (invested === 0) return null
  return ((store.portfolioCurrentValue(p) - invested) / invested) * 100
}
</script>

<template>
  <div class="page">
    <NavBar />

    <main class="container">
      <div class="page-header">
        <h2>Mes Portefeuilles</h2>
        <button
          v-if="store.portfolios.length < 5"
          class="btn-primary"
          @click="showForm = !showForm"
        >
          + Nouveau portefeuille
        </button>
        <span v-else class="limit-notice">Maximum 5 portefeuilles atteint</span>
      </div>

      <form v-if="showForm" @submit.prevent="handleCreate" class="create-form">
        <input
          v-model="newPortfolioName"
          type="text"
          placeholder="Nom du portefeuille (ex: Long terme)"
          required
          autofocus
        />
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Création...' : 'Créer' }}
        </button>
        <button type="button" class="btn-secondary" @click="showForm = false">Annuler</button>
      </form>

      <p v-if="error" class="error-message">{{ error }}</p>

      <div v-if="store.portfolios.length === 0" class="empty-state">
        <p>Vous n'avez pas encore de portefeuille.</p>
        <p>Créez-en un pour commencer à suivre vos cryptos !</p>
      </div>

      <div v-else class="portfolios-list">
        <div class="list-header">
          <span>Nom</span>
          <span>Valeur actuelle</span>
          <span>Investi</span>
          <span>Gain / Perte</span>
          <span></span>
        </div>

        <div
          v-for="portfolio in store.portfolios"
          :key="portfolio._id"
          class="portfolio-row"
          @click="router.push(`/portfolios/${portfolio._id}`)"
        >
          <span class="portfolio-name">{{ portfolio.name }}</span>
          <span class="portfolio-value">
            {{ formatCurrency(store.portfolioCurrentValue(portfolio)) }}
          </span>
          <span class="portfolio-invested">
            {{ formatCurrency(store.portfolioInvestedValue(portfolio)) }}
          </span>
          <span :class="['change', changeClass(portfolioGainLoss(portfolio))]">
            {{ formatChange(portfolioGainLoss(portfolio)) }}
          </span>
          <button class="btn-delete" @click.stop="handleDelete(portfolio._id)">✕</button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f0f2f5;
}

.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.page-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.limit-notice {
  font-size: 0.875rem;
  color: #888;
}

.create-form {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  background: white;
  padding: 1.25rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.create-form input {
  flex: 1;
  padding: 0.65rem 0.875rem;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
}

.create-form input:focus {
  border-color: #4f46e5;
}

.btn-primary {
  padding: 0.65rem 1.25rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.btn-primary:hover:not(:disabled) { background: #4338ca; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary {
  padding: 0.65rem 1.25rem;
  background: transparent;
  color: #555;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
}

.error-message { color: #dc2626; font-size: 0.875rem; margin-bottom: 1rem; }

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #888;
  background: white;
  border-radius: 12px;
}

.portfolios-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  overflow: hidden;
}

.list-header {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr 1.5fr 40px;
  padding: 0.75rem 1.25rem;
  background: #f8f9fa;
  font-size: 0.75rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.portfolio-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr 1.5fr 40px;
  align-items: center;
  padding: 1rem 1.25rem;
  border-top: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.15s;
}

.portfolio-row:hover { background: #f8f9ff; }

.portfolio-name {
  font-weight: 600;
  color: #1a1a2e;
}

.portfolio-value {
  font-weight: 700;
  color: #1a1a2e;
}

.portfolio-invested {
  color: #64748b;
  font-size: 0.9rem;
}

.change {
  font-size: 0.875rem;
  font-weight: 600;
}

.change.positive { color: #16a34a; }
.change.negative { color: #dc2626; }
.change.neutral { color: #94a3b8; }

.btn-delete {
  background: transparent;
  border: none;
  color: #ccc;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.25rem;
  transition: color 0.2s;
  justify-self: center;
}

.btn-delete:hover { color: #dc2626; }
</style>
