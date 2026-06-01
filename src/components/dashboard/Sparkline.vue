<template>
  <svg v-if="data.length >= 2" :width="width" :height="height" class="overflow-visible shrink-0">
    <polyline
      :points="points"
      fill="none"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  data:    number[]
  color?:  string
  width?:  number
  height?: number
}>(), {
  color:  '#1D9E75',
  width:  64,
  height: 24,
})

const points = computed(() => {
  const { data, width, height } = props
  const min   = Math.min(...data)
  const max   = Math.max(...data)
  const range = max - min || 1
  const pad   = 2
  return data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - pad - ((v - min) / range) * (height - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
})
</script>
