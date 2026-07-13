<template>
  <!-- Tuile de carte INA, partagée entre la galerie Cartes, le panneau de détail
       d'une carte et l'onglet Carte de la fiche producteur (représentation cohérente).
       3 états, ensemble cohérent : Disponible (blanche, neutre) · Associée (blanche,
       accent vert = « vivante ») · Détruite (fond gris rempli + contenu atténué = « off »,
       façon carte gelée/désactivée). Root = <button> si interactive, <div> sinon. -->
  <component
    :is="interactive ? 'button' : 'div'"
    :type="interactive ? 'button' : undefined"
    :class="[
      'rounded-xl border p-4 aspect-[1.6] flex flex-col justify-between shadow-xs transition-all',
      meta.tile,
      interactive && 'w-full text-left cursor-pointer hover:shadow-md hover:-translate-y-0.5',
    ]"
  >
    <!-- Bandeau : marque + puce QR · pill de statut -->
    <div class="flex items-start justify-between gap-2">
      <div class="flex flex-col gap-2 min-w-0">
        <span class="text-[10px] font-semibold uppercase tracking-[0.12em]" :class="meta.label2">Carte INA</span>
        <QrCode :size="24" :class="meta.accent" />
      </div>
      <DsBadge :label="meta.label" :color="meta.pillColor" variant="pill-color" size="sm" />
    </div>

    <!-- Pied : Numéro INA (héros) + porteur · serial -->
    <div class="flex flex-col gap-1.5">
      <span class="text-lg font-bold mono tracking-[0.1em]" :class="meta.numero">{{ numeroDisplay }}</span>
      <div class="flex items-end justify-between gap-2">
        <p class="text-[11px] font-semibold uppercase tracking-wide truncate" :class="meta.holder">{{ holderDisplay }}</p>
        <span class="text-[10px] mono shrink-0" :class="meta.serial">{{ serial }}</span>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QrCode } from 'lucide-vue-next'
import { cycleOf, type CarteStatut, type Cycle, type BadgeColor } from '~/types/ina'

const props = withDefaults(defineProps<{
  statut:       CarteStatut
  numeroIna?:   string | null
  holder?:      string | null
  serial?:      string | null
  interactive?: boolean
}>(), { numeroIna: null, holder: null, serial: null, interactive: false })

// Statut présenté (vue producteur) + STYLE par état (ensemble cohérent).
interface StateStyle { label: string; pillColor: BadgeColor; tile: string; accent: string; label2: string; numero: string; holder: string; serial: string }
const STATE_META: Record<Cycle, StateStyle> = {
  // Disponible : carte vierge en stock — blanche, neutre.
  emission: {
    label: 'Disponible', pillColor: 'gray',
    tile:   'bg-white border-border',
    accent: 'text-text-quaternary', label2: 'text-text-quaternary',
    numero: 'text-text-quaternary', holder: 'text-text-tertiary', serial: 'text-text-tertiary',
  },
  // Associée : liée à un producteur — blanche + accent vert, la carte « vivante ».
  activation: {
    label: 'Associée', pillColor: 'success',
    tile:   'bg-white border-border',
    accent: 'text-[var(--ds-color-success-700)]', label2: 'text-text-quaternary',
    numero: 'text-text-primary', holder: 'text-text-secondary', serial: 'text-text-tertiary',
  },
  // Détruite : fond gris rempli + tout atténué + opacité réduite = « grisé / off ».
  revocation: {
    label: 'Détruite', pillColor: 'gray',
    tile:   'bg-surface-alt border-border opacity-75',
    accent: 'text-text-quaternary', label2: 'text-text-quaternary',
    numero: 'text-text-quaternary', holder: 'text-text-quaternary', serial: 'text-text-quaternary',
  },
}

const meta = computed(() => STATE_META[cycleOf(props.statut)])

// Numéro groupé façon carte : 20054112 → 2005 4112.
const numeroDisplay = computed(() =>
  props.numeroIna ? props.numeroIna.replace(/(\d{4})(?=\d)/g, '$1 ') : '•••• ••••',
)
const holderDisplay = computed(() => props.holder ?? 'Carte vierge')
</script>

<style scoped>
.mono { font-family: var(--ds-typography-font-family-inter); font-variant-numeric: tabular-nums; }
</style>
