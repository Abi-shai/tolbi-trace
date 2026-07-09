<template>
  <SlideOverPanel
    title="Générer des cartes"
    supporting-text="Crée des cartes vierges pré-provisionnées (jeton QR + serial), prêtes pour l'export d'impression puis l'activation des statuts INA sur le terrain."
    :width="440"
    @close="$emit('close')"
  >
    <template #icon><CreditCard :size="20" /></template>

    <div class="flex flex-col gap-5">
      <!-- Préfixe -->
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-semibold text-text-secondary">Préfixe des serials</span>
        <input
          v-model="prefixe"
          type="text"
          maxlength="6"
          class="h-10 px-3 border border-[#d0d5dd] rounded-lg text-sm text-text-secondary bg-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors uppercase"
        />
        <span class="text-xs text-text-tertiary">Identifie la coopérative / campagne. Ex : {{ prefixe || 'KLK' }}-C0001.</span>
      </label>

      <!-- Quantité -->
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-semibold text-text-secondary">Quantité de cartes</span>
        <input
          v-model.number="quantite"
          type="number"
          min="1"
          max="5000"
          class="h-10 px-3 border border-[#d0d5dd] rounded-lg text-sm text-text-secondary bg-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors"
        />
      </label>
    </div>

    <!-- Commander les cartes physiques : opt-in lié AU LOT généré. ON → « Générer
         le lot » envoie aussi la demande de cartes physiques à Tolbi pour CE lot
         (même préfixe / quantité). Patron toggle riche de CarteAssocieeToggle, sans
         featured icon (hiérarchie titre → ligne → toggle) ; fond brand soft à l'état
         actif pour le feedback. -->
    <div :class="['rounded-xl border border-border p-4 flex items-start gap-3.5 transition-colors', commanderPhysiques ? 'bg-brand-primary' : 'bg-surface']">
      <div class="min-w-0 flex-1 flex flex-col gap-0.5">
        <p class="text-sm font-semibold text-text-primary">Commander les cartes physiques</p>
        <p class="text-sm text-text-tertiary leading-5">Un mail sera envoyé à l'équipe Tolbi pour produire et te livrer ces cartes.</p>
      </div>
      <DsToggle v-model="commanderPhysiques" size="md" class="shrink-0 mt-0.5" />
    </div>

    <template #footer="{ close }">
      <DsButton label="Annuler" variant="secondary-gray" @click="close" />
      <DsButton label="Générer les cartes" variant="primary" :disabled="!valid" @click="generate" />
    </template>
  </SlideOverPanel>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CreditCard } from 'lucide-vue-next'
import SlideOverPanel from '~/components/ui/SlideOverPanel.vue'
import { useInaStore } from '~/stores/ina'

const emit = defineEmits<{ close: []; generated: [{ reference: string; quantite: number; commanderPhysiques: boolean }] }>()

const ina = useInaStore()

const prefixe  = ref('KLK')
const quantite = ref(50)
// Opt-in : commander les cartes physiques du lot en même temps qu'on le génère.
const commanderPhysiques = ref(false)

const valid = computed(() => !!prefixe.value.trim() && quantite.value >= 1 && quantite.value <= 5000)

function generate() {
  if (!valid.value) return
  // La référence du lot est générée automatiquement (préfixe + n° d'ordre).
  const lot = ina.genererLot({
    prefixe:  prefixe.value.trim().toUpperCase(),
    quantite: quantite.value,
  })
  emit('generated', { reference: lot.reference, quantite: lot.quantite, commanderPhysiques: commanderPhysiques.value })
}
</script>
