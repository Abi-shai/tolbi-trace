<template>
  <!-- Champ en lecture avec bouton « Modifier » (base Figma) ; bascule en édition
       inline avec Enregistrer / Annuler. -->
  <div class="flex flex-col gap-1.5">
    <label class="text-sm font-medium text-text-secondary">{{ label }}</label>
    <div class="flex items-start gap-2">
      <DsInputField
        class="flex-1"
        :model-value="editing ? draft : modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="!editing"
        @update:model-value="draft = $event"
      />
      <template v-if="editing">
        <DsButton label="Enregistrer" variant="primary" size="md" @click="commit" />
        <DsButton label="Annuler" variant="secondary-gray" size="md" @click="cancel" />
      </template>
      <DsButton
        v-else
        label="Modifier"
        variant="secondary-gray"
        size="md"
        icon-leading="edit-01"
        @click="start"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{ label: string; modelValue: string; type?: string; placeholder?: string }>(),
  { type: 'text', placeholder: '' },
)
const emit = defineEmits<{ save: [string] }>()

const editing = ref(false)
const draft   = ref(props.modelValue)

function start()  { draft.value = props.modelValue; editing.value = true }
function cancel() { editing.value = false }
function commit() { emit('save', draft.value.trim()); editing.value = false }
</script>
