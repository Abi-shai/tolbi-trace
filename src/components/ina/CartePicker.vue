<template>
  <!-- Sélecteur de carte précise. Une carte physique porte un serial pré-imprimé :
       l'opérateur tient CETTE carte-là en main et lie exactement ce serial (pas
       « une carte au hasard » du stock). D'où recherche par n° de série + liste à
       sélection unique + aperçu de la carte choisie. `allowNone` ajoute l'option
       « Sans carte pour l'instant » (activation INA, où la carte est facultative). -->
  <div class="flex flex-col gap-2.5">
    <div v-if="label || description" class="flex flex-col gap-0.5">
      <p v-if="label" class="text-sm font-medium text-text-secondary">{{ label }}</p>
      <p v-if="description" class="text-sm text-text-tertiary leading-5">{{ description }}</p>
    </div>

    <!-- Recherche par serial (seulement s'il y a du stock à filtrer) -->
    <DsInputField v-if="nbDispo > 0" v-model="q" placeholder="Rechercher un n° de série…">
      <template #icon-leading><DsIcon name="search-md" :size="20" class="text-text-quaternary" /></template>
    </DsInputField>

    <!-- Liste à sélection unique -->
    <div class="rounded-xl border border-border overflow-hidden">
      <div class="max-h-[236px] overflow-y-auto divide-y divide-border">
        <!-- Option « Sans carte » (activation) -->
        <button
          v-if="allowNone"
          type="button"
          class="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors"
          :class="modelValue === null ? 'bg-primary/[0.06]' : 'hover:bg-surface'"
          @click="select(null)"
        >
          <span class="radio" :class="modelValue === null ? 'radio--on' : 'radio--off'">
            <span v-if="modelValue === null" class="radio__dot" />
          </span>
          <span class="flex-1 min-w-0">
            <span class="block text-sm font-semibold text-text-primary">Sans carte pour l'instant</span>
            <span class="block text-xs text-text-tertiary leading-4">Tu pourras l'associer plus tard.</span>
          </span>
        </button>

        <!-- Cartes disponibles -->
        <button
          v-for="c in filtered"
          :key="c.id"
          type="button"
          class="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors"
          :class="modelValue === c.id ? 'bg-primary/[0.06]' : 'hover:bg-surface'"
          @click="select(c.id)"
        >
          <span class="radio" :class="modelValue === c.id ? 'radio--on' : 'radio--off'">
            <span v-if="modelValue === c.id" class="radio__dot" />
          </span>
          <span class="flex-1 min-w-0 text-sm font-semibold text-text-primary mono truncate">{{ c.serial }}</span>
          <!-- Toutes les cartes du pool sont « Disponibles » (vocabulaire produit) :
               les statuts fins générée/imprimée/distribuée restent internes. -->
          <DsBadge label="Disponible" color="gray" variant="pill-color" size="sm" />
        </button>

        <!-- Aucune correspondance à la recherche -->
        <EmptyState
          v-if="nbDispo > 0 && filtered.length === 0"
          size="sm"
          title="Aucune carte"
          :description="`Aucun numéro de série ne correspond à « ${q.trim()} ».`"
        >
          <template #icon><SearchX :size="20" /></template>
        </EmptyState>

        <!-- Rupture de stock -->
        <EmptyState
          v-else-if="nbDispo === 0"
          size="sm"
          title="Aucune carte en stock"
          description="Génère un lot de cartes pour pouvoir en associer une."
        >
          <template #icon><CreditCard :size="20" /></template>
        </EmptyState>
      </div>
    </div>

    <!-- Aperçu de la carte choisie (mini-carte : largeur contrainte pour tenir sans
         scroll et se lire comme un aperçu, pas la carte pleine échelle). -->
    <div v-if="selectedCarte" class="flex flex-col gap-1.5">
      <p class="text-xs font-medium text-text-tertiary">Aperçu de la carte une fois associée</p>
      <div class="w-[240px]">
        <CarteInaTile
          statut="activee"
          :numero-ina="previewNumero ?? null"
          :holder="previewHolder ?? null"
          :serial="selectedCarte.serial"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { SearchX, CreditCard } from 'lucide-vue-next'
import CarteInaTile from '~/components/ina/CarteInaTile.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import { useInaStore } from '~/stores/ina'

const props = withDefaults(defineProps<{
  modelValue:     string | null   // carteId sélectionné ; null = aucune / « sans carte »
  allowNone?:     boolean         // affiche l'option « Sans carte pour l'instant »
  label?:         string
  description?:   string
  previewHolder?: string | null   // porteur affiché sur l'aperçu (le producteur)
  previewNumero?: string | null   // N° INA affiché sur l'aperçu
}>(), {
  allowNone:     false,
  label:         'Carte à associer',
  description:   '',
  previewHolder: null,
  previewNumero: null,
})

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

const ina = useInaStore()
ina.init()

const q = ref('')

// Stock associable, déjà trié par proximité terrain (distribuée → imprimée → générée).
const dispo   = computed(() => ina.cartesDisponibles)
const nbDispo  = computed(() => dispo.value.length)

// Filtre par serial (les tirets/espaces saisis sont ignorés pour rester tolérant).
const filtered = computed(() => {
  const needle = q.value.trim().toLowerCase().replace(/[\s-]/g, '')
  if (!needle) return dispo.value
  return dispo.value.filter((c) => c.serial.toLowerCase().replace(/[\s-]/g, '').includes(needle))
})

// Carte sélectionnée cherchée dans tout le stock (pas seulement le filtre) : l'aperçu
// persiste même si la recherche ne la fait plus apparaître dans la liste.
const selectedCarte = computed(() => dispo.value.find((c) => c.id === props.modelValue) ?? null)

function select(id: string | null) {
  emit('update:modelValue', id)
}
</script>

<style scoped>
.mono { font-family: var(--ds-typography-font-family-inter); font-variant-numeric: tabular-nums; }

/* Radio custom (le DS n'a pas de radio-group), fidèle à ModuleAccessPicker. */
.radio {
  margin-top: 1px;
  display: flex;
  height: 1rem;
  width: 1rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  transition: background-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
              border-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}
.radio--off { border: 1px solid var(--color-border-strong); background: #fff; }
.radio--on  { background: var(--color-primary); }
.radio__dot { height: 0.375rem; width: 0.375rem; border-radius: 9999px; background: #fff; }
</style>
