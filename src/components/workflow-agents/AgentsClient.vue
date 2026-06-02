<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
    <Header
      title="Agents"
      description="Agents terrain assignés à ce processus. Ils exécutent leurs étapes depuis l'application mobile."
    >
      <template #actions>
        <DsButton label="Ajouter un agent" variant="primary" @click="panelOpen = true" />
      </template>
    </Header>

    <div class="flex-1 overflow-hidden">
      <main class="h-full overflow-y-auto px-4 py-4 bg-surface flex flex-col gap-4">

        <!-- Search -->
        <div class="w-[260px]">
          <DsInputField v-model="search" placeholder="Rechercher un agent...">
            <template #icon-leading><Search :size="16" /></template>
          </DsInputField>
        </div>

        <!-- Table -->
        <div class="bg-white border border-border rounded-lg shadow-xs overflow-hidden flex flex-col">

          <!-- Header -->
          <div class="grid grid-cols-[2fr_180px_1fr_80px] border-b border-border shrink-0">
            <div class="px-6 py-3 text-xs font-medium text-text-tertiary leading-[18px]">Nom et prénom</div>
            <div class="px-6 py-3 text-xs font-medium text-text-tertiary leading-[18px]">Dernière activité</div>
            <div class="px-6 py-3 text-xs font-medium text-text-tertiary leading-[18px]">Progression sur les objectifs</div>
            <div class="px-6 py-3 text-xs font-medium text-text-tertiary leading-[18px]">Actions</div>
          </div>

          <!-- Empty state -->
          <div v-if="filtered.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-12 h-12 rounded-full bg-surface flex items-center justify-center mb-4">
              <Users :size="22" class="text-text-quaternary" />
            </div>
            <p class="text-sm font-semibold text-text-secondary mb-1">
              {{ search ? 'Aucun résultat' : "Aucun agent dans l'équipe" }}
            </p>
            <p class="text-xs text-text-quaternary leading-5 max-w-xs">
              {{ search
                ? 'Essayez un autre terme de recherche.'
                : 'Ajoutez les agents terrain qui participeront à ce processus.' }}
            </p>
          </div>

          <!-- Rows -->
          <div
            v-for="agent in pageItems"
            :key="agent.id"
            class="grid grid-cols-[2fr_180px_1fr_80px] border-b border-border last:border-b-0 hover:bg-surface transition-colors"
          >
            <div class="px-6 py-2 flex items-center gap-3">
              <DsAvatar :initials="getInitials(agent.name)" size="md" />
              <span class="text-sm font-medium text-text-primary">{{ agent.name }}</span>
            </div>
            <div class="px-6 py-4 flex items-center">
              <span class="text-sm text-text-tertiary whitespace-nowrap">{{ agent.lastActivity ?? '—' }}</span>
            </div>
            <div class="px-6 py-4 flex items-center">
              <ProgressBar :value="agent.progress ?? 0" :show-label="true" />
            </div>
            <div class="px-4 py-2 flex items-center justify-center">
              <button class="p-2.5 rounded-lg text-text-quaternary hover:text-text-secondary hover:bg-surface transition-colors">
                <Eye :size="16" />
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center py-2">
          <div class="flex items-center border border-border rounded-lg shadow-xs overflow-hidden divide-x divide-border">
            <button
              @click="page = Math.max(1, page - 1)"
              :disabled="currentPage === 1"
              class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-text-secondary bg-white hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft :size="16" />
              Précédent
            </button>
            <button
              v-for="p in totalPages"
              :key="p"
              @click="page = p"
              :class="`min-w-[40px] px-2 py-2 text-sm font-semibold transition-colors ${p === currentPage ? 'bg-surface text-text-nav-hover' : 'bg-white text-text-secondary hover:bg-surface'}`"
            >
              {{ p }}
            </button>
            <button
              @click="page = Math.min(totalPages, page + 1)"
              :disabled="currentPage === totalPages"
              class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-text-secondary bg-white hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Suivant
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>

      </main>
    </div>

    <Transition name="slide-panel">
      <NewAgentPanel
        v-if="panelOpen"
        :workflow-id="workflowId"
        @close="panelOpen = false"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search, Eye, Users, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useAgentsStore } from '~/stores/agents'
import Header from '~/components/layout/Header.vue'
import NewAgentPanel from './NewAgentPanel.vue'
import ProgressBar from '~/components/ui/ProgressBar.vue'

function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

const PAGE_SIZE = 10

const props = defineProps<{ workflowId: string }>()

const agentsStore = useAgentsStore()
const panelOpen   = ref(false)
const search      = ref('')
const page        = ref(1)

agentsStore.init()

const workflowAgents = computed(() => agentsStore.agents.filter((a) => a.workflowId === props.workflowId))

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return workflowAgents.value
  return workflowAgents.value.filter((a) => a.name.toLowerCase().includes(q))
})

watch(search, () => { page.value = 1 })

const totalPages  = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const currentPage = computed(() => Math.min(page.value, totalPages.value))
const pageItems   = computed(() => filtered.value.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE))
</script>
