<template>
  <!-- État vide réutilisable. Anatomie canonique dérivée du pattern DataOS et
       normalisée (cf. inventaire produit). Conforme à :
       · design-philosophy → interface de travail, PAS d'illustration générique :
         une icône fonctionnelle sobre dans un cercle neutre, jamais de décor.
       · voice-and-tone → l'état vide est « explicatif + orienté action » :
         titre factuel (le quoi) + description (le pourquoi / la suite) + CTA.
       Slots : #icon (l'icône, DsIcon ou lucide — la couleur est héritée du cercle),
       #default (les actions : DsButton, lien de reset…). -->
  <div class="flex flex-col items-center justify-center text-center" :class="cls.wrap">
    <div
      v-if="$slots.icon"
      class="flex items-center justify-center rounded-full bg-surface-alt text-text-quaternary shrink-0"
      :class="cls.icon"
    >
      <slot name="icon" />
    </div>

    <div class="flex flex-col gap-1 max-w-[352px]">
      <p class="font-semibold text-text-primary" :class="cls.title">{{ title }}</p>
      <p v-if="description" class="text-text-tertiary" :class="cls.desc">{{ description }}</p>
    </div>

    <div v-if="$slots.default" class="flex items-center gap-3">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// `md` : état pleine page (onglet, grille, table). `sm` : état embarqué dans un
// panneau/liste (slide-over, fiche) — plus compact.
const props = withDefaults(defineProps<{
  title:        string
  description?: string
  size?:        'md' | 'sm'
}>(), { size: 'md' })

const cls = computed(() =>
  props.size === 'sm'
    ? { wrap: 'gap-3 py-10', icon: 'w-11 h-11', title: 'text-sm leading-5', desc: 'text-sm leading-5' }
    : { wrap: 'gap-4 py-12', icon: 'w-12 h-12', title: 'text-lg leading-7', desc: 'text-base leading-6' },
)
</script>
