<template>
  <!-- Cartouche de métrique — fidèle au composant Figma « farmers_number » (4:57974) :
       icône (32px) + colonne intitulé / valeur, valeur en vert de marque. -->
  <div class="flex items-start gap-2 flex-1 min-w-0 bg-white border border-border rounded-lg px-4 py-3">
    <div class="flex items-center justify-center w-8 h-8 shrink-0">
      <component :is="icon" :size="20" class="text-text-quaternary" />
    </div>
    <div class="flex flex-col gap-1 min-w-0">
      <p class="text-lg text-text-secondary leading-7">{{ label }}</p>
      <p class="text-3xl font-bold text-[#056033] leading-[38px]">{{ value }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LucideIcon } from 'lucide-vue-next'

defineProps<{
  icon:  LucideIcon
  label: string
  value: string | number
}>()
</script>
