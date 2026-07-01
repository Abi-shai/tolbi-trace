<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden bg-surface">

    <!-- En-tête : le titre est le nom du projet -->
    <Header :title="projet?.name ?? 'Projet'">
      <template #actions>
        <DsButton label="Inviter un utilisateur" variant="secondary-gray" icon-leading="send-01" @click="invitePanelOpen = true" />

        <!-- « Ajouter un formulaire » → menu déroulant : créer ou partir d'un modèle -->
        <div class="relative">
          <DsButton label="Ajouter un formulaire" variant="primary" icon-leading="plus" @click="addMenuOpen = !addMenuOpen" />
          <template v-if="addMenuOpen">
            <div class="fixed inset-0 z-40" @click="addMenuOpen = false" />
            <div
              class="absolute right-0 top-full mt-2 z-50 w-[282px] py-2 flex flex-col gap-0.5 bg-white rounded-xl border border-[var(--ds-color-gray-light-100)] shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)]"
            >
              <button type="button" class="w-full px-2 py-0.5" @click="onMenuCreate">
                <span
                  class="flex w-full items-center text-left pl-2.5 pr-2 py-2 rounded-md text-sm font-medium leading-5 text-text-primary hover:bg-surface transition-colors"
                  style="font-family: var(--ds-typography-font-family-inter)"
                >Créer à partir de zéro</span>
              </button>
              <button type="button" class="w-full px-2 py-0.5" @click="onMenuTemplate">
                <span
                  class="flex w-full items-center text-left pl-2.5 pr-2 py-2 rounded-md text-sm font-medium leading-5 text-text-primary hover:bg-surface transition-colors"
                  style="font-family: var(--ds-typography-font-family-inter)"
                >Utiliser un template</span>
              </button>
            </div>
          </template>
        </div>
      </template>
    </Header>

    <!-- Barre d'outils : recherche (masquée tant qu'aucun formulaire) -->
    <div v-if="formulaires.length" class="flex items-center gap-4 px-6 pt-5 pb-4 shrink-0">
      <div class="w-full max-w-[360px]">
        <DsInputField v-model="search" type="text" placeholder="Rechercher…">
          <template #icon-leading>
            <DsIcon name="search-md" />
          </template>
        </DsInputField>
      </div>
    </div>

    <!-- Contenu -->
    <div class="flex flex-col flex-1 min-h-0 overflow-y-auto px-6 pb-6">

      <!-- Liste peuplée -->
      <TransitionGroup
        v-if="filtered.length"
        tag="div"
        name="card-pop"
        class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4"
      >
        <FormulaireCard
          v-for="formulaire in filtered"
          :key="formulaire.id"
          :formulaire="formulaire"
          @open="onOpen"
          @rename="onRename"
          @duplicate="store.duplicateFormulaire($event.id)"
          @remove="deleteTarget = $event"
        />
      </TransitionGroup>

      <!-- Aucun résultat de recherche -->
      <div v-else-if="search.trim()" class="flex flex-col items-center justify-center flex-1 gap-4 text-center py-12">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-surface-alt text-text-quaternary">
          <DsIcon name="search-md" :size="24" />
        </div>
        <div class="flex flex-col gap-1 max-w-[352px]">
          <p class="text-lg font-semibold text-text-primary leading-7">Aucun formulaire trouvé</p>
          <p class="text-base text-text-tertiary leading-6">Aucun formulaire ne correspond à « {{ search }} ».</p>
        </div>
      </div>

      <!-- État vide -->
      <div v-else class="flex flex-col items-center justify-center flex-1 gap-4 text-center py-12">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-surface-alt text-text-quaternary">
          <DsIcon name="file-06" :size="24" />
        </div>
        <div class="flex flex-col gap-1 max-w-[352px]">
          <p class="text-lg font-semibold text-text-primary leading-7">Aucun formulaire</p>
          <p class="text-base text-text-tertiary leading-6">Commence à créer des formulaires pour collecter tes informations terrain.</p>
        </div>
        <div class="flex items-center gap-3">
          <DsButton label="Créer à partir de zéro" variant="secondary-gray" @click="createFormulaireDirect" />
          <DsButton label="Utiliser un template" variant="secondary-gray" @click="openTemplates" />
        </div>
      </div>

    </div>

    <NewFormulairePanel
      v-if="panelOpen"
      :formulaire="editing"
      @submit="onSubmit"
      @close="closePanel"
    />

    <InviteUserPanel
      v-if="invitePanelOpen"
      @submit="onInvite"
      @close="invitePanelOpen = false"
    />

    <TemplatePickerPanel
      v-if="templatePanelOpen"
      @open="onOpenTemplate"
      @close="templatePanelOpen = false"
    />

    <!-- Confirmation avant suppression d'un formulaire (action irréversible). -->
    <DeleteFormulaireModal
      v-if="deleteTarget"
      :formulaire="deleteTarget"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '~/components/layout/Header.vue'
import NewFormulairePanel from '~/components/dataos/NewFormulairePanel.vue'
import InviteUserPanel from '~/components/dataos/InviteUserPanel.vue'
import TemplatePickerPanel from '~/components/dataos/TemplatePickerPanel.vue'
import FormulaireCard from '~/components/dataos/FormulaireCard.vue'
import DeleteFormulaireModal from '~/components/dataos/DeleteFormulaireModal.vue'
import { useDataOsStore } from '~/stores/dataos'
import { useUIStore } from '~/stores/ui'
import type { Formulaire, MembreRole, FormulaireTemplate } from '~/types/dataos'

const route   = useRoute()
const router  = useRouter()
const store   = useDataOsStore()
const uiStore = useUIStore()

// Créer un nouveau formulaire : on masque le passage en sidebar double par
// l'overlay plein écran (c'est un nouveau formulaire, pas une simple ouverture).
function enterNewFormulaire(formId: string) {
  uiStore.beginTransition()
  router.push(`/dataos/projets/${projetId.value}/formulaires/${formId}`)
}

const projetId = computed(() => String(route.params.id))
const projet   = computed(() => store.projetById(projetId.value))

onMounted(() => {
  store.init()
  // Projet introuvable (lien direct sans données) → retour à la liste.
  if (!projet.value) router.replace('/dataos/projets')
})

const search           = ref('')
const panelOpen         = ref(false)
const invitePanelOpen   = ref(false)
const templatePanelOpen = ref(false)
const addMenuOpen       = ref(false)
const editing           = ref<Formulaire | null>(null)

// Formulaire en attente de confirmation de suppression (null = aucune).
const deleteTarget = ref<Formulaire | null>(null)
function confirmDelete() {
  if (deleteTarget.value) store.removeFormulaire(deleteTarget.value.id)
  deleteTarget.value = null
}

const formulaires = computed(() => store.formulairesFor(projetId.value))

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return formulaires.value
  return formulaires.value.filter((f) => f.name.toLowerCase().includes(q))
})

// « Créer » : on entre directement dans le flux de nouveau formulaire — un
// formulaire avec une première question vierge à intituler — et ses onglets.
function createFormulaireDirect() {
  const f = store.createFormulaire(projetId.value, 'Nouveau formulaire', '')
  store.addQuestion(f.id)
  enterNewFormulaire(f.id)
}

function openTemplates() {
  templatePanelOpen.value = true
}

function onMenuCreate() {
  addMenuOpen.value = false
  createFormulaireDirect()
}

function onMenuTemplate() {
  addMenuOpen.value = false
  openTemplates()
}

// Clic sur un template → aperçu du template (vue dédiée, en lecture seule).
function onOpenTemplate(template: FormulaireTemplate) {
  router.push(`/dataos/projets/${projetId.value}/templates/${template.id}`)
}

function onRename(formulaire: Formulaire) {
  editing.value   = formulaire
  panelOpen.value = true
}

// Le panneau ne sert plus qu'au renommage d'un formulaire existant.
function onSubmit(name: string, description: string) {
  if (editing.value) store.renameFormulaire(editing.value.id, name, description)
}

function closePanel() {
  panelOpen.value = false
  editing.value   = null
}

function onInvite(email: string, role: MembreRole) {
  store.inviteUser(projetId.value, email, role)
}

// Ouvre un formulaire déjà créé : navigation simple, sans overlay de transition.
// Atterrissage selon le statut — un formulaire publié s'ouvre sur le suivi des
// réponses (l'ops vient le surveiller), un brouillon sur ses questions (il se
// construit encore).
function onOpen(formulaire: Formulaire) {
  const base = `/dataos/projets/${projetId.value}/formulaires/${formulaire.id}`
  router.push(formulaire.status === 'publie' ? `${base}/tableau-de-bord` : base)
}
</script>
