import { defineStore } from 'pinia'
import { ref } from 'vue'

import { api } from '@/api.js'
import { getCoinPrices } from '@/services/coingecko.js'

export const usePortfolioStore = defineStore('portfolio', () => {
  const portfolios = ref([])
  const currentPortfolio = ref(null)
  const prices = ref({})
  let lastPriceFetch = 0
  const PRICE_CACHE_MS = 60_000 // 60 secondes

  async function fetchPortfolios() {
    const data = await api.get('/portfolios')
    portfolios.value = data.portfolios
    await refreshPrices()
  }

  async function refreshPrices(force = false) {
    if (!force && Date.now() - lastPriceFetch < PRICE_CACHE_MS) return
    const allIds = []
    for (const p of portfolios.value) {
      for (const h of p.holdings ?? []) {
        if (h.coinGeckoId) allIds.push(h.coinGeckoId)
      }
    }
    if (currentPortfolio.value) {
      for (const h of currentPortfolio.value.holdings ?? []) {
        if (h.coinGeckoId) allIds.push(h.coinGeckoId)
      }
    }
    const uniqueIds = [...new Set(allIds)]
    if (!uniqueIds.length) return
    try {
      const data = await getCoinPrices(uniqueIds)
      prices.value = { ...prices.value, ...data }
      lastPriceFetch = Date.now()
    } catch {
      // L'API CoinGecko peut être indisponible, on continue sans prix
    }
  }

  function portfolioCurrentValue(portfolio) {
    return (portfolio.holdings ?? []).reduce((sum, h) => {
      const price = h.coinGeckoId && prices.value[h.coinGeckoId]
        ? prices.value[h.coinGeckoId].current_price
        : h.purchasePrice
      return sum + h.quantity * price
    }, 0)
  }

  function portfolioInvestedValue(portfolio) {
    return (portfolio.holdings ?? []).reduce((sum, h) => sum + h.quantity * h.purchasePrice, 0)
  }

  function portfolioChange(portfolio, period) {
    const holdings = portfolio.holdings ?? []
    if (!holdings.length) return null
    const total = portfolioCurrentValue(portfolio)
    if (total === 0) return null
    let weightedChange = 0
    for (const h of holdings) {
      const priceData = h.coinGeckoId ? prices.value[h.coinGeckoId] : null
      if (!priceData) return null
      const price = priceData.current_price
      const weight = (h.quantity * price) / total
      const change = period === '24h' ? priceData.change_24h
        : period === '7d' ? priceData.change_7d
        : priceData.change_30d
      if (change == null) return null
      weightedChange += weight * change
    }
    return weightedChange
  }

  async function createPortfolio(name) {
    const data = await api.post('/portfolios', { name })
    portfolios.value.push(data.portfolio)
    return data.portfolio
  }

  async function deletePortfolio(id) {
    await api.delete(`/portfolios/${id}`)
    portfolios.value = portfolios.value.filter(p => p._id !== id)
  }

  async function fetchPortfolio(id) {
    const data = await api.get(`/portfolios/${id}`)
    currentPortfolio.value = data.portfolio
    await refreshPrices()
    return data.portfolio
  }

  async function addHolding(portfolioId, holding) {
    const data = await api.post(`/portfolios/${portfolioId}/holdings`, holding)
    if (currentPortfolio.value?._id === portfolioId) {
      currentPortfolio.value.holdings.push(data.holding)
    }
    await refreshPrices(true)
    return data.holding
  }

  async function deleteHolding(portfolioId, holdingId) {
    await api.delete(`/portfolios/${portfolioId}/holdings/${holdingId}`)
    await fetchPortfolio(portfolioId)
  }

  return {
    portfolios, currentPortfolio, prices,
    fetchPortfolios, fetchPortfolio, refreshPrices,
    portfolioCurrentValue, portfolioInvestedValue, portfolioChange,
    createPortfolio, deletePortfolio,
    addHolding, deleteHolding,
  }
})
