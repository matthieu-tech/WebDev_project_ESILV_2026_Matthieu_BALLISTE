<script setup>
</script>

<template>
  <RouterView />
</template>

<style>
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ===== DARK MODE ===== */
html.dark .page {
  background: #0f0f1a !important;
}

html.dark .indicator-card,
html.dark .portfolios-summary,
html.dark .table-wrapper,
html.dark .holdings-table-wrapper,
html.dark .chart-section,
html.dark .create-form,
html.dark .holding-form,
html.dark .portfolios-list,
html.dark .empty-state,
html.dark .article-card,
html.dark .auth-card {
  background: #1a1a2e !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
}

html.dark .summary-header,
html.dark .market-table th,
html.dark .holdings-table th,
html.dark .list-header {
  background: #16213e !important;
  color: #64748b !important;
}

html.dark .summary-card:hover,
html.dark .portfolio-row:hover {
  background: #16213e !important;
}

html.dark .summary-card,
html.dark .market-table td,
html.dark .holdings-table td,
html.dark .portfolio-row {
  border-color: rgba(255,255,255,0.06) !important;
}

html.dark .page-title,
html.dark .section-title,
html.dark .page-header h2,
html.dark .portfolio-name,
html.dark .summary-name,
html.dark .summary-value,
html.dark .portfolio-value,
html.dark .coin-name,
html.dark .price,
html.dark .indicator-value,
html.dark .card-title,
html.dark .article-title {
  color: #f1f5f9 !important;
}

html.dark .summary-invested,
html.dark .portfolio-invested,
html.dark .coin-symbol,
html.dark .muted,
html.dark .article-body,
html.dark .article-meta,
html.dark .username {
  color: #64748b !important;
}

html.dark .indicator-label {
  color: #475569 !important;
}

html.dark .create-form input,
html.dark .holding-form input,
html.dark .auth-form input {
  background: #0f0f1a !important;
  border-color: #334155 !important;
  color: #f1f5f9 !important;
}

html.dark .create-form input:focus,
html.dark .holding-form input:focus,
html.dark .auth-form input:focus {
  border-color: #4f46e5 !important;
}

html.dark .btn-show-more {
  background: #16213e !important;
  border-color: rgba(255,255,255,0.06) !important;
  color: #a5b4fc !important;
}

html.dark .btn-show-more:hover {
  background: #1e2d4a !important;
}

html.dark .article-img-placeholder {
  background: #16213e !important;
}
</style>
