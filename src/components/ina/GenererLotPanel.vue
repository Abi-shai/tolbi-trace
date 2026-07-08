<template>
  <SlideOverPanel
    title="Générer un lot de cartes"
    supporting-text="Crée des cartes vierges pré-provisionnées (jeton QR + serial), prêtes pour l'export d'impression puis l'enrôlement terrain."
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

      <!-- Référence (optionnel) -->
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-semibold text-text-secondary">Référence du lot (optionnel)</span>
        <input
          v-model="reference"
          type="text"
          :placeholder="autoRef"
          class="h-10 px-3 border border-[#d0d5dd] rounded-lg text-sm text-text-secondary placeholder-text-quaternary bg-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors"
        />
      </label>

      <!-- Récap -->
      <div class="flex items-start gap-3 p-4 rounded-xl bg-surface">
        <Info :size="18" class="text-text-quaternary mt-0.5 shrink-0" />
        <p class="text-[13px] text-text-secondary leading-5">
          Les cartes sont créées au statut <span class="font-semibold">Générée</span>. Le Numéro INA n'est pas imprimé :
          il est attribué à l'activation, quand la carte est liée à un producteur.
        </p>
      </div>
    </div>

    <template #footer="{ close }">
      <DsButton label="Annuler" variant="secondary-gray" @click="close" />
      <DsButton label="Générer le lot" variant="primary" :disabled="!valid" @click="generate" />
    </template>
  </SlideOverPanel>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CreditCard, Info } from 'lucide-vue-next'
import SlideOverPanel from '~/components/ui/SlideOverPanel.vue'
import { useInaStore } from '~/stores/ina'

const emit = defineEmits<{ close: []; generated: [{ reference: string; quantite: number }] }>()

const ina = useInaStore()

const prefixe   = ref('KLK')
const quantite  = ref(50)
const reference = ref('')

const autoRef = computed(() => `${(prefixe.value || 'KLK').toUpperCase()}-L${String(ina.lots.length + 1).padStart(3, '0')}`)
const valid   = computed(() => !!prefixe.value.trim() && quantite.value >= 1 && quantite.value <= 5000)

function generate() {
  if (!valid.value) return
  const lot = ina.genererLot({
    prefixe:   prefixe.value.trim().toUpperCase(),
    quantite:  quantite.value,
    reference: reference.value.trim() || undefined,
  })
  emit('generated', { reference: lot.reference, quantite: lot.quantite })
}
</script>
