<template>
  <SlideOverPanel ref="panel" title="Liste de templates" :width="528" @close="$emit('close')">
    <div class="flex flex-col gap-4">
      <button
        v-for="template in templates"
        :key="template.id"
        class="flex gap-4 items-start w-full p-4 rounded-2xl border border-border bg-surface text-left transition-all duration-150 hover:border-[var(--ds-color-brand-300)] hover:shadow-lg hover:-translate-y-0.5"
        @click="open(template)"
      >
        <!-- Vignette : illustration ancrée en bas, centrée, débordement masqué -->
        <div class="relative shrink-0 w-[124px] h-[107px] rounded-2xl bg-[var(--ds-color-brand-100)] overflow-hidden">
          <img
            :src="templateIllustration"
            alt=""
            class="absolute left-1/2 -translate-x-1/2"
            style="top: 53px; width: 58.55px; height: 68.92px"
          />
        </div>
        <!-- Contenu -->
        <div class="flex flex-col gap-2 min-w-0 flex-1">
          <p class="text-base font-semibold text-text-primary leading-6">{{ template.name }}</p>
          <p class="text-base text-text-secondary leading-6">{{ template.description }}</p>
        </div>
      </button>
    </div>
  </SlideOverPanel>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SlideOverPanel from '~/components/ui/SlideOverPanel.vue'
import templateIllustration from '~/assets/images/dataos/template-illustration.svg'
import { formulaireTemplates } from '~/data/dataos'
import type { FormulaireTemplate } from '~/types/dataos'

const emit = defineEmits<{
  open:  [template: FormulaireTemplate]
  close: []
}>()

const panel     = ref<InstanceType<typeof SlideOverPanel> | null>(null)
const templates = formulaireTemplates

// Clic direct sur un template → on l'ouvre (la vue du template viendra plus tard).
function open(template: FormulaireTemplate) {
  emit('open', template)
  panel.value?.close()
}
</script>
