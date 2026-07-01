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

    <!-- Liste de producteurs : import CSV (visible quand le type est « Liste de producteurs »).
         La liste contraint la réponse de l'agent — aucune saisie libre. -->
    <div v-if="fieldType === 'producteur'" class="flex flex-col gap-2">
      <div class="flex flex-col gap-0.5">
        <label class="text-sm font-medium text-text-secondary">Liste de producteurs</label>
        <p class="text-sm text-text-tertiary leading-5">
          Importe un CSV (colonnes : nom, prénom, identifiant). L'agent choisit un producteur dans la liste — pas de saisie libre.
        </p>
      </div>

      <!-- Input fichier partagé : drop-zone (état vide) et bouton « Remplacer ». -->
      <input ref="fileInput" type="file" accept=".csv" class="hidden" @change="onFileChange" />

      <!-- Import en cours -->
      <FileItem
        v-if="upload"
        :name="upload.file.name"
        :size="upload.file.size"
        :progress="upload.progress"
        @remove="clearList"
      >
        <template #icon>
          <div class="flex items-center justify-center size-10 rounded-lg border border-border text-text-tertiary shrink-0">
            <FileText :size="20" />
          </div>
        </template>
      </FileItem>

      <!-- Liste importée -->
      <div
        v-else-if="hasList"
        class="flex items-center gap-3 p-4 bg-white border border-border rounded-xl"
      >
        <div
          class="flex items-center justify-center size-10 rounded-lg shrink-0"
          style="background-color: var(--ds-semantic-bg-success-primary, #ecfdf3); color: var(--ds-semantic-fg-success-primary, #079455)"
        >
          <Check :size="20" />
        </div>
        <div class="flex-1 min-w-0 flex flex-col gap-0.5">
          <p class="text-sm font-medium text-text-secondary leading-5 truncate">{{ producteurSource || 'Liste importée' }}</p>
          <p class="text-sm text-text-tertiary leading-5">{{ producteurs.length }} producteurs</p>
        </div>
        <button
          class="text-sm font-semibold text-[color:var(--ds-semantic-text-brand-secondary)] hover:opacity-80 transition-opacity shrink-0"
          @click="pickFile"
        >
          Remplacer
        </button>
        <button
          class="p-1.5 rounded-md text-[#d92d20] hover:bg-[#fff1f0] transition-colors shrink-0"
          aria-label="Retirer la liste"
          @click="clearList"
        >
          <Trash2 :size="18" />
        </button>
      </div>

      <!-- Drop-zone (état vide) -->
      <div
        v-else
        class="flex flex-col items-center gap-2 p-6 border rounded-xl cursor-pointer transition-colors duration-150"
        :class="invalid
          ? 'border-solid border-[var(--ds-semantic-border-error)] bg-[var(--ds-semantic-bg-error-primary)]'
          : isDragging
            ? 'border-solid border-[var(--ds-semantic-border-secondary)] bg-[var(--ds-semantic-bg-primary-hover)]'
            : 'border-dashed border-border bg-white hover:bg-[var(--ds-semantic-bg-primary-hover)]'"
        @click="pickFile"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
      >
        <div class="flex items-center justify-center size-10 rounded-lg border border-border text-text-tertiary shrink-0">
          <FileText :size="20" />
        </div>
        <div class="flex flex-col gap-0.5 items-center text-center">
          <p class="text-sm font-semibold text-[color:var(--ds-semantic-text-brand-secondary)] leading-5">Importer un CSV de producteurs</p>
          <p class="text-xs text-text-tertiary leading-[18px]">
            {{ invalid
              ? 'Ce fichier n’est pas un CSV. Dépose un fichier .csv.'
              : 'Glisse ton fichier ici ou clique pour parcourir. Colonnes : nom, prénom, identifiant.' }}
          </p>
        </div>
      </div>
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
import { ref, computed, onBeforeUnmount } from 'vue'
import { Check, FileText, Trash2 } from 'lucide-vue-next'
import SlideOverPanel from '~/components/ui/SlideOverPanel.vue'
import FileItem from '~/components/id/FileItem.vue'
import { producteurListeMock } from '~/data/dataos'
import { useToastStore } from '~/stores/toast'
import type { Question, QuestionFieldType, QuestionSettingsPatch, ProducteurOption } from '~/types/dataos'

const props = defineProps<{
  question: Question
  /** Autres questions du formulaire, pour l'affichage conditionnel. */
  otherQuestions?: Question[]
}>()

const emit = defineEmits<{
  save:  [patch: QuestionSettingsPatch]
  close: []
}>()

const toast = useToastStore()

const NONE = '__none__'

const typeOptions = [
  { label: 'Texte',                value: 'text'       },
  { label: 'Téléphone',            value: 'phone'      },
  { label: 'Date',                 value: 'date'       },
  { label: 'Liste de producteurs', value: 'producteur' },
]

const panel     = ref<InstanceType<typeof SlideOverPanel> | null>(null)
const fieldType = ref<QuestionFieldType | null>(props.question.fieldType)
const required  = ref(props.question.required ?? true)
const hint      = ref(props.question.hint ?? '')
const linkedId  = ref(props.question.linkedQuestionId ?? NONE)

// ── Liste de producteurs (import CSV) ──────────────────────────────
// Import simulé façon module ID : n'importe quel .csv charge la liste mock.
const producteurs      = ref<ProducteurOption[]>([...(props.question.producteurs ?? [])])
const producteurSource = ref(props.question.producteurSource ?? '')
const hasList          = computed(() => producteurs.value.length > 0)

const fileInput  = ref<HTMLInputElement | null>(null)
const upload     = ref<{ file: File; progress: number } | null>(null)
const isDragging = ref(false)
const invalid    = ref(false)
let importTimer: ReturnType<typeof setInterval> | undefined

function pickFile() {
  fileInput.value?.click()
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file  = input.files?.[0]
  input.value = '' // autorise la re-sélection du même fichier
  if (file) startImport(file)
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) startImport(file)
}

function startImport(file: File) {
  if (!file.name.toLowerCase().endsWith('.csv')) {
    invalid.value = true
    setTimeout(() => { invalid.value = false }, 1400)
    return
  }
  upload.value = { file, progress: 0 }
  importTimer = setInterval(() => {
    if (!upload.value) { clearInterval(importTimer); return }
    const next = Math.min(100, upload.value.progress + Math.round(Math.random() * 15 + 8))
    upload.value = { ...upload.value, progress: next }
    if (next >= 100) {
      clearInterval(importTimer)
      producteurs.value      = [...producteurListeMock]
      producteurSource.value = file.name
      toast.show({
        title:       'Liste importée',
        description: `${producteurs.value.length} producteurs ajoutés à la question.`,
      })
      // Laisse le 100 % s'afficher brièvement avant de basculer sur le récapitulatif.
      setTimeout(() => { upload.value = null }, 350)
    }
  }, 180)
}

function clearList() {
  if (importTimer) clearInterval(importTimer)
  upload.value           = null
  producteurs.value      = []
  producteurSource.value = ''
}

const linkOptions = computed(() => [
  { label: 'Aucune', value: NONE },
  ...(props.otherQuestions ?? []).map((q) => ({
    label: q.label || 'Question sans titre',
    value: q.id,
  })),
])

function handleSave() {
  const isProducteur = fieldType.value === 'producteur'
  emit('save', {
    fieldType:        fieldType.value,
    required:         required.value,
    hint:             hint.value.trim(),
    linkedQuestionId: linkedId.value === NONE ? null : linkedId.value,
    // Hors type producteur : on purge toute liste résiduelle.
    producteurs:      isProducteur ? producteurs.value : [],
    producteurSource: isProducteur ? producteurSource.value : '',
  })
  panel.value?.close()
}

onBeforeUnmount(() => { if (importTimer) clearInterval(importTimer) })
</script>

<style scoped>
.qsp-radio {
  width: 20px;
  height: 20px;
  accent-color: var(--ds-semantic-bg-brand-solid, #056033);
  cursor: pointer;
}
</style>
