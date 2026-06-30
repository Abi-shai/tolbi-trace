<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden bg-surface">

    <!-- En-tête : le titre est le nom du projet -->
    <Header :title="projet?.name ?? 'Projet'">
      <template #actions>
        <DsButton label="Inviter un utilisateur" variant="secondary-gray" icon-leading="send-01" @click="invitePanelOpen = true" />
        <DsButton label="Nouveau formulaire" variant="primary" icon-leading="plus" @click="openCreate" />
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
          @remove="store.removeFormulaire($event.id)"
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
          <DsButton label="Utiliser un template" variant="secondary-gray" @click="openTemplates" />
          <DsButton label="Créer un formulaire" variant="secondary-gray" @click="openCreate" />
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
import { useDataOsStore } from '~/stores/dataos'
import type { Formulaire, MembreRole, FormulaireTemplate } from '~/types/dataos'

const route  = useRoute()
const router = useRouter()
const store  = useDataOsStore()

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
const editing           = ref<Formulaire | null>(null)

const formulaires = computed(() => store.formulairesFor(projetId.value))

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return formulaires.value
  return formulaires.value.filter((f) => f.name.toLowerCase().includes(q))
})

function openCreate() {
  editing.value   = null
  panelOpen.value = true
}

function openTemplates() {
  templatePanelOpen.value = true
}

// Clic sur un template → aperçu du template (vue dédiée, en lecture seule).
function onOpenTemplate(template: FormulaireTemplate) {
  router.push(`/dataos/projets/${projetId.value}/templates/${template.id}`)
}

function onRename(formulaire: Formulaire) {
  editing.value   = formulaire
  panelOpen.value = true
}

function onSubmit(name: string, description: string) {
  if (editing.value) {
    store.renameFormulaire(editing.value.id, name, description)
  } else {
    // Nouveau formulaire vierge → on ouvre l'éditeur dessus.
    const f = store.createFormulaire(projetId.value, name, description)
    router.push(`/dataos/projets/${projetId.value}/formulaires/${f.id}`)
  }
}

function closePanel() {
  panelOpen.value = false
  editing.value   = null
}

function onInvite(email: string, role: MembreRole) {
  store.inviteUser(projetId.value, email, role)
}

// Ouvre l'éditeur du formulaire.
function onOpen(formulaire: Formulaire) {
  router.push(`/dataos/projets/${projetId.value}/formulaires/${formulaire.id}`)
}
</script>
