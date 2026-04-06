<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import NavBar from '@/components/NavBar.vue'
import SparkLine from '@/components/SparkLine.vue'
import { useAuthStore } from '@/stores/auth.js'
import { usePortfolioStore } from '@/stores/portfolio.js'
import { getTopMarkets } from '@/services/coingecko.js'

const router = useRouter()
const authStore = useAuthStore()
const store = usePortfolioStore()

const coins = ref([])
const loadingMarkets = ref(true)
const showAllMarkets = ref(false)

onMounted(async () => {
  await store.fetchPortfolios()
  try {
    coins.value = await getTopMarkets(30)
  } catch {
    // silently fail
  } finally {
    loadingMarkets.value = false
  }
})

const totalInvested = computed(() =>
  store.portfolios.reduce((sum, p) => sum + store.portfolioInvestedValue(p), 0)
)

const totalCurrent = computed(() =>
  store.portfolios.reduce((sum, p) => sum + store.portfolioCurrentValue(p), 0)
)

const totalGainLoss = computed(() => {
  if (totalInvested.value === 0) return null
  return ((totalCurrent.value - totalInvested.value) / totalInvested.value) * 100
})

const visibleCoins = computed(() => showAllMarkets.value ? coins.value : coins.value.slice(0, 5))

function formatCurrency(v) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(v)
}

function formatPrice(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: v < 1 ? 6 : 2 }).format(v)
}

function formatChange(v) {
  if (v == null) return '—'
  return (v >= 0 ? '+' : '') + v.toFixed(2) + '%'
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
      <h2 class="page-title">Bonjour, {{ authStore.user?.username }} 👋</h2>

      <!-- Indicateurs globaux -->
      <div class="indicators-grid">
        <div class="indicator-card">
          <span class="indicator-label">Valeur totale</span>
          <span class="indicator-value">{{ formatCurrency(totalCurrent) }}</span>
        </div>
        <div class="indicator-card">
          <span class="indicator-label">Total investi</span>
          <span class="indicator-value">{{ formatCurrency(totalInvested) }}</span>
        </div>
        <div class="indicator-card">
          <span class="indicator-label">Gain / Perte global</span>
          <span class="indicator-value" :class="(totalGainLoss ?? 0) >= 0 ? 'positive' : 'negative'">
            {{ formatChange(totalGainLoss) }}
          </span>
        </div>
        <div class="indicator-card">
          <span class="indicator-label">Portefeuilles</span>
          <span class="indicator-value">{{ store.portfolios.length }} / 5</span>
        </div>
      </div>

      <!-- Résumé portefeuilles -->
      <h3 class="section-title">Mes portefeuilles</h3>

      <div v-if="store.portfolios.length === 0" class="empty-state">
        <p>Aucun portefeuille.</p>
        <button class="btn-primary" @click="router.push('/portfolios')">Créer un portefeuille</button>
      </div>

      <div v-else class="portfolios-summary">
        <div class="summary-header">
          <span>Nom</span>
          <span>Valeur actuelle</span>
          <span>Investi</span>
          <span>Gain / Perte</span>
          <span>Positions</span>
        </div>
        <div
          v-for="p in store.portfolios"
          :key="p._id"
          class="summary-card"
          @click="router.push(`/portfolios/${p._id}`)"
        >
          <span class="summary-name">{{ p.name }}</span>
          <span class="summary-value">{{ formatCurrency(store.portfolioCurrentValue(p)) }}</span>
          <span class="summary-invested">{{ formatCurrency(store.portfolioInvestedValue(p)) }}</span>
          <span :class="['summary-gain', (portfolioGainLoss(p) ?? 0) >= 0 ? 'positive' : 'negative']">
            {{ formatChange(portfolioGainLoss(p)) }}
          </span>
          <span class="summary-positions">{{ p.holdings?.length ?? 0 }} position(s)</span>
        </div>
      </div>

      <!-- Marchés -->
      <div class="markets-header">
        <h3 class="section-title" style="margin: 0">Marchés</h3>
        <button class="btn-link" @click="router.push('/markets')">Voir la page complète →</button>
      </div>

      <div v-if="loadingMarkets" class="loading-small">Chargement...</div>

      <div v-else class="table-wrapper">
        <table class="market-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Crypto</th>
              <th>Prix</th>
              <th>24h</th>
              <th>7j</th>
              <th>Graphe</th>
              <th>Cap. marché</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="coin in visibleCoins" :key="coin.id">
              <td class="rank">{{ coin.market_cap_rank }}</td>
              <td>
                <div class="coin-cell">
                  <img :src="coin.image" :alt="coin.name" class="coin-icon" />
                  <div>
                    <span class="coin-name">{{ coin.name }}</span>
                    <span class="coin-symbol">{{ coin.symbol.toUpperCase() }}</span>
                  </div>
                </div>
              </td>
              <td class="price">{{ formatPrice(coin.current_price) }}</td>
              <td :class="coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'">
                {{ formatChange(coin.price_change_percentage_24h) }}
              </td>
              <td :class="(coin.price_change_percentage_7d_in_currency ?? 0) >= 0 ? 'positive' : 'negative'">
                {{ formatChange(coin.price_change_percentage_7d_in_currency) }}
              </td>
              <td>
                <SparkLine
                  :prices="coin.sparkline_in_7d?.price"
                  :positive="(coin.price_change_percentage_7d_in_currency ?? 0) >= 0"
                />
              </td>
              <td class="muted">
                {{ coin.market_cap >= 1e9 ? '$' + (coin.market_cap / 1e9).toFixed(2) + 'B' : '$' + (coin.market_cap / 1e6).toFixed(0) + 'M' }}
              </td>
            </tr>
          </tbody>
        </table>

        <button class="btn-show-more" @click="showAllMarkets = !showAllMarkets">
          {{ showAllMarkets ? '▲ Voir moins' : `▼ Voir plus` }}
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: #f0f2f5; }
.container { max-width: 1000px; margin: 0 auto; padding: 2rem 1.5rem; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; margin: 0 0 1.5rem; }
.section-title { font-size: 1.1rem; font-weight: 700; color: #1a1a2e; margin: 2rem 0 1rem; }

.indicators-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1rem;
}

.indicator-card {
  background: white; border-radius: 12px; padding: 1.25rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 0.4rem;
}

.indicator-label { font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
.indicator-value { font-size: 1.35rem; font-weight: 700; color: #1a1a2e; }
.indicator-value.positive { color: #16a34a; }
.indicator-value.negative { color: #dc2626; }

.empty-state { text-align: center; padding: 3rem; color: #888; background: white; border-radius: 12px; }

.portfolios-summary { display: flex; flex-direction: column; gap: 0; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }

.summary-header {
  display: grid; grid-template-columns: 2fr 1.5fr 1.5fr 1fr 1fr;
  padding: 0.75rem 1.5rem; background: #f8f9fa;
  font-size: 0.75rem; font-weight: 600; color: #888; text-transform: uppercase;
}

.summary-card {
  display: grid; grid-template-columns: 2fr 1.5fr 1.5fr 1fr 1fr;
  align-items: center; padding: 1rem 1.5rem;
  border-top: 1px solid #f0f0f0;
  cursor: pointer; transition: background 0.15s;
}
.summary-card:hover { background: #f8f9ff; }

.summary-name { font-weight: 600; color: #1a1a2e; }
.summary-value { font-weight: 700; color: #1a1a2e; }
.summary-invested { color: #64748b; font-size: 0.9rem; }
.summary-gain { font-weight: 600; font-size: 0.9rem; }
.summary-positions { font-size: 0.875rem; color: #94a3b8; }
.positive { color: #16a34a; }
.negative { color: #dc2626; }

.markets-header { display: flex; align-items: center; justify-content: space-between; margin: 2rem 0 1rem; }

.btn-link { background: none; border: none; color: #4f46e5; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
.btn-link:hover { text-decoration: underline; }

.loading-small { color: #888; font-size: 0.875rem; padding: 1rem 0; }

.table-wrapper { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }

.market-table { width: 100%; border-collapse: collapse; }
.market-table th {
  background: #f8f9fa; padding: 0.75rem 1rem; text-align: left;
  font-size: 0.75rem; font-weight: 600; color: #888; text-transform: uppercase; white-space: nowrap;
}
.market-table td { padding: 0.875rem 1rem; border-top: 1px solid #f0f0f0; font-size: 0.875rem; }

.rank { color: #94a3b8; font-size: 0.8rem; }
.coin-cell { display: flex; align-items: center; gap: 0.75rem; }
.coin-icon { width: 26px; height: 26px; border-radius: 50%; }
.coin-name { display: block; font-weight: 600; color: #1a1a2e; font-size: 0.875rem; }
.coin-symbol { display: block; font-size: 0.75rem; color: #94a3b8; }
.price { font-weight: 600; color: #1a1a2e; }
.muted { color: #64748b; }

.btn-show-more {
  width: 100%; padding: 0.875rem; background: #f8f9fa; border: none; border-top: 1px solid #f0f0f0;
  color: #4f46e5; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: background 0.15s;
}
.btn-show-more:hover { background: #f0f2ff; }

.btn-primary {
  padding: 0.65rem 1.25rem; background: #4f46e5; color: white; border: none;
  border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; margin-top: 1rem;
}
.btn-primary:hover { background: #4338ca; }
</style>
