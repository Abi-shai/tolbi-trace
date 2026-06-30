<template>
  <!-- Conteneur relatif : laisse déborder le « + » d'ajout sans le rogner -->
  <div class="relative" :class="readonly ? '' : 'group/qcard'">
    <div
      class="flex items-stretch bg-white border border-border rounded-lg overflow-hidden"
      :class="readonly ? '' : 'transition-shadow duration-150 ease-out group-hover/qcard:shadow-[var(--ds-shadow-lg)]'"
    >
      <!-- Poignée de déplacement -->
      <div class="flex items-start pl-2 py-3 shrink-0">
        <button
          class="flex items-center justify-center w-[34px] h-8"
          :class="readonly ? 'text-[var(--ds-semantic-fg-disabled)] cursor-default' : 'text-text-quaternary cursor-grab active:cursor-grabbing'"
          :disabled="readonly"
          @pointerdown="!readonly && $emit('grab')"
        >
          <GripVertical :size="20" />
        </button>
      </div>

      <!-- Question + type (DS Input dropdown) -->
      <div class="flex-1 min-w-0 p-4" :class="readonly ? 'pointer-events-none' : ''">
        <DsInputDropdown
          label="Question"
          placeholder="Renseignez votre nom et prénom"
          :options="options"
          :leading-icon="leadingIcon"
          v-model="selected"
        />
      </div>

      <!-- Actions -->
      <div class="flex flex-col items-start border-l border-border p-2 shrink-0">
        <button class="qc-btn" :disabled="readonly" @click="$emit('duplicate')"><Copy :size="20" /></button>
        <button class="qc-btn qc-btn--danger" :disabled="readonly" @click="$emit('remove')"><DsIcon name="trash-01" :size="20" /></button>
        <button class="qc-btn" :disabled="readonly" @click="$emit('settings')"><DsIcon name="settings-01" :size="20" /></button>
        <button class="qc-btn qc-btn--lg" :disabled="readonly" @click="$emit('options')"><DsIcon name="rows-01" :size="20" /></button>
      </div>
    </div>

    <!-- Ajouter une question juste en dessous — révélé au survol de la carte -->
    <button
      v-if="!readonly"
      class="qc-add-below"
      aria-label="Ajouter une question en dessous"
      @click="$emit('add')"
    >
      <DsIcon name="plus" :size="20" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { GripVertical, Copy } from 'lucide-vue-next'
import { questionFieldOptions } from '~/data/dataos'
import type { Question, QuestionFieldType, QuestionFieldOption } from '~/types/dataos'

const props = withDefaults(defineProps<{ question: Question; readonly?: boolean }>(), {
  readonly: false,
})

const emit = defineEmits<{
  grab:      []
  select:    [option: QuestionFieldOption]
  duplicate: []
  remove:    []
  settings:  []
  options:   []
  add:       []
}>()

const options = questionFieldOptions.map((o) => ({ label: o.label, value: o.id }))

// Slugs Ds (Untitled UI) — alignés sur les icônes du composant Figma.
const SLUG: Record<QuestionFieldType, string> = {
  text:  'text-input',
  phone: 'phone',
  date:  'calendar',
}
const leadingIcon = computed(() => (props.question.fieldType ? SLUG[props.question.fieldType] : undefined))

const selected = computed<string | null>({
  get: () =>
    questionFieldOptions.find(
      (o) => o.fieldType === props.question.fieldType && o.label === props.question.label,
    )?.id ?? null,
  set: (id) => {
    const option = questionFieldOptions.find((o) => o.id === id)
    if (option) emit('select', option)
  },
})
</script>

<style scoped>
.qc-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--ds-radius-md, 8px);
  color: var(--ds-semantic-fg-tertiary, #475467);
  transition: background-color 0.12s, color 0.12s;
}
.qc-btn:hover:not(:disabled) {
  background-color: var(--ds-semantic-bg-secondary, #f9fafb);
  color: var(--ds-semantic-fg-secondary, #344054);
}
.qc-btn:disabled {
  color: var(--ds-semantic-fg-disabled, #98a2b3);
  cursor: default;
}
.qc-btn--lg { width: 40px; height: 40px; }

/* Corbeille : atténuée au repos (cf. design), feedback destructif au survol. */
.qc-btn--danger { color: var(--ds-semantic-fg-senary, #d0d5dd); }
.qc-btn--danger:hover:not(:disabled) {
  background-color: var(--ds-semantic-bg-error-primary, #fef3f2);
  color: var(--ds-semantic-fg-error-primary, #d92d20);
}

/* Bouton « + » d'ajout en dessous — débord bas-gauche, révélé au survol. */
.qc-add-below {
  position: absolute;
  bottom: -10px;
  left: -10px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: var(--ds-radius-full, 9999px);
  color: #fff;
  background-color: var(--ds-semantic-bg-brand-solid, #056033);
  border: 1px solid var(--ds-semantic-bg-brand-solid, #056033);
  box-shadow: var(--ds-shadow-xs);
  opacity: 0;
  transform: scale(0.9);
  pointer-events: none;
  transition: opacity 0.15s ease-out, transform 0.15s ease-out, background-color 0.12s ease-out;
}
.group\/qcard:hover .qc-add-below,
.qc-add-below:focus-visible {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}
.qc-add-below:hover {
  background-color: var(--ds-semantic-bg-brand-solid-hover, #044d29);
  border-color: var(--ds-color-brand-700, #044d29);
}
</style>
