<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
    <Header
      title="Agents"
      description="Agents terrain assignés à ce processus. Chacun se connecte à l'app mobile avec son code PIN personnel."
    >
      <template #actions>
        <DsButton label="Ajouter un agent" variant="primary" icon-leading="plus" @click="openCreate" />
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
        <div class="bg-white border border-border rounded-lg shadow-xs flex flex-col">

          <!-- Header -->
          <div class="grid grid-cols-[minmax(240px,2fr)_140px_160px_1fr_220px] border-b border-border shrink-0">
            <div class="px-6 py-3 text-xs font-medium text-text-tertiary leading-[18px]">Nom et prénom</div>
            <div class="px-6 py-3 text-xs font-medium text-text-tertiary leading-[18px]">Code PIN</div>
            <div class="px-6 py-3 text-xs font-medium text-text-tertiary leading-[18px]">Accès mobile</div>
            <div class="px-6 py-3 text-xs font-medium text-text-tertiary leading-[18px]">Dernière activité</div>
            <div class="px-6 py-3 text-xs font-medium text-text-tertiary leading-[18px] text-right">Actions</div>
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
                ? 'Essaie un autre terme de recherche.'
                : 'Ajoute les agents terrain qui participeront à ce processus.' }}
            </p>
          </div>

          <!-- Rows -->
          <div
            v-for="agent in pageItems"
            :key="agent.id"
            class="grid grid-cols-[minmax(240px,2fr)_140px_160px_1fr_220px] border-b border-border last:border-b-0 hover:bg-surface transition-colors"
            :class="{ 'opacity-60': agent.statut === 'inactif' }"
          >
            <!-- Nom -->
            <div class="px-6 py-2 flex items-center gap-3 min-w-0">
              <DsAvatar :initials="getInitials(agent.name)" size="md" />
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-medium text-text-primary truncate">{{ agent.name }}</span>
                <span v-if="agent.role" class="text-sm text-text-tertiary truncate">{{ agent.role }}</span>
              </div>
            </div>

            <!-- PIN -->
            <div class="px-6 py-4 flex items-center">
              <span class="font-mono text-sm tracking-[0.18em] text-text-primary tabular-nums">{{ agent.pin }}</span>
            </div>

            <!-- Accès mobile (toggle) -->
            <div class="px-6 py-4 flex items-center">
              <DsToggle
                size="sm"
                :model-value="agent.statut === 'actif'"
                :label="agent.statut === 'actif' ? 'Actif' : 'Inactif'"
                @update:model-value="onToggleAccess(agent, $event)"
              />
            </div>

            <!-- Dernière activité -->
            <div class="px-6 py-4 flex items-center">
              <span class="text-sm text-text-tertiary whitespace-nowrap">{{ agent.lastActivity ?? '—' }}</span>
            </div>

            <!-- Actions -->
            <div class="px-4 py-2 flex items-center justify-end gap-0.5">
              <button
                type="button"
                title="Copier le code"
                class="p-2 rounded-lg text-text-quaternary hover:text-text-secondary hover:bg-surface transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                :disabled="agent.statut === 'inactif'"
                @click="copyPin(agent)"
              >
                <Copy :size="16" />
              </button>
              <button
                v-if="agent.phone"
                type="button"
                title="Partager par WhatsApp"
                class="p-2 rounded-lg text-text-quaternary hover:text-success-600 hover:bg-surface transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                :disabled="agent.statut === 'inactif'"
                @click="shareWhatsApp(agent)"
              >
                <MessageCircle :size="16" />
              </button>
              <button
                type="button"
                title="Régénérer le code"
                class="p-2 rounded-lg text-text-quaternary hover:text-text-secondary hover:bg-surface transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                :disabled="agent.statut === 'inactif'"
                @click="regenTarget = agent"
              >
                <RefreshCw :size="16" />
              </button>
              <button
                type="button"
                title="Modifier"
                class="p-2 rounded-lg text-text-quaternary hover:text-text-secondary hover:bg-surface transition-colors"
                @click="openEdit(agent)"
              >
                <Pencil :size="16" />
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center py-2">
          <DsPagination
            :current-page="currentPage"
            :total-pages="totalPages"
            @page-change="page = $event"
          />
        </div>

      </main>
    </div>

    <!-- Create / edit panel -->
    <NewAgentPanel
      v-if="panelOpen"
      :workflow-id="workflowId"
      :agent="editAgent ?? undefined"
      @close="closePanel"
    />

    <!-- Confirm: régénérer -->
    <Modal
      :model-value="!!regenTarget"
      title="Régénérer le code PIN ?"
      :description="regenTarget ? `L'ancien code de ${regenTarget.name} ne fonctionnera plus. Pense à partager le nouveau code.` : ''"
      @update:model-value="regenTarget = null"
    >
      <template #footer>
        <DsButton label="Annuler" variant="secondary-gray" @click="regenTarget = null" />
        <DsButton label="Régénérer" variant="primary" @click="confirmRegen" />
      </template>
    </Modal>

    <!-- Révéler le nouveau code (régénération ou réactivation) -->
    <Modal
      :model-value="!!newPinInfo"
      :title="newPinInfo?.reason === 'reactivate' ? 'Agent réactivé' : 'Nouveau code PIN'"
      :description="newPinInfo
        ? `Voici le nouveau code de ${newPinInfo.agent.name}. Partage-le pour qu'il puisse se connecter.`
        : ''"
      @update:model-value="newPinInfo = null"
    >
      <div v-if="newPinInfo" class="mt-6 flex justify-center">
        <DsVerificationCode :digits="4" :model-value="newPinInfo.pin" disabled />
      </div>
      <template #footer>
        <DsButton label="Copier le code" variant="secondary-gray" @click="copyPin(newPinInfo!.agent)" />
        <DsButton
          v-if="newPinInfo?.agent.phone"
          label="Partager par WhatsApp"
          variant="primary"
          @click="shareWhatsApp(newPinInfo!.agent)"
        />
        <DsButton v-else label="Fermer" variant="primary" @click="newPinInfo = null" />
      </template>
    </Modal>

    <!-- Confirm: désactiver -->
    <Modal
      :model-value="!!deactivateTarget"
      title="Désactiver cet agent ?"
      :description="deactivateTarget ? `Le code de ${deactivateTarget.name} sera désactivé et il ne pourra plus se connecter. Son historique est conservé.` : ''"
      @update:model-value="deactivateTarget = null"
    >
      <template #footer>
        <DsButton label="Annuler" variant="secondary-gray" @click="deactivateTarget = null" />
        <DsButton label="Désactiver" variant="danger" @click="confirmDeactivate" />
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search, Users, Copy, MessageCircle, RefreshCw, Pencil } from 'lucide-vue-next'
import { useAgentsStore } from '~/stores/agents'
import type { Agent } from '~/types/agent'
import Header from '~/components/layout/Header.vue'
import NewAgentPanel from './NewAgentPanel.vue'
import Modal from '~/components/ui/Modal.vue'

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
const editAgent   = ref<Agent | null>(null)
const search      = ref('')
const page        = ref(1)

const regenTarget      = ref<Agent | null>(null)
const deactivateTarget = ref<Agent | null>(null)
const newPinInfo       = ref<{ agent: Agent; pin: string; reason: 'regenerate' | 'reactivate' } | null>(null)

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

function openCreate() {
  editAgent.value = null
  panelOpen.value = true
}

function openEdit(agent: Agent) {
  editAgent.value = agent
  panelOpen.value = true
}

function closePanel() {
  panelOpen.value = false
  editAgent.value = null
}

function copyPin(agent: Agent) {
  navigator.clipboard?.writeText(agent.pin)
}

function shareWhatsApp(agent: Agent) {
  if (!agent.phone) return
  const digits = agent.phone.replace(/[^\d]/g, '')
  const firstName = agent.name.trim().split(' ')[0]
  const msg = `Salut ${firstName}, voici ton code d'accès Tolbi pour la collecte : ${agent.pin}. Ouvre l'app Tolbi et saisis ce code pour démarrer.`
  window.open(`https://wa.me/${digits}?text=${encodeURIComponent(msg)}`, '_blank')
}

function onToggleAccess(agent: Agent, value: boolean) {
  if (value) {
    // Réactivation immédiate (sans confirmation) — un nouveau code est attribué.
    const pin = agentsStore.reactivateAgent(agent.id)
    if (pin) newPinInfo.value = { agent, pin, reason: 'reactivate' }
  } else {
    deactivateTarget.value = agent
  }
}

function confirmRegen() {
  const agent = regenTarget.value
  if (!agent) return
  const pin = agentsStore.regeneratePin(agent.id)
  regenTarget.value = null
  if (pin) newPinInfo.value = { agent, pin, reason: 'regenerate' }
}

function confirmDeactivate() {
  if (deactivateTarget.value) agentsStore.deactivateAgent(deactivateTarget.value.id)
  deactivateTarget.value = null
}
</script>
