<script setup>
import { ref, onMounted } from 'vue'

import NavBar from '@/components/NavBar.vue'
import SparkLine from '@/components/SparkLine.vue'
import { getTopMarkets } from '@/services/coingecko.js'

const coins = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    coins.value = await getTopMarkets(30)
  } catch {
    error.value = 'Impossible de charger les données de marché.'
  } finally {
    loading.value = false
  }
})

function formatCurrency(v) {
  if (v >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B'
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)
}

function formatPrice(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: v < 1 ? 6 : 2 }).format(v)
}

function formatChange(v) {
  if (v == null) return '—'
  return (v >= 0 ? '+' : '') + v.toFixed(2) + '%'
}
</script>

<template>
  <div class="page">
    <NavBar />

    <main class="container">
      <h2 class="page-title">Marchés — Top 30</h2>

      <div v-if="loading" class="loading">Chargement des marchés...</div>
      <p v-else-if="error" class="error-message">{{ error }}</p>

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
              <th>Volume 24h</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="coin in coins" :key="coin.id">
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
              <td class="muted">{{ formatCurrency(coin.market_cap) }}</td>
              <td class="muted">{{ formatCurrency(coin.total_volume) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: #f0f2f5; }
.container { max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; margin: 0 0 1.5rem; }
.loading { text-align: center; padding: 4rem; color: #888; }
.error-message { color: #dc2626; }

.table-wrapper { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: auto; }

.market-table { width: 100%; border-collapse: collapse; }
.market-table th {
  background: #f8f9fa; padding: 0.75rem 1rem; text-align: left;
  font-size: 0.75rem; font-weight: 600; color: #888; text-transform: uppercase; white-space: nowrap;
}
.market-table td { padding: 0.875rem 1rem; border-top: 1px solid #f0f0f0; font-size: 0.875rem; }

.rank { color: #94a3b8; font-size: 0.8rem; }
.coin-cell { display: flex; align-items: center; gap: 0.75rem; }
.coin-icon { width: 28px; height: 28px; border-radius: 50%; }
.coin-name { display: block; font-weight: 600; color: #1a1a2e; font-size: 0.9rem; }
.coin-symbol { display: block; font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; }
.price { font-weight: 600; color: #1a1a2e; }
.positive { color: #16a34a; font-weight: 600; }
.negative { color: #dc2626; font-weight: 600; }
.muted { color: #64748b; }
</style>
