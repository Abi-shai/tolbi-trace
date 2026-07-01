<template>
  <!-- Chart.js a besoin du DOM (canvas) : rendu client uniquement. -->
  <ClientOnly>
    <component :is="chartComponent" ref="chartRef" :data="chartData" :options="chartOptions" />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Bar, Line, Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Tooltip, Legend,
  BarController, BarElement,
  LineController, LineElement, PointElement,
  PieController, ArcElement,
  CategoryScale, LinearScale,
} from 'chart.js'
import type { AnalyticsQuestion, AnalyticsChartType } from '~/types/dataos'

// Fond blanc opaque : le canvas est transparent par défaut, ce qui donne un
// PNG exporté à fond transparent. On peint le blanc derrière tout le rendu.
const whiteBackground = {
  id: 'whiteBackground',
  beforeDraw(chart: ChartJS) {
    const { ctx, width, height } = chart
    ctx.save()
    ctx.globalCompositeOperation = 'destination-over'
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    ctx.restore()
  },
}

// Enregistrement unique des briques Chart.js réellement utilisées.
ChartJS.register(
  Tooltip, Legend,
  BarController, BarElement,
  LineController, LineElement, PointElement,
  PieController, ArcElement,
  CategoryScale, LinearScale,
  whiteBackground,
)

const props = defineProps<{ question: AnalyticsQuestion; type: AnalyticsChartType }>()

const chartComponent = computed(() =>
  props.type === 'circulaire' ? Pie : props.type === 'ligne' ? Line : Bar,
)

// ── Données selon le type ──
// Barre / ligne : une série (catégorie) par dataset, sur l'axe des périodes.
// Circulaire : une part par catégorie = somme de ses valeurs sur la période.
const chartData = computed(() => {
  const { series, periods } = props.question
  if (props.type === 'circulaire') {
    return {
      labels: series.map((s) => s.name),
      datasets: [{
        data: series.map((s) => s.values.reduce((a, b) => a + b, 0)),
        backgroundColor: series.map((s) => s.color),
        borderColor: '#ffffff',
        borderWidth: 2,
      }],
    }
  }
  return {
    labels: periods,
    datasets: series.map((s) => ({
      label: s.name,
      data: s.values,
      backgroundColor: s.color,
      borderColor: s.color,
      // Ligne : trait coloré + points discrets ; barre : coins légèrement arrondis.
      ...(props.type === 'ligne'
        ? { fill: false, tension: 0.35, pointRadius: 3, pointBackgroundColor: s.color, borderWidth: 2 }
        : { borderRadius: 4, categoryPercentage: 0.7, barPercentage: 0.8 }),
    })),
  }
})

const GRID = '#f2f4f7'
const AXIS_TEXT = '#667085'
const isCircular = computed(() => props.type === 'circulaire')

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: 'index' as const },
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      align: 'start' as const,
      labels: {
        usePointStyle: true,
        pointStyle: 'circle' as const,
        boxWidth: 8,
        boxHeight: 8,
        padding: 16,
        color: '#344054',
        font: { family: 'Inter', size: 13 },
      },
    },
    tooltip: {
      backgroundColor: '#101828',
      padding: 10,
      cornerRadius: 8,
      titleFont: { family: 'Inter', size: 12 },
      bodyFont: { family: 'Inter', size: 12 },
    },
  },
  scales: isCircular.value
    ? {}
    : {
        x: {
          title: { display: true, text: 'Période', color: AXIS_TEXT, font: { family: 'Inter', size: 12 } },
          grid: { display: false },
          border: { color: '#eaecf0' },
          ticks: { color: AXIS_TEXT, font: { family: 'Inter', size: 12 } },
        },
        y: {
          title: { display: true, text: 'Valeur', color: AXIS_TEXT, font: { family: 'Inter', size: 12 } },
          beginAtZero: true,
          grid: { color: GRID },
          border: { display: false },
          ticks: { color: AXIS_TEXT, font: { family: 'Inter', size: 12 } },
        },
      },
}))

// ── Export PNG ──
// vue-chartjs expose l'instance Chart.js via `chart` sur la ref du composant.
const chartRef = ref<{ chart?: ChartJS } | null>(null)

function toImage(): string | null {
  const chart = chartRef.value?.chart
  if (!chart) return null
  // Fond blanc explicite (le canvas est transparent par défaut).
  return chart.toBase64Image('image/png', 1)
}

defineExpose({ toImage })
</script>
