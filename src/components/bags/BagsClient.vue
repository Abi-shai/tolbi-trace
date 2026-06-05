<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden">

    <Header title="Sacs" description="Suivi de tous les sacs du processus.">
      <template #actions>
        <div class="flex items-center gap-2">
          <!-- Recherche -->
          <div class="relative">
            <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-quaternary pointer-events-none" />
            <input
              v-model="search"
              type="text"
              placeholder="Rechercher un sac ou producteur…"
              class="pl-8 pr-3 py-2 text-sm bg-white border border-border rounded-lg placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors w-64"
            />
          </div>

          <!-- Filtre étape -->
          <select
            v-model="filterStep"
            class="px-3 py-2 text-sm bg-white border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          >
            <option value="">Toutes les étapes</option>
            <option v-for="step in steps" :key="step.order" :value="step.order">
              Étape {{ step.order }} — {{ step.name }}
            </option>
          </select>

          <!-- Filtre statut -->
          <select
            v-model="filterStatus"
            class="px-3 py-2 text-sm bg-white border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          >
            <option value="">Tous les statuts</option>
            <option value="completed">Complété</option>
            <option value="in_progress">En cours</option>
            <option value="pending">En attente</option>
            <option value="anomaly">Anomalie</option>
          </select>
          <!-- Export CSV -->
          <DsButton
            label="Exporter CSV"
            icon-leading="download"
            variant="secondary-gray"
            size="sm"
            @click="exportCsv"
          />
        </div>
      </template>
    </Header>

    <!-- Compteurs statut -->
    <div class="flex items-center gap-3 px-6 py-3 border-b border-border bg-surface shrink-0">
      <button
        v-for="chip in statusChips"
        :key="chip.value"
        :class="cn(
          'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors border',
          filterStatus === chip.value
            ? chip.activeClass
            : 'bg-white border-border text-text-secondary hover:border-border-strong',
        )"
        @click="filterStatus = filterStatus === chip.value ? '' : chip.value"
      >
        <span :class="cn('w-1.5 h-1.5 rounded-full', chip.dotClass)" />
        {{ chip.label }}
        <span class="ml-0.5 opacity-70">{{ chip.count }}</span>
      </button>

      <span class="ml-auto text-xs text-text-quaternary">
        {{ filtered.length }} sac{{ filtered.length > 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Tableau -->
    <div class="flex-1 overflow-y-auto">
      <!-- État vide -->
      <div v-if="filtered.length === 0" class="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
        <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-surface-alt border border-border">
          <PackageSearch :size="20" class="text-text-quaternary" />
        </div>
        <p class="text-sm font-semibold text-text-primary">Aucun sac trouvé</p>
        <p class="text-sm text-text-tertiary">Modifie les filtres pour voir d'autres résultats.</p>
        <button class="text-sm text-primary font-semibold hover:underline" @click="resetFilters">
          Réinitialiser les filtres
        </button>
      </div>

      <table v-else class="w-full text-sm">
        <thead class="sticky top-0 bg-surface border-b border-border z-10">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide">Code QR</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide">Producteur</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide">Étape actuelle</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide">Statut</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide">Collecté le</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border bg-white">
          <tr
            v-for="bag in filtered"
            :key="bag.id"
            class="hover:bg-surface transition-colors cursor-pointer"
            @click="$router.push(`/source/workflows/${workflowId}/sacs/${bag.id}`)"
          >
            <td class="px-6 py-3.5">
              <span class="font-mono font-semibold text-text-primary">{{ bag.code }}</span>
            </td>
            <td class="px-6 py-3.5">
              <span v-if="bag.producerName" class="text-text-secondary">{{ bag.producerName }}</span>
              <span v-else class="text-text-quaternary italic">Non attribué</span>
            </td>
            <td class="px-6 py-3.5">
              <div class="flex items-center gap-2">
                <span class="flex items-center justify-center w-5 h-5 rounded-full bg-surface-alt border border-border text-[10px] font-bold text-text-secondary">
                  {{ bag.currentStep }}
                </span>
                <span class="text-text-secondary">{{ stepName(bag.currentStep) }}</span>
              </div>
            </td>
            <td class="px-6 py-3.5">
              <DsBadge :color="STATUS_CONFIG[bagStatus(bag)].color" :label="STATUS_CONFIG[bagStatus(bag)].label" size="sm" />
            </td>
            <td class="px-6 py-3.5 text-text-tertiary">{{ bag.createdAt }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, PackageSearch, Download } from 'lucide-vue-next'
import { cn } from '~/lib/utils'
import { qrCodes } from '~/data/qr-codes'
import { workflowSteps } from '~/data/workflow-steps'
import type { QRCode } from '~/types/qr-code'
import Header from '~/components/layout/Header.vue'

const props = defineProps<{ workflowId: string }>()

const search      = ref('')
const filterStep   = ref<number | ''>('')
const filterStatus = ref('')

const TOTAL_STEPS = 5

const bags  = computed(() => qrCodes.filter(q => q.workflowId === props.workflowId))
const steps = computed(() => workflowSteps[props.workflowId] ?? [])

type BagDisplayStatus = 'completed' | 'in_progress' | 'pending' | 'anomaly'

function bagStatus(bag: QRCode): BagDisplayStatus {
  if (bag.status === 'anomaly')           return 'anomaly'
  if (bag.currentStep >= TOTAL_STEPS)     return 'completed'
  if (bag.currentStep === 1)              return 'pending'
  return 'in_progress'
}

function stepName(order: number): string {
  return steps.value.find(s => s.order === order)?.name ?? `Étape ${order}`
}

const STATUS_CONFIG: Record<BagDisplayStatus, { label: string; color: string }> = {
  completed:   { label: 'Complété',   color: 'success' },
  in_progress: { label: 'En cours',   color: 'warning' },
  pending:     { label: 'En attente', color: 'gray'    },
  anomaly:     { label: 'Anomalie',   color: 'error'   },
}

const statusCounts = computed(() => {
  const counts = { completed: 0, in_progress: 0, pending: 0, anomaly: 0 }
  bags.value.forEach(b => counts[bagStatus(b)]++)
  return counts
})

const statusChips = computed(() => [
  { value: 'completed',   label: 'Complétés',   count: statusCounts.value.completed,   dotClass: 'bg-status-completed',  activeClass: 'bg-green-50 border-green-200 text-green-700'  },
  { value: 'in_progress', label: 'En cours',    count: statusCounts.value.in_progress, dotClass: 'bg-status-inprogress', activeClass: 'bg-orange-50 border-orange-200 text-orange-700' },
  { value: 'pending',     label: 'En attente',  count: statusCounts.value.pending,     dotClass: 'bg-status-pending',    activeClass: 'bg-surface-alt border-border-strong text-text-secondary' },
  { value: 'anomaly',     label: 'Anomalies',   count: statusCounts.value.anomaly,     dotClass: 'bg-status-anomaly',    activeClass: 'bg-red-50 border-red-200 text-red-700'        },
])

const filtered = computed(() => {
  return bags.value.filter(bag => {
    if (filterStatus.value && bagStatus(bag) !== filterStatus.value) return false
    if (filterStep.value   && bag.currentStep !== Number(filterStep.value)) return false
    if (search.value) {
      const q = search.value.toLowerCase()
      if (!bag.code.toLowerCase().includes(q) && !(bag.producerName?.toLowerCase().includes(q))) return false
    }
    return true
  })
})

function resetFilters() {
  search.value      = ''
  filterStep.value  = ''
  filterStatus.value = ''
}

function exportCsv() {
  const headers = ['Code QR', 'Producteur', 'Coopérative', 'Étape actuelle', 'Nom étape', 'Statut', 'Collecté le']
  const rows = filtered.value.map(bag => [
    bag.code,
    bag.producerName ?? '',
    bag.cooperativeName ?? '',
    bag.currentStep,
    stepName(bag.currentStep),
    STATUS_CONFIG[bagStatus(bag)].label,
    bag.createdAt,
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `sacs-${props.workflowId}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
