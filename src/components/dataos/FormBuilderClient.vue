<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden bg-surface content-arrive">

    <!-- En-tête de page standard : l'onglet courant + les actions d'enregistrement -->
    <Header title="Questions">
      <template #actions>
        <!-- DsButton n'accepte pas de contenu (label string only, styles scopés) :
             on reproduit le look secondary-gray/md en utilitaires pour matcher les
             boutons voisins, et on glisse le compteur d'agents dans un vrai DsBadge
             à l'intérieur du bouton (au lieu de « · N » en texte). -->
        <button
          type="button"
          class="inline-flex h-[42px] items-center gap-1.5 rounded-lg border border-[#d0d5dd] bg-white px-3.5 text-sm font-semibold text-text-secondary shadow-xs transition-colors hover:bg-surface"
          @click="showAgents = true"
        >
          <DsIcon name="users-01" :size="20" />
          <span>Agents affectés</span>
          <DsBadge v-if="agentCount" :label="String(agentCount)" color="gray" variant="pill-color" size="sm" />
        </button>
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

    <!-- Affectation des agents (roster org) à ce formulaire — cf. ADR-0012 -->
    <AssignAgentsPanel
      v-if="showAgents"
      :formulaire-id="formId"
      @saved="onAgentsSaved"
      @close="showAgents = false"
    />

    <!-- Garde de sortie : une seule modale adaptative (modifs non enregistrées
         et/ou aucun agent affecté). Même coquille que UnsavedChangesModal /
         ConfirmDialog : titre + description, boutons DS. X / dehors = rester. -->
    <Modal
      :model-value="leaveModal"
      :title="leaveTitle"
      :description="leaveDescription"
      size="md"
      @update:model-value="(v) => { if (!v) settleLeave(false) }"
    >
      <!-- Cas A (modifs + aucun agent) : raccourci pour affecter sans quitter. -->
      <div v-if="warnSave && warnAgents" class="mt-2">
        <DsButton label="Affecter des agents" variant="link" size="md" @click="goAffectAgents" />
      </div>

      <template #footer>
        <template v-if="warnSave">
          <DsButton label="Quitter sans enregistrer" variant="secondary-gray" size="md" @click="leaveDiscard" />
          <DsButton label="Enregistrer et quitter" variant="primary" size="md" @click="leaveSave" />
        </template>
        <template v-else>
          <DsButton label="Quitter quand même" variant="secondary-gray" size="md" @click="leaveAnyway" />
          <DsButton label="Affecter des agents" variant="primary" size="md" @click="goAffectAgents" />
        </template>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import Header from '~/components/layout/Header.vue'
import Modal from '~/components/ui/Modal.vue'
import QuestionCard from '~/components/dataos/QuestionCard.vue'
import QuestionSettingsPanel from '~/components/dataos/QuestionSettingsPanel.vue'
import DeleteQuestionModal from '~/components/dataos/DeleteQuestionModal.vue'
import AssignAgentsPanel from '~/components/dataos/AssignAgentsPanel.vue'
import { useDataOsStore } from '~/stores/dataos'
import { useToastStore } from '~/stores/toast'
import { useUIStore } from '~/stores/ui'
import type { Question, QuestionSettingsPatch } from '~/types/dataos'

const route   = useRoute()
const router  = useRouter()
const store   = useDataOsStore()
const toast   = useToastStore()
const uiStore = useUIStore()

const projetId   = computed(() => String(route.params.id))
const formId     = computed(() => String(route.params.formId))
const formulaire = computed(() => store.formulaireById(formId.value))
const questions  = computed(() => formulaire.value?.questions ?? [])

// Affectation des agents (roster org) — slide-over ouvert depuis l'en-tête.
const showAgents = ref(false)
const agentCount = computed(() => formulaire.value?.agentIds?.length ?? 0)
function onAgentsSaved(message: string) { toast.show({ title: message }) }

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

  // Création depuis un template : confirmer une fois la transition plein écran
  // terminée, puis nettoyer le paramètre d'URL.
  if (route.query.created === 'template') {
    const stop = watch(
      () => uiStore.moduleTransition,
      (active) => {
        if (active) return
        toast.show({ title: 'Formulaire créé' })
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
    toast.show({ title: 'Formulaire enregistré' })
  }, 600)
}

function saveAsTemplate() {
  // TODO: enregistrer le formulaire courant comme modèle réutilisable.
}

// ── Garde de sortie (onglet Questions) ───────────────────────────────────────
// On prévient dès qu'on QUITTE l'onglet Questions — y compris vers les autres
// onglets du formulaire (Suivi des réponses, Analytiques), pas seulement à la
// sortie complète — si des modifications ne sont pas enregistrées et/ou si aucun
// agent n'est affecté. UNE seule modale adaptative, jamais deux enchaînées.
const noAgents         = computed(() => (formulaire.value?.agentIds?.length ?? 0) === 0)
const hasRealQuestions = computed(() => questions.value.some((q) => (q.label ?? '').trim() !== ''))
const warnSave         = computed(() => dirty.value)
const warnAgents       = computed(() => noAgents.value && hasRealQuestions.value)
const leaveTitle = computed(() => {
  if (warnSave.value && warnAgents.value) return 'Avant de quitter'
  if (warnSave.value)                     return 'Modifications non enregistrées'
  return 'Aucun agent affecté'
})
const leaveDescription = computed(() => {
  if (warnSave.value && warnAgents.value)
    return "Tes modifications ne sont pas enregistrées, et aucun agent n'est affecté à ce formulaire."
  if (warnSave.value)
    return 'Tu as des modifications non enregistrées. Tu veux les enregistrer avant de quitter ?'
  return 'Personne ne pourra collecter ce formulaire sur le terrain. Tu veux affecter des agents avant de quitter ?'
})

const leaveModal = ref(false)
let leaveResolve: ((go: boolean) => void) | null = null

onBeforeRouteLeave(() => {
  // Rien à signaler → on laisse partir librement (y compris changement d'onglet).
  if (!warnSave.value && !warnAgents.value) return true
  // Sinon on bloque : le choix de l'utilisateur résout la promesse.
  return new Promise<boolean>((resolve) => {
    leaveResolve = resolve
    leaveModal.value = true
  })
})

function settleLeave(go: boolean) {
  if (!leaveResolve) return
  const resolve = leaveResolve
  leaveResolve = null
  leaveModal.value = false
  resolve(go)
}
function leaveSave() {
  savedSnapshot.value = snapshot()
  toast.show({ title: 'Formulaire enregistré' })
  settleLeave(true)
}
function leaveDiscard() {
  // Restaure le dernier état enregistré, puis quitte.
  try { store.setFormulaireQuestions(formId.value, JSON.parse(savedSnapshot.value)) } catch { /* snapshot vide */ }
  settleLeave(true)
}
function leaveAnyway() { settleLeave(true) }
function goAffectAgents() {
  settleLeave(false)   // on annule la sortie…
  showAgents.value = true   // … et on ouvre le slide-over d'affectation.
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
