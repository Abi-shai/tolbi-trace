<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
    <Header title="QR Codes" description="Suivez les QR codes collectés par vos agents terrain." />

    <main class="flex-1 overflow-y-auto px-6 py-6 space-y-5">

      <!-- Métriques -->
      <div class="flex gap-4 w-full">
        <MetricCard :icon="Package" label="QR codes enregistrés" :value="activeCodes.length" />
        <MetricCard :icon="CheckCircle2" label="Complétés" :value="activeCodes.filter((c) => c.currentStep === 5).length" />
        <MetricCard :icon="Clock" label="En cours" :value="activeCodes.filter((c) => c.currentStep > 1 && c.currentStep < 5).length" />
      </div>

      <!-- Filtres -->
      <div class="flex items-center gap-3">
        <div class="relative w-[260px]">
          <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-quaternary pointer-events-none" />
          <input
            v-model="search"
            type="text"
            placeholder="Rechercher un code ou un producteur…"
            class="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white border border-border-strong rounded-lg shadow-xs placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        <select
          v-model="filter"
          class="px-3 py-2 text-sm border border-border-strong rounded-lg bg-white text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none cursor-pointer"
        >
          <option value="all">Toutes les étapes</option>
          <option v-for="n in 5" :key="n" :value="n">Étape {{ n }}</option>
        </select>

        <span class="text-xs text-text-quaternary ml-auto">
          {{ filtered.length }} résultat{{ filtered.length > 1 ? 's' : '' }}
        </span>
      </div>

      <!-- Tableau -->
      <div class="bg-white border border-border rounded-xl overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-surface">
              <th class="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">Code</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">Producteur</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">Coopérative</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">Progression</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">Étape actuelle</th>
              <th class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="qr in filtered"
              :key="qr.id"
              class="hover:bg-surface/60 transition-colors group"
            >
              <td class="px-4 py-3">
                <NuxtLink
                  :to="`/workflows/${workflowId}/sacs/${qr.id}`"
                  class="font-mono text-sm font-medium text-text-primary hover:text-primary hover:underline transition-colors"
                >
                  {{ qr.code }}
                </NuxtLink>
              </td>
              <td class="px-4 py-3">
                <span v-if="qr.producerName" class="text-sm text-text-primary">{{ qr.producerName }}</span>
                <span v-else class="text-sm text-text-quaternary">—</span>
              </td>
              <td class="px-4 py-3">
                <span v-if="qr.cooperativeName" class="text-xs text-text-tertiary">{{ qr.cooperativeName }}</span>
                <span v-else class="text-sm text-text-quaternary">—</span>
              </td>
              <td class="px-4 py-3">
                <StepDots :current-step="qr.currentStep" />
              </td>
              <td class="px-4 py-3">
                <span class="text-xs text-text-secondary">{{ STEP_LABELS[qr.currentStep - 1] }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    @click="viewingCode = qr"
                    class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary border border-border rounded-md hover:bg-surface transition-colors"
                  >
                    <Eye :size="13" />
                    Voir
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filtered.length === 0">
              <td colspan="6" class="px-4 py-12 text-center">
                <QrCode :size="24" class="mx-auto text-text-quaternary mb-2" />
                <p class="text-sm font-medium text-text-secondary">Aucun QR code trouvé</p>
                <p class="text-xs text-text-quaternary mt-1">Modifiez les filtres pour affiner la recherche.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>

  <QRCodeViewerModal
    v-if="viewingCode"
    :qr-code="viewingCode"
    @close="viewingCode = null"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { QrCode, Search, Eye, Package, CheckCircle2, Clock } from 'lucide-vue-next'
import { cn } from '~/lib/utils'
import Header from '~/components/layout/Header.vue'
import MetricCard from '~/components/ui/MetricCard.vue'
import QRCodeViewerModal from './QRCodeViewerModal.vue'
import { useQRCodesStore } from '~/stores/qr-codes'
import type { QRCode as QRCodeType } from '~/types/qr-code'

const STEP_LABELS = ['Collecte', 'Pesée', 'Chargement', 'Réception', 'Qualité']
const TOTAL_STEPS = 5

// StepDots sub-component
const StepDots = defineComponent({
  props: { currentStep: { type: Number, required: true } },
  setup(props) {
    return () => h('div', { class: 'flex items-center gap-1.5' }, [
      ...Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const step = i + 1
        return h('span', {
          key: step,
          class: cn('w-2 h-2 rounded-full transition-colors', step <= props.currentStep ? 'bg-primary' : 'bg-border'),
        })
      }),
      h('span', { class: 'ml-1 text-xs text-text-tertiary tabular-nums' },
        `${props.currentStep}/${TOTAL_STEPS}`,
      ),
    ])
  },
})

const props = defineProps<{
  initialCodes: QRCodeType[]
  workflowId:   string
}>()

const qrStore    = useQRCodesStore()
const search     = ref('')
const filter     = ref<'all' | number>('all')
const viewingCode = ref<QRCodeType | null>(null)

onMounted(() => {
  if (!qrStore.initialized) qrStore.initCodes(props.initialCodes)
})

const activeCodes = computed(() => qrStore.initialized ? qrStore.codes : props.initialCodes)

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return activeCodes.value.filter((c) => {
    const matchSearch = !q || c.code.toLowerCase().includes(q) || c.producerName?.toLowerCase().includes(q)
    const matchFilter = filter.value === 'all' ? true : c.currentStep === filter.value
    return matchSearch && matchFilter
  })
})
</script>
