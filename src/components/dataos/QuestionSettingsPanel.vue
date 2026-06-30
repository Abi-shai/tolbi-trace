<template>
  <SlideOverPanel
    ref="panel"
    title="Paramètres de la question"
    :width="480"
    @close="$emit('close')"
  >
    <template #icon>
      <DsIcon name="settings-01" :size="20" />
    </template>

    <!-- Type de question — le titre, lui, s'écrit directement sur la carte. -->
    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-text-secondary">Type de question</label>
      <DsInputDropdown
        placeholder="Choisis le type de question"
        :options="typeOptions"
        v-model="fieldType"
      />
    </div>

    <!-- Réponse obligatoire ? -->
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-text-secondary">Réponse obligatoire ?</span>
      <div class="flex flex-col gap-2">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="radio" class="qsp-radio" :value="true" v-model="required" />
          <span class="text-base text-text-primary">Oui</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="radio" class="qsp-radio" :value="false" v-model="required" />
          <span class="text-base text-text-primary">Non</span>
        </label>
      </div>
    </div>

    <!-- Indice de question -->
    <div class="flex flex-col gap-1.5">
      <div class="flex flex-col gap-0.5">
        <label class="text-sm font-medium text-text-secondary">Indice de question</label>
        <p class="text-sm text-text-tertiary leading-5">
          Tu peux ajouter un indice pour donner plus de contexte sur la question.
        </p>
      </div>
      <DsInputField v-model="hint" placeholder="Écris l'indice de question" />
    </div>

    <!-- Lier la question -->
    <div class="flex flex-col gap-1.5">
      <div class="flex flex-col gap-0.5">
        <label class="text-sm font-medium text-text-secondary">Lier la question</label>
        <p class="text-sm text-text-tertiary leading-5">
          Lie cette question à une autre : elle s'affichera selon la réponse choisie.
        </p>
      </div>
      <DsInputDropdown
        placeholder="Choisis la question à lier"
        :options="linkOptions"
        v-model="linkedId"
      />
    </div>

    <template #footer="{ close }">
      <DsButton label="Annuler" variant="secondary-gray" @click="close" />
      <DsButton label="Enregistrer" variant="primary" @click="handleSave" />
    </template>
  </SlideOverPanel>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SlideOverPanel from '~/components/ui/SlideOverPanel.vue'
import type { Question, QuestionFieldType, QuestionSettingsPatch } from '~/types/dataos'

const props = defineProps<{
  question: Question
  /** Autres questions du formulaire, pour l'affichage conditionnel. */
  otherQuestions?: Question[]
}>()

const emit = defineEmits<{
  save:  [patch: QuestionSettingsPatch]
  close: []
}>()

const NONE = '__none__'

const typeOptions = [
  { label: 'Texte',     value: 'text'  },
  { label: 'Téléphone', value: 'phone' },
  { label: 'Date',      value: 'date'  },
]

const panel     = ref<InstanceType<typeof SlideOverPanel> | null>(null)
const fieldType = ref<QuestionFieldType | null>(props.question.fieldType)
const required  = ref(props.question.required ?? true)
const hint      = ref(props.question.hint ?? '')
const linkedId  = ref(props.question.linkedQuestionId ?? NONE)

const linkOptions = computed(() => [
  { label: 'Aucune', value: NONE },
  ...(props.otherQuestions ?? []).map((q) => ({
    label: q.label || 'Question sans titre',
    value: q.id,
  })),
])

function handleSave() {
  emit('save', {
    fieldType:        fieldType.value,
    required:         required.value,
    hint:             hint.value.trim(),
    linkedQuestionId: linkedId.value === NONE ? null : linkedId.value,
  })
  panel.value?.close()
}
</script>

<style scoped>
.qsp-radio {
  width: 20px;
  height: 20px;
  accent-color: var(--ds-semantic-bg-brand-solid, #056033);
  cursor: pointer;
}
</style>
