<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden bg-surface">

    <!-- En-tête de la vue Projets (composant Header standard) -->
    <Header title="Projets" description="Crée et gère tes projets de collecte de données terrain.">
      <template #actions>
        <DsButton label="Nouveau projet" variant="primary" icon-leading="plus" @click="openCreate" />
      </template>
    </Header>

    <!-- Barre d'outils : recherche (masquée tant qu'aucun projet n'existe) -->
    <div v-if="store.projets.length" class="flex items-center gap-4 px-6 pt-5 pb-4 shrink-0">
      <div class="w-full max-w-[360px]">
        <DsInputField v-model="search" type="text" placeholder="Rechercher…">
          <template #icon-leading>
            <DsIcon name="search-md" />
          </template>
        </DsInputField>
      </div>
    </div>

    <!-- Contenu : directement sur la surface, pas de carte blanche englobante -->
    <div class="flex flex-col flex-1 min-h-0 overflow-y-auto px-6 pb-6">

      <!-- Liste peuplée : 2 projets par ligne, 3 sur très grand écran -->
      <TransitionGroup
        v-if="filtered.length"
        tag="div"
        name="card-pop"
        class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4"
      >
        <ProjetCard
          v-for="projet in filtered"
          :key="projet.id"
          :projet="projet"
          @view="onView"
          @rename="onRename"
          @duplicate="store.duplicateProjet($event.id)"
          @remove="store.removeProjet($event.id)"
        />
      </TransitionGroup>

      <!-- Aucun résultat de recherche -->
      <div v-else-if="search.trim()" class="flex flex-col items-center justify-center flex-1 gap-4 text-center py-12">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-surface-alt text-text-quaternary">
          <DsIcon name="search-md" :size="24" />
        </div>
        <div class="flex flex-col gap-1 max-w-[352px]">
          <p class="text-lg font-semibold text-text-primary leading-7">Aucun projet trouvé</p>
          <p class="text-base text-text-tertiary leading-6">Aucun projet ne correspond à « {{ search }} ».</p>
        </div>
      </div>

      <!-- État vide -->
      <div v-else class="flex flex-col items-center justify-center flex-1 gap-4 text-center py-12">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-surface-alt text-text-quaternary">
          <Folder :size="24" />
        </div>
        <div class="flex flex-col gap-1 max-w-[352px]">
          <p class="text-lg font-semibold text-text-primary leading-7">Aucun projet</p>
          <p class="text-base text-text-tertiary leading-6">Commence à recenser des producteurs et cartographier leurs parcelles.</p>
        </div>
        <DsButton label="Nouveau projet" variant="primary" icon-leading="plus" @click="openCreate" />
      </div>

    </div>

    <NewProjetPanel
      v-if="panelOpen"
      :projet="editing"
      @submit="onSubmit"
      @close="closePanel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Folder } from 'lucide-vue-next'
import Header from '~/components/layout/Header.vue'
import NewProjetPanel from '~/components/dataos/NewProjetPanel.vue'
import ProjetCard from '~/components/dataos/ProjetCard.vue'
import { useDataOsStore } from '~/stores/dataos'
import { useScenarioStore } from '~/stores/scenario'
import { SCENARIOS } from '~/scenarios'
import type { Projet } from '~/types/dataos'

const store    = useDataOsStore()
const scenario = useScenarioStore()
const router   = useRouter()

onMounted(() => {
  store.init()
  scenario.registerScope('dataos')
  // Si un scénario Data OS est déjà actif au montage, on applique son état.
  if (scenario.active?.scope === 'dataos') applyScenario(scenario.activeId)
})

onUnmounted(() => scenario.unregisterScope('dataos'))

// Les scénarios Data OS pilotent la liste : « Liste peuplée » charge la démo,
// la sortie d'un scénario Data OS revient à l'état vide. Les projets créés à la
// main sont préservés tant qu'on ne touche pas aux scénarios.
watch(() => scenario.activeId, (id, oldId) => applyScenario(id, oldId))

function applyScenario(id: string | null, oldId?: string | null) {
  const active = scenario.active
  if (active?.scope === 'dataos') {
    store.setProjets(active.state.dataos?.projets ?? [])
  } else if (oldId) {
    const oldScope = SCENARIOS.find((s) => s.id === oldId)?.scope
    if (oldScope === 'dataos') store.setProjets([])
  }
}

const search    = ref('')
const panelOpen = ref(false)
const editing   = ref<Projet | null>(null)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return store.projets
  return store.projets.filter((p) => p.name.toLowerCase().includes(q))
})

function openCreate() {
  editing.value   = null
  panelOpen.value = true
}

function onRename(projet: Projet) {
  editing.value   = projet
  panelOpen.value = true
}

function onSubmit(name: string, description: string) {
  if (editing.value) {
    store.renameProjet(editing.value.id, name, description)
    // Renommage : le panneau joue sa sortie animée puis émet `close`.
  } else {
    // Création : on entre directement dans le nouveau projet.
    const projet = store.createProjet(name, description)
    router.push(`/dataos/projets/${projet.id}`)
  }
}

// Appelé après l'animation de sortie du panneau (@close).
function closePanel() {
  panelOpen.value = false
  editing.value   = null
}

function onView(projet: Projet) {
  router.push(`/dataos/projets/${projet.id}`)
}
</script>
