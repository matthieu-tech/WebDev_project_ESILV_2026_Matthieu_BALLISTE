<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import NavBar from '@/components/NavBar.vue'
import { usePortfolioStore } from '@/stores/portfolio.js'
import { searchCoin } from '@/services/coingecko.js'

const route = useRoute()
const router = useRouter()
const store = usePortfolioStore()

const showForm = ref(false)
const error = ref('')
const loading = ref(false)
const coinSuggestions = ref([])

const form = ref({
  symbol: '',
  name: '',
  quantity: '',
  purchasePrice: '',
  purchaseDate: '',
  coinGeckoId: '',
})

const COLORS = ['#4f46e5', '#7c3aed', '#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626', '#db2777', '#ea580c', '#65a30d']

onMounted(async () => {
  await store.fetchPortfolio(route.params.id)
})

// --- Indicateurs ---
const holdings = computed(() => store.currentPortfolio?.holdings ?? [])

const totalInvested = computed(() =>
  holdings.value.reduce((sum, h) => sum + h.quantity * h.purchasePrice, 0)
)

const totalCurrent = computed(() =>
  holdings.value.reduce((sum, h) => {
    const price = h.coinGeckoId && store.prices[h.coinGeckoId]
      ? store.prices[h.coinGeckoId].current_price
      : h.purchasePrice
    return sum + h.quantity * price
  }, 0)
)

const totalGainLoss = computed(() => {
  if (totalInvested.value === 0) return null
  return ((totalCurrent.value - totalInvested.value) / totalInvested.value) * 100
})

// --- Camembert SVG (groupé par crypto) ---
const pieSegments = computed(() => {
  if (!holdings.value.length) return []

  // Grouper les positions par symbole et additionner leurs valeurs
  const groups = {}
  for (const h of holdings.value) {
    const key = h.symbol
    const price = h.coinGeckoId && store.prices[h.coinGeckoId]
      ? store.prices[h.coinGeckoId].current_price
      : h.purchasePrice
    const value = h.quantity * price
    if (!groups[key]) {
      groups[key] = { symbol: key, name: h.name, coinGeckoId: h.coinGeckoId, value: 0 }
    }
    groups[key].value += value
  }

  let cumAngle = 0
  return Object.values(groups).map((g, i) => {
    const pct = totalCurrent.value > 0 ? (g.value / totalCurrent.value) * 100 : 0
    const start = cumAngle
    cumAngle += (pct / 100) * 360
    return { ...g, pct, startAngle: start, endAngle: cumAngle, color: COLORS[i % COLORS.length] }
  })
})

function polarToXY(cx, cy, r, deg) {
  const rad = (deg - 90) * Math.PI / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function slicePath(start, end) {
  const cx = 100, cy = 100, r = 90
  if (end - start >= 359.99) {
    return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx - r + 0.001} ${cy} Z`
  }
  const s = polarToXY(cx, cy, r, start)
  const e = polarToXY(cx, cy, r, end)
  const large = end - start > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`
}

// --- Recherche CoinGecko ---
let searchTimer = null
async function onSymbolInput() {
  clearTimeout(searchTimer)
  if (form.value.symbol.length < 2) { coinSuggestions.value = []; return }
  searchTimer = setTimeout(async () => {
    try {
      coinSuggestions.value = await searchCoin(form.value.symbol)
    } catch { coinSuggestions.value = [] }
  }, 400)
}

function selectSuggestion(coin) {
  form.value.symbol = coin.symbol.toUpperCase()
  form.value.name = coin.name
  form.value.coinGeckoId = coin.id
  coinSuggestions.value = []
}

// --- Actions ---
async function handleAddHolding() {
  error.value = ''
  loading.value = true
  try {
    await store.addHolding(route.params.id, {
      symbol: form.value.symbol.toUpperCase(),
      name: form.value.name,
      quantity: Number(form.value.quantity),
      purchasePrice: Number(form.value.purchasePrice),
      purchaseDate: form.value.purchaseDate,
      coinGeckoId: form.value.coinGeckoId || null,
    })
    form.value = { symbol: '', name: '', quantity: '', purchasePrice: '', purchaseDate: '', coinGeckoId: '' }
    showForm.value = false
  } catch (err) {
    error.value = err.error || 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}

async function handleDeleteHolding(holdingId) {
  if (!confirm('Supprimer cette position ?')) return
  try {
    await store.deleteHolding(route.params.id, holdingId)
  } catch (err) {
    error.value = err.error || 'Impossible de supprimer la position'
  }
}

function formatCurrency(v) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(v)
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR')
}

function formatChange(v) {
  if (v == null) return '—'
  return (v >= 0 ? '+' : '') + v.toFixed(2) + '%'
}
</script>

<template>
  <div class="page">
    <NavBar />

    <main class="container" v-if="store.currentPortfolio">
      <div class="page-header">
        <button class="btn-back" @click="router.push('/portfolios')">← Retour</button>
        <h2>{{ store.currentPortfolio.name }}</h2>
      </div>

      <!-- Indicateurs -->
      <div class="indicators-grid">
        <div class="indicator-card">
          <span class="indicator-label">Valeur actuelle</span>
          <span class="indicator-value">{{ formatCurrency(totalCurrent) }}</span>
        </div>
        <div class="indicator-card">
          <span class="indicator-label">Montant investi</span>
          <span class="indicator-value">{{ formatCurrency(totalInvested) }}</span>
        </div>
        <div class="indicator-card">
          <span class="indicator-label">Gain / Perte</span>
          <span class="indicator-value" :class="totalGainLoss >= 0 ? 'positive' : 'negative'">
            {{ formatChange(totalGainLoss) }}
          </span>
        </div>
        <div class="indicator-card">
          <span class="indicator-label">Positions</span>
          <span class="indicator-value">{{ holdings.length }}</span>
        </div>
      </div>

      <!-- Camembert + légende -->
      <div class="chart-section" v-if="holdings.length > 0">
        <h3>Répartition du portefeuille</h3>
        <div class="chart-wrapper">
          <svg viewBox="0 0 200 200" width="200" height="200">
            <path
              v-for="seg in pieSegments"
              :key="seg._id"
              :d="slicePath(seg.startAngle, seg.endAngle)"
              :fill="seg.color"
              stroke="white"
              stroke-width="2"
            />
          </svg>
          <div class="legend">
            <div v-for="seg in pieSegments" :key="seg._id" class="legend-item">
              <span class="legend-dot" :style="{ background: seg.color }"></span>
              <span class="legend-symbol">{{ seg.symbol }}</span>
              <span class="legend-pct">{{ seg.pct.toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bouton + Formulaire ajout -->
      <div class="section-header">
        <h3>Positions</h3>
        <button class="btn-primary" @click="showForm = !showForm">
          {{ showForm ? 'Annuler' : '+ Ajouter une crypto' }}
        </button>
      </div>

      <form v-if="showForm" @submit.prevent="handleAddHolding" class="holding-form">
        <div class="form-row">
          <div class="form-group" style="position:relative">
            <label>Symbole</label>
            <input v-model="form.symbol" type="text" placeholder="BTC" required @input="onSymbolInput" autocomplete="off" />
            <div v-if="coinSuggestions.length" class="suggestions">
              <div
                v-for="coin in coinSuggestions"
                :key="coin.id"
                class="suggestion-item"
                @click="selectSuggestion(coin)"
              >
                <span class="suggestion-symbol">{{ coin.symbol.toUpperCase() }}</span>
                <span class="suggestion-name">{{ coin.name }}</span>
                <span class="suggestion-id">{{ coin.id }}</span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>Nom</label>
            <input v-model="form.name" type="text" placeholder="Bitcoin" required />
          </div>
          <div class="form-group">
            <label>ID CoinGecko</label>
            <input v-model="form.coinGeckoId" type="text" placeholder="bitcoin (auto-rempli)" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Quantité</label>
            <input v-model="form.quantity" type="number" step="any" placeholder="0.5" min="0" required />
          </div>
          <div class="form-group">
            <label>Prix d'achat (USD)</label>
            <input v-model="form.purchasePrice" type="number" step="any" placeholder="45000" min="0" required />
          </div>
          <div class="form-group">
            <label>Date d'achat</label>
            <input v-model="form.purchaseDate" type="date" required />
          </div>
        </div>
        <p v-if="error" class="error-message">{{ error }}</p>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Ajout...' : 'Ajouter' }}
        </button>
      </form>

      <!-- Tableau des holdings -->
      <div v-if="holdings.length === 0 && !showForm" class="empty-state">
        Aucune position. Ajoutez votre première crypto !
      </div>

      <div v-else class="holdings-table-wrapper">
        <table class="holdings-table">
          <thead>
            <tr>
              <th>Crypto</th>
              <th>Quantité</th>
              <th>Prix achat</th>
              <th>Prix actuel</th>
              <th>Valeur investie</th>
              <th>Valeur actuelle</th>
              <th>+/-</th>
              <th>Poids</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="holding in holdings" :key="holding._id">
              <td>
                <span class="symbol-badge">{{ holding.symbol }}</span>
                <span class="holding-name">{{ holding.name }}</span>
              </td>
              <td>{{ holding.quantity }}</td>
              <td>{{ formatCurrency(holding.purchasePrice) }}</td>
              <td>
                <span v-if="holding.coinGeckoId && store.prices[holding.coinGeckoId]">
                  {{ formatCurrency(store.prices[holding.coinGeckoId].current_price) }}
                </span>
                <span v-else class="no-data">—</span>
              </td>
              <td>{{ formatCurrency(holding.quantity * holding.purchasePrice) }}</td>
              <td class="value-cell">
                <span v-if="holding.coinGeckoId && store.prices[holding.coinGeckoId]">
                  {{ formatCurrency(holding.quantity * store.prices[holding.coinGeckoId].current_price) }}
                </span>
                <span v-else>{{ formatCurrency(holding.quantity * holding.purchasePrice) }}</span>
              </td>
              <td>
                <span
                  v-if="holding.coinGeckoId && store.prices[holding.coinGeckoId]"
                  :class="((store.prices[holding.coinGeckoId].current_price - holding.purchasePrice) / holding.purchasePrice) >= 0 ? 'positive' : 'negative'"
                >
                  {{ formatChange((store.prices[holding.coinGeckoId].current_price - holding.purchasePrice) / holding.purchasePrice * 100) }}
                </span>
                <span v-else class="no-data">—</span>
              </td>
              <td>
                {{
                  totalCurrent > 0
                    ? (((holding.quantity * (holding.coinGeckoId && store.prices[holding.coinGeckoId]
                        ? store.prices[holding.coinGeckoId].current_price
                        : holding.purchasePrice)) / totalCurrent) * 100).toFixed(1)
                    : '0'
                }}%
              </td>
              <td>{{ formatDate(holding.purchaseDate) }}</td>
              <td>
                <button class="btn-delete" @click="handleDeleteHolding(holding._id)">✕</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <div v-else class="loading">Chargement...</div>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: #f0f2f5; }

.container { max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem; }

.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.page-header h2 { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; margin: 0; }

.btn-back {
  background: transparent; border: none;
  color: #4f46e5; font-size: 0.9rem; font-weight: 600; cursor: pointer; padding: 0;
}

.indicators-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.indicator-card {
  background: white; border-radius: 12px; padding: 1.25rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex; flex-direction: column; gap: 0.4rem;
}

.indicator-label { font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
.indicator-value { font-size: 1.35rem; font-weight: 700; color: #1a1a2e; }
.indicator-value.positive { color: #16a34a; }
.indicator-value.negative { color: #dc2626; }

.chart-section { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 2rem; }
.chart-section h3 { margin: 0 0 1.25rem; font-size: 1rem; font-weight: 700; color: #1a1a2e; }

.chart-wrapper { display: flex; align-items: center; gap: 2.5rem; }

.legend { display: flex; flex-direction: column; gap: 0.6rem; }
.legend-item { display: flex; align-items: center; gap: 0.5rem; }
.legend-dot { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }
.legend-symbol { font-weight: 700; font-size: 0.875rem; color: #1a1a2e; min-width: 45px; }
.legend-pct { font-size: 0.875rem; color: #64748b; }

.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.section-header h3 { font-size: 1rem; font-weight: 700; color: #1a1a2e; margin: 0; }

.holding-form {
  background: white; border-radius: 12px; padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 1.5rem;
  display: flex; flex-direction: column; gap: 1rem;
}

.form-row { display: flex; gap: 1rem; }

.form-group { display: flex; flex-direction: column; gap: 0.35rem; flex: 1; }
.form-group label { font-size: 0.8rem; font-weight: 600; color: #555; }
.form-group input { padding: 0.6rem 0.75rem; border: 1.5px solid #ddd; border-radius: 8px; font-size: 0.9rem; outline: none; }
.form-group input:focus { border-color: #4f46e5; }

.suggestions {
  position: absolute; top: 100%; left: 0; right: 0; z-index: 50;
  background: white; border: 1.5px solid #ddd; border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-height: 200px; overflow-y: auto;
}

.suggestion-item {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 0.75rem; cursor: pointer; transition: background 0.15s;
}

.suggestion-item:hover { background: #f0f2f5; }
.suggestion-symbol { font-weight: 700; font-size: 0.8rem; color: #4f46e5; min-width: 40px; }
.suggestion-name { font-size: 0.875rem; color: #333; flex: 1; }
.suggestion-id { font-size: 0.75rem; color: #aaa; }

.btn-primary {
  padding: 0.65rem 1.25rem; background: #4f46e5; color: white; border: none;
  border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer;
  transition: background 0.2s; align-self: flex-start;
}
.btn-primary:hover:not(:disabled) { background: #4338ca; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.error-message { color: #dc2626; font-size: 0.875rem; margin: 0; }

.empty-state { text-align: center; padding: 3rem; color: #888; background: white; border-radius: 12px; }

.holdings-table-wrapper { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: auto; }

.holdings-table { width: 100%; border-collapse: collapse; }
.holdings-table th {
  background: #f8f9fa; padding: 0.75rem 1rem; text-align: left;
  font-size: 0.75rem; font-weight: 600; color: #888; text-transform: uppercase; white-space: nowrap;
}
.holdings-table td { padding: 0.875rem 1rem; border-top: 1px solid #f0f0f0; font-size: 0.875rem; color: #333; }

.symbol-badge { display: inline-block; background: #eef2ff; color: #4f46e5; font-weight: 700; font-size: 0.8rem; padding: 0.2rem 0.5rem; border-radius: 4px; margin-right: 0.4rem; }
.holding-name { color: #64748b; }
.value-cell { font-weight: 600; color: #1a1a2e; }
.positive { color: #16a34a; font-weight: 600; }
.negative { color: #dc2626; font-weight: 600; }
.no-data { color: #ccc; }

.btn-delete { background: transparent; border: none; color: #ccc; cursor: pointer; font-size: 0.875rem; padding: 0.25rem; transition: color 0.2s; }
.btn-delete:hover { color: #dc2626; }

.loading { text-align: center; padding: 4rem; color: #888; }
</style>
