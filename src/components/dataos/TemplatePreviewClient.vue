<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden bg-surface content-arrive">

    <!-- En-tête : retour + nom du template + action -->
    <header class="flex items-center justify-between gap-4 px-4 py-3 bg-white border-b border-border shrink-0">
      <div class="flex items-center gap-3 min-w-0">
        <button
          class="flex items-center justify-center w-9 h-9 rounded-lg text-text-secondary hover:bg-surface transition-colors shrink-0"
          @click="goBack"
        >
          <ArrowLeft :size="20" />
        </button>
        <h1 class="text-xl font-semibold text-text-primary truncate">{{ template?.name ?? 'Template' }}</h1>
      </div>
      <DsButton label="Utiliser le template" variant="primary" :loading="using" :disabled="!template" @click="useTemplate" />
    </header>

    <!-- Aperçu en lecture seule des questions du template -->
    <div class="flex-1 overflow-y-auto">
      <div class="flex flex-col gap-4 p-4 w-full">
        <QuestionCard
          v-for="question in questions"
          :key="question.id"
          :question="question"
          :readonly="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import QuestionCard from '~/components/dataos/QuestionCard.vue'
import { formulaireTemplates } from '~/data/dataos'
import { useDataOsStore } from '~/stores/dataos'

const route  = useRoute()
const router = useRouter()
const store  = useDataOsStore()

const projetId   = computed(() => String(route.params.id))
const templateId = computed(() => String(route.params.templateId))
const template   = computed(() => formulaireTemplates.find((t) => t.id === templateId.value))
const questions  = computed(() => template.value?.questions ?? [])

onMounted(() => {
  store.init()
  if (!template.value) router.replace(`/dataos/projets/${projetId.value}`)
})

function goBack() {
  router.push(`/dataos/projets/${projetId.value}`)
}

// « Utiliser le template » → état de chargement, puis crée le formulaire et ouvre l'éditeur.
const using = ref(false)
let useTimer: ReturnType<typeof setTimeout>

function useTemplate() {
  if (!template.value || using.value) return
  using.value = true
  useTimer = setTimeout(() => {
    const f = store.createFormulaireFromTemplate(projetId.value, template.value!)
    router.push(`/dataos/projets/${projetId.value}/formulaires/${f.id}`)
  }, 700)
}

onBeforeUnmount(() => clearTimeout(useTimer))
</script>
