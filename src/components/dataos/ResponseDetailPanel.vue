<template>
  <SlideOverPanel
    title="Informations sur l'entrée"
    :width="480"
    @close="$emit('close')"
  >
    <!-- Onglets : Détails / Photo / Cartographie (segmented control DS) -->
    <DsTabs v-model="tab" :tabs="tabs" size="sm" />

    <!-- Détails : lecture seule, une ligne par champ (libellé | valeur) -->
    <div v-if="tab === 'details'" class="flex flex-col gap-4">
      <div
        v-for="field in fields"
        :key="field.label"
        class="flex items-center gap-6"
      >
        <p class="flex-1 min-w-0 text-base text-text-secondary leading-6">{{ field.label }}</p>

        <!-- Stade : badge de statut ; autres champs : valeur en boîte -->
        <div v-if="field.key === 'stade'" class="flex-1 min-w-0 flex items-center py-1">
          <DsBadge :label="stade.label" :color="stade.color" variant="pill-color" size="sm" />
        </div>
        <div v-else class="flex-1 min-w-0 flex items-center px-3 py-1 bg-surface rounded-lg">
          <p class="flex-1 min-w-0 text-base font-medium text-text-primary leading-6" style="font-family: var(--ds-typography-font-family-inter)">
            {{ field.value }}
          </p>
        </div>
      </div>
    </div>

    <!-- Photo : la maquette ne spécifie pas de contenu ; état vide en attendant
         que la collecte terrain remonte les clichés. -->
    <div v-else-if="tab === 'photo'" class="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div class="flex items-center justify-center w-12 h-12 rounded-full bg-surface-alt text-text-quaternary">
        <DsIcon name="image-03" :size="24" />
      </div>
      <div class="flex flex-col gap-1">
        <p class="text-sm font-semibold text-text-primary">Aucune photo</p>
        <p class="text-sm text-text-tertiary">Cette entrée n'a pas encore de photo remontée du terrain.</p>
      </div>
    </div>

    <!-- Cartographie : idem, placeholder en attendant le tracé de parcelle. -->
    <div v-else class="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div class="flex items-center justify-center w-12 h-12 rounded-full bg-surface-alt text-text-quaternary">
        <DsIcon name="globe-slated-01" :size="24" />
      </div>
      <div class="flex flex-col gap-1">
        <p class="text-sm font-semibold text-text-primary">Aucun tracé</p>
        <p class="text-sm text-text-tertiary">Le polygone de la parcelle n'est pas encore disponible.</p>
      </div>
    </div>
  </SlideOverPanel>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SlideOverPanel from '~/components/ui/SlideOverPanel.vue'
import type { SuiviReponse, SuiviStade } from '~/data/dataos'

const props = defineProps<{ reponse: SuiviReponse }>()

defineEmits<{ close: [] }>()

const tab = ref<'details' | 'photo' | 'cartographie'>('details')
const tabs = [
  { label: 'Détails',      value: 'details' },
  { label: 'Photo',        value: 'photo' },
  { label: 'Cartographie', value: 'cartographie' },
]

const fields = computed(() => [
  { key: 'niveau',  label: 'Niveau',                 value: props.reponse.niveau },
  { key: 'stade',   label: 'Stade',                  value: props.reponse.stade },
  { key: 'culture', label: 'Culture(s) trouvée(s)',  value: props.reponse.culture },
  { key: 'nom',     label: 'Nom de l\'enquêteur',    value: props.reponse.nomEnqueteur },
  { key: 'prenom',  label: 'Prénom de l\'enquêteur', value: props.reponse.prenomEnqueteur },
])

const STADE: Record<SuiviStade, { label: string; color: string }> = {
  'accepte':  { label: 'Accepté',  color: 'success' },
  'en-cours': { label: 'En cours', color: 'warning' },
  'rejete':   { label: 'Rejeté',   color: 'error'   },
}
const stade = computed(() => STADE[props.reponse.stade])
</script>
