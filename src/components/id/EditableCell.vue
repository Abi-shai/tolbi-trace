<template>
  <!-- Édition inline -->
  <input
    v-if="editing"
    :ref="focusOnMount"
    v-model="draft"
    class="w-[180px] max-w-full px-2.5 py-1.5 text-sm font-medium text-[#101828] bg-white rounded-lg outline-none focus:ring-2"
    :class="hasError ? 'border border-[#d92d20] focus:ring-[#fecdca]' : 'border border-[#d0d5dd] focus:ring-[#cfe9df]'"
    style="font-family: var(--ds-typography-font-family-inter)"
    @keyup.enter="commit"
    @keyup.esc="cancel"
    @blur="commit"
  />

  <!-- Cellule en erreur -->
  <button
    v-else-if="hasError"
    type="button"
    class="group flex items-center gap-2 text-left cursor-text"
    @click="start"
  >
    <AlertTriangle :size="14" class="text-[#d92d20] shrink-0" />
    <span class="font-medium text-[#101828]">{{ value }}</span>
    <Pencil :size="12" class="text-[#d92d20] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
  </button>

  <!-- Cellule en avertissement (ex : « Champ vide ») -->
  <button
    v-else-if="hasWarning"
    type="button"
    class="group flex items-center gap-2 text-left cursor-text"
    @click="start"
  >
    <AlertTriangle :size="14" class="text-[#f79009] shrink-0" />
    <span class="italic text-[#475467]">{{ value }}</span>
    <Pencil :size="12" class="text-[#f79009] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
  </button>

  <!-- Cellule corrigée -->
  <button
    v-else-if="corrected"
    type="button"
    class="group flex items-center gap-2 text-left cursor-text"
    @click="start"
  >
    <Check :size="14" class="text-[#079455] shrink-0" />
    <span class="font-medium text-[#079455]">{{ value }}</span>
    <Pencil :size="12" class="text-[#079455] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
  </button>

  <!-- Cellule normale — éditable aussi -->
  <button
    v-else
    type="button"
    class="group flex items-center gap-2 text-left cursor-text"
    @click="start"
  >
    <span :class="emphasis ? 'font-medium text-[#101828]' : 'text-[#475467]'">{{ value }}</span>
    <Pencil :size="12" class="text-text-quaternary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AlertTriangle, Pencil, Check } from 'lucide-vue-next'

const props = defineProps<{
  value:      string
  hasError?:  boolean
  hasWarning?: boolean
  corrected?: boolean
  emphasis?:  boolean
}>()
const emit = defineEmits<{ commit: [value: string] }>()

const editing = ref(false)
const draft   = ref('')

function start() {
  draft.value   = props.value
  editing.value = true
}

function commit() {
  if (!editing.value) return
  editing.value = false
  emit('commit', draft.value)
}

function cancel() { editing.value = false }

// Focus automatique de l'input dès son montage (ref stable → pas de re-focus en boucle).
function focusOnMount(el: unknown) {
  const input = el as HTMLInputElement | null
  if (input && input !== document.activeElement) input.focus()
}
</script>
