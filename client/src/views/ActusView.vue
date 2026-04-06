<script setup>
import { ref, onMounted } from 'vue'

import NavBar from '@/components/NavBar.vue'
import { api } from '@/api.js'

const articles = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const data = await api.get('/actus')
    articles.value = data.articles
  } catch {
    error.value = 'Impossible de charger les actualités.'
  } finally {
    loading.value = false
  }
})

const SOURCE_STYLES = {
  'Cryptoast': { bg: '#fbbf24' },
  'Journal du Coin': { bg: '#3b82f6' },
}

function formatDate(pubDate) {
  return new Date(pubDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="page">
    <NavBar />

    <main class="container">
      <h2 class="page-title">Actualités Crypto</h2>

      <div v-if="loading" class="loading">Chargement des actualités...</div>
      <p v-else-if="error" class="error-message">{{ error }}</p>

      <div v-else class="articles-list">
        <a
          v-for="(article, i) in articles"
          :key="i"
          :href="article.link"
          target="_blank"
          rel="noopener noreferrer"
          class="article-card"
        >
          <div
            class="article-img-placeholder"
            :style="SOURCE_STYLES[article.source] ? { background: SOURCE_STYLES[article.source].bg } : {}"
          >
            <span class="placeholder-icon">📰</span>
          </div>
          <div class="article-content">
            <div class="article-meta">
              <span class="article-source">{{ article.source }}</span>
              <span class="article-date">{{ formatDate(article.pubDate) }}</span>
            </div>
            <h3 class="article-title">{{ article.title }}</h3>
            <p class="article-body">{{ article.description }}...</p>
          </div>
        </a>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: #f0f2f5; }

.container { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; }

.page-title { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; margin: 0 0 1.5rem; }

.loading { text-align: center; padding: 4rem; color: #888; }
.error-message { color: #dc2626; }

.articles-list { display: flex; flex-direction: column; gap: 1rem; }

.article-card {
  display: flex; gap: 1.25rem; background: white; border-radius: 12px;
  padding: 1.25rem; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  text-decoration: none; transition: transform 0.15s, box-shadow 0.15s;
}

.article-card:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.1); }

.article-img {
  width: 120px; height: 80px; object-fit: cover; border-radius: 8px; flex-shrink: 0;
}

.article-img-placeholder {
  width: 120px; height: 80px; border-radius: 8px; background: #f0f2f5; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}

.placeholder-icon { font-size: 2rem; }

.article-content { flex: 1; min-width: 0; }

.article-meta { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.4rem; }
.article-source { font-size: 0.75rem; font-weight: 600; color: #4f46e5; text-transform: uppercase; }
.article-date { font-size: 0.75rem; color: #94a3b8; }

.article-title { font-size: 0.975rem; font-weight: 600; color: #1a1a2e; margin: 0 0 0.4rem; line-height: 1.4; }
.article-body { font-size: 0.85rem; color: #64748b; margin: 0; line-height: 1.5; }
</style>
