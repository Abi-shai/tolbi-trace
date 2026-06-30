<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden bg-surface content-arrive">

    <!-- En-tête de l'éditeur -->
    <header class="flex items-center justify-between gap-4 px-4 py-3 bg-white border-b border-border shrink-0">
      <div class="flex items-center gap-3 min-w-0">
        <button
          class="flex items-center justify-center w-9 h-9 rounded-lg text-text-secondary hover:bg-surface transition-colors shrink-0"
          @click="goBack"
        >
          <ArrowLeft :size="20" />
        </button>
        <h1 class="text-xl font-semibold text-text-primary truncate">{{ formulaire?.name ?? 'Formulaire' }}</h1>
      </div>
      <div class="flex items-center gap-3 shrink-0">
        <DsButton label="Enregistrer comme template" variant="secondary-gray" :disabled="saving" @click="saveAsTemplate" />
        <DsButton label="Enregistrer le formulaire" variant="primary" :loading="saving" @click="save" />
      </div>
    </header>

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
            @grab="handleGrab = true"
            @select="onSelect(question, $event)"
            @duplicate="store.duplicateQuestion(formId, question.id)"
            @remove="store.removeQuestion(formId, question.id)"
            @settings="onSettings(question)"
            @options="onOptions(question)"
            @add="store.addQuestionAfter(formId, question.id)"
          />
        </div>

        <!-- Ajouter une question -->
        <button
          class="flex items-center justify-center w-10 h-10 rounded-full text-white shadow-md transition-colors self-start bg-[var(--ds-semantic-bg-brand-solid)] hover:bg-[var(--ds-semantic-bg-brand-solid-hover)]"
          @click="addQuestion"
        >
          <Plus :size="20" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Plus } from 'lucide-vue-next'
import QuestionCard from '~/components/dataos/QuestionCard.vue'
import { useDataOsStore } from '~/stores/dataos'
import type { Question, QuestionFieldOption } from '~/types/dataos'

const route  = useRoute()
const router = useRouter()
const store  = useDataOsStore()

const projetId   = computed(() => String(route.params.id))
const formId     = computed(() => String(route.params.formId))
const formulaire = computed(() => store.formulaireById(formId.value))
const questions  = computed(() => formulaire.value?.questions ?? [])

onMounted(() => {
  store.init()
  if (!formulaire.value) router.replace(`/dataos/projets/${projetId.value}`)
})

function goBack() {
  router.push(`/dataos/projets/${projetId.value}`)
}

// Les questions sont déjà persistées dans le store au fil des modifications ;
// on marque un court temps de chargement pour rendre l'action expressive.
const saving = ref(false)
let saveTimer: ReturnType<typeof setTimeout>

function save() {
  if (saving.value) return
  saving.value = true
  saveTimer = setTimeout(() => router.push(`/dataos/projets/${projetId.value}`), 600)
}

function saveAsTemplate() {
  // TODO: enregistrer le formulaire courant comme modèle réutilisable.
}

function addQuestion() {
  store.addQuestion(formId.value)
}

function onSelect(question: Question, option: QuestionFieldOption) {
  store.setQuestionField(formId.value, question.id, option.fieldType, option.label)
}

function onSettings(_question: Question) {
  // TODO: panneau de réglages de la question.
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
