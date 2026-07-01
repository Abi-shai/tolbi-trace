<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden bg-surface content-arrive">

    <!-- En-tête de page standard : l'onglet courant + les actions d'enregistrement -->
    <Header title="Questions">
      <template #actions>
        <DsButton label="Enregistrer comme template" variant="secondary-gray" :disabled="saving" @click="saveAsTemplate" />
        <DsButton
          :label="dirty ? 'Enregistrer le formulaire' : 'Enregistré'"
          variant="primary"
          :loading="saving"
          :disabled="!dirty"
          @click="save"
        />
      </template>
    </Header>

    <!-- Corps : liste des questions -->
    <div class="flex-1 overflow-y-auto">
      <div class="flex flex-col gap-4 p-4 w-full">
        <div
          v-for="(question, i) in questions"
          :key="question.id"
          :draggable="handleGrab"
          :class="dragIndex === i ? 'opacity-50' : ''"
          @dragstart="onDragStart(i)"
          @dragover.prevent
          @drop="onDrop(i)"
          @dragend="endDrag"
        >
          <QuestionCard
            :question="question"
            :autofocus="i === 0 && !question.label"
            :deletable="questions.length > 1"
            @grab="handleGrab = true"
            @rename="store.updateQuestionSettings(formId, question.id, { label: $event })"
            @duplicate="store.duplicateQuestion(formId, question.id)"
            @remove="deleteTarget = question"
            @settings="onSettings(question)"
            @options="onOptions(question)"
            @add="store.addQuestionAfter(formId, question.id)"
          />
        </div>

        <!-- Aucune question encore : seul point d'entrée pour démarrer.
             Dès qu'une question existe, on ajoute via le « + » au survol de chaque carte. -->
        <button
          v-if="questions.length === 0"
          class="flex items-center justify-center w-10 h-10 rounded-full text-white shadow-md transition-colors self-start bg-[var(--ds-semantic-bg-brand-solid)] hover:bg-[var(--ds-semantic-bg-brand-solid-hover)]"
          aria-label="Ajouter une question"
          @click="addQuestion"
        >
          <Plus :size="20" />
        </button>
      </div>
    </div>

    <!-- Panneau Paramètres d'une question (slide-over droite) -->
    <QuestionSettingsPanel
      v-if="settingsQuestion"
      :question="settingsQuestion"
      :other-questions="questions.filter((q) => q.id !== settingsQuestion!.id)"
      @save="onSaveSettings"
      @close="settingsQuestion = null"
    />

    <!-- Confirmation avant suppression d'une question -->
    <DeleteQuestionModal
      v-if="deleteTarget"
      :question="deleteTarget"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import Header from '~/components/layout/Header.vue'
import QuestionCard from '~/components/dataos/QuestionCard.vue'
import QuestionSettingsPanel from '~/components/dataos/QuestionSettingsPanel.vue'
import DeleteQuestionModal from '~/components/dataos/DeleteQuestionModal.vue'
import { useDataOsStore } from '~/stores/dataos'
import { useUIStore } from '~/stores/ui'
import { useFormulaireShare } from '~/composables/useFormulaireShare'
import type { Question, QuestionSettingsPatch } from '~/types/dataos'

const route   = useRoute()
const router  = useRouter()
const store   = useDataOsStore()
const uiStore = useUIStore()
const { notifyShare } = useFormulaireShare()

const projetId   = computed(() => String(route.params.id))
const formId     = computed(() => String(route.params.formId))
const formulaire = computed(() => store.formulaireById(formId.value))
const questions  = computed(() => formulaire.value?.questions ?? [])

// Les questions sont persistées en direct dans le store. Pour savoir s'il reste
// quelque chose à « enregistrer », on compare l'état courant au dernier état enregistré.
const savedSnapshot = ref('')
const snapshot = () => JSON.stringify(questions.value)
const dirty = computed(() => snapshot() !== savedSnapshot.value)

onMounted(() => {
  store.init()
  if (!formulaire.value) {
    router.replace(`/dataos/projets/${projetId.value}`)
    return
  }
  savedSnapshot.value = snapshot()

  // Création depuis un template : proposer le partage une fois la transition
  // plein écran terminée (TOQ-560), puis nettoyer le paramètre d'URL.
  if (route.query.created === 'template') {
    const stop = watch(
      () => uiStore.moduleTransition,
      (active) => {
        if (active) return
        notifyShare(formId.value, formulaire.value?.name, { title: 'Formulaire créé' })
        stop()
      },
      { immediate: true },
    )
    router.replace({ path: route.path, query: {} })
  }
})

// Enregistrer = figer l'état courant comme référence. On reste sur la page et on
// confirme par un toast ; le court délai rend l'action expressive.
const saving = ref(false)
let saveTimer: ReturnType<typeof setTimeout>

function save() {
  if (!dirty.value || saving.value) return
  saving.value = true
  saveTimer = setTimeout(() => {
    saving.value = false
    savedSnapshot.value = snapshot()
    // TOQ-560 : proposer le partage du lien dès l'enregistrement.
    notifyShare(formId.value, formulaire.value?.name, { title: 'Formulaire enregistré' })
  }, 600)
}

function saveAsTemplate() {
  // TODO: enregistrer le formulaire courant comme modèle réutilisable.
}

function addQuestion() {
  store.addQuestion(formId.value)
}

// ── Suppression d'une question (confirmation) ──
const deleteTarget = ref<Question | null>(null)

function confirmDelete() {
  if (deleteTarget.value) store.removeQuestion(formId.value, deleteTarget.value.id)
  deleteTarget.value = null
}

// ── Paramètres d'une question (slide-over) ──
const settingsQuestion = ref<Question | null>(null)

function onSettings(question: Question) {
  settingsQuestion.value = question
}

function onSaveSettings(patch: QuestionSettingsPatch) {
  if (!settingsQuestion.value) return
  store.updateQuestionSettings(formId.value, settingsQuestion.value.id, patch)
}

function onOptions(_question: Question) {
  // TODO: configuration des options/choix de la question.
}

// ── Réordonnancement par glisser-déposer (poignée uniquement) ──
const handleGrab = ref(false)
const dragIndex  = ref<number | null>(null)

function onDragStart(i: number) {
  if (!handleGrab.value) return
  dragIndex.value = i
}
function onDrop(i: number) {
  if (dragIndex.value !== null && dragIndex.value !== i) {
    store.reorderQuestions(formId.value, dragIndex.value, i)
  }
  endDrag()
}
function endDrag() {
  handleGrab.value = false
  dragIndex.value  = null
}

onBeforeUnmount(() => clearTimeout(saveTimer))
</script>
