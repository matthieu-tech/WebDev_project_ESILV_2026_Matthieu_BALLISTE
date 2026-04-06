<script setup>
import { computed } from 'vue'

const props = defineProps({
  prices: { type: Array, default: () => [] },
  positive: { type: Boolean, default: true },
  width: { type: Number, default: 80 },
  height: { type: Number, default: 32 },
})

const points = computed(() => {
  const data = props.prices
  if (!data?.length) return ''

  // On sample 1 point sur 4 pour alléger (168 points → ~42)
  const sampled = data.filter((_, i) => i % 4 === 0)

  const min = Math.min(...sampled)
  const max = Math.max(...sampled)
  const range = max - min || 1
  const pad = 2

  return sampled.map((p, i) => {
    const x = pad + (i / (sampled.length - 1)) * (props.width - pad * 2)
    const y = pad + (props.height - pad * 2) - ((p - min) / range) * (props.height - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
})

const color = computed(() => props.positive ? '#16a34a' : '#dc2626')
</script>

<template>
  <svg :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" class="sparkline">
    <polyline
      v-if="points"
      :points="points"
      fill="none"
      :stroke="color"
      stroke-width="1.5"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped>
.sparkline { display: block; }
</style>
