const BASE = 'https://api.coingecko.com/api/v3'

export async function getCoinPrices(ids) {
  if (!ids.length) return {}
  const url = `${BASE}/coins/markets?vs_currency=usd&ids=${ids.join(',')}&price_change_percentage=24h,7d,30d`
  const res = await fetch(url)
  if (!res.ok) throw new Error('CoinGecko API error')
  const coins = await res.json()
  return coins.reduce((acc, c) => {
    acc[c.id] = {
      current_price: c.current_price,
      change_24h: c.price_change_percentage_24h,
      change_7d: c.price_change_percentage_7d_in_currency,
      change_30d: c.price_change_percentage_30d_in_currency,
    }
    return acc
  }, {})
}

export async function getTopMarkets(limit = 20) {
  const url = `${BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h,7d`
  const res = await fetch(url)
  if (!res.ok) throw new Error('CoinGecko API error')
  return res.json()
}

export async function searchCoin(query) {
  const url = `${BASE}/search?query=${encodeURIComponent(query)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('CoinGecko API error')
  const data = await res.json()
  return data.coins.slice(0, 5)
}

export async function getNews() {
  const url = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=popular'
  const res = await fetch(url)
  if (!res.ok) throw new Error('News API error')
  const data = await res.json()
  return data.Data
}
