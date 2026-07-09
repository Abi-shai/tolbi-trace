<template>
  <!-- Liste d'événements logistiques (journal Transactions) — partagée par la fiche
       producteur et le panneau de détail d'une carte. Événement factuel, non financier :
       explication libre saisie par l'agent au scan + « agent · date ». -->
  <div class="flex flex-col gap-2">
    <p class="text-sm font-semibold text-text-secondary">{{ title }} ({{ transactions.length }})</p>
    <div class="flex flex-col divide-y divide-border rounded-lg border border-border">
      <div v-for="t in transactions" :key="t.id" class="flex items-start gap-3 p-3">
        <div class="flex items-center justify-center size-8 rounded-full bg-surface text-text-tertiary shrink-0">
          <ScrollText :size="15" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-text-primary">{{ t.explication }}</p>
          <p class="text-xs text-text-tertiary truncate">{{ t.agent }} · {{ formatDateFr(t.date) }}</p>
        </div>
      </div>
      <EmptyState
        v-if="transactions.length === 0"
        size="sm"
        title="Aucune transaction"
        :description="emptyText"
      >
        <template #icon><ScrollText :size="20" /></template>
      </EmptyState>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ScrollText } from 'lucide-vue-next'
import EmptyState from '~/components/ui/EmptyState.vue'
import { formatDateFr, type TransactionINA } from '~/types/ina'

withDefaults(defineProps<{
  transactions: TransactionINA[]
  title?:       string
  emptyText?:   string
}>(), {
  title:     'Transactions',
  emptyText: 'Les transactions enregistrées sur le terrain apparaîtront ici.',
})
</script>
