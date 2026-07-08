<template>
  <div v-if="org" class="flex flex-col gap-6">
    <!-- En-tête de section : titre + créer une org (le switch d'org se fait dans
         la sidebar ; pas de badge d'org active ici). -->
    <div class="flex items-start justify-between gap-4 border-b border-border pb-5">
      <div class="min-w-0">
        <h2 class="text-xl font-semibold text-text-primary">Organisation</h2>
        <p class="mt-1 text-base text-text-tertiary">Gère les membres de ton organisation et leurs accès.</p>
      </div>
      <DsButton
        label="Créer une organisation"
        variant="primary"
        size="md"
        icon-leading="plus"
        class="shrink-0"
        @click="openCreateOrg"
      />
    </div>

    <!-- Barre d'outils : recherche · filtre par type · ajouter (collaborateur/agent) + menu.
         Les DsInput* sont width:100% par nature → on les borne dans des conteneurs
         à largeur fixe, sinon ils débordent la page (scroll horizontal). -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="w-full shrink-0 sm:w-[280px]">
        <DsInputField v-model="search" placeholder="Rechercher un membre…">
          <template #icon-leading>
            <DsIcon name="search-md" :size="20" class="text-text-quaternary" />
          </template>
        </DsInputField>
      </div>
      <div class="w-[200px] shrink-0">
        <DsInputDropdown v-model="typeFilter" :options="typeOptions" leading-icon="filter-funnel-01" />
      </div>

      <div class="flex-1" />

      <DsDropdown v-if="canManage" trigger="button" button-label="Ajouter un membre" :open="addOpen" @update:open="addOpen = $event">
        <DsDropdownItem label="Un collaborateur" icon="user-plus-01" @click="onAdd('collaborateur')" />
        <DsDropdownItem label="Un agent" icon="phone-01" @click="onAdd('agent')" />
      </DsDropdown>
      <DsDropdown trigger="icon" :open="kebabOpen" @update:open="kebabOpen = $event">
        <DsDropdownItem v-if="canManage" label="Renommer l'organisation" icon="edit-01" @click="openRename" />
        <DsDropdownItem label="Quitter l'organisation" icon="log-out-01" @click="onKebab(() => (leaveOpen = true))" />
        <template v-if="canManage">
          <DsDropdownDivider />
          <DsDropdownItem
            class="ds-dropdown-item--danger"
            label="Supprimer l'organisation"
            icon="trash-01"
            @click="onKebab(() => (deleteOrgOpen = true))"
          />
        </template>
      </DsDropdown>
    </div>

    <!-- Table unifiée (Membre = collaborateur | agent ; colonne Type). Chrome DsTable. -->
    <div class="overflow-hidden rounded-lg border border-border shadow-sm">
      <div class="overflow-x-auto">
        <div class="min-w-[980px]" style="font-family: var(--ds-typography-font-family-inter)">
          <!-- En-tête gris -->
          <div :class="gridClass" class="border-b border-border bg-surface">
            <div
              v-for="c in columns"
              :key="c"
              class="py-3 text-xs font-medium text-text-tertiary"
              :class="c === 'Actions' ? 'px-4' : 'px-6'"
            >{{ c }}</div>
          </div>

          <!-- Lignes -->
          <div v-for="p in pageRows" :key="p.id" :class="gridClass" class="items-center border-b border-border last:border-b-0">
            <!-- Nom -->
            <div class="flex items-center gap-3 px-6 py-4">
              <DsAvatar size="md" :initials="initials(p)" :alt="`${p.prenom} ${p.nom}`" />
              <div class="flex items-center gap-1.5 truncate">
                <span class="truncate text-sm font-medium text-text-primary">{{ p.prenom }} {{ p.nom }}</span>
                <DsBadge v-if="p.isCurrentUser" label="Toi" color="gray" variant="pill-color" size="sm" />
              </div>
            </div>

            <!-- Type -->
            <div class="px-6 py-4">
              <DsBadge
                :label="p.type === 'collaborateur' ? 'Collaborateur' : 'Agent'"
                :color="p.type === 'collaborateur' ? 'gray' : 'brand'"
                :icon="p.type === 'collaborateur' ? 'user-01' : 'phone-01'"
                variant="pill-color"
                size="sm"
              />
            </div>

            <!-- Identifiant (email ou téléphone) -->
            <div class="whitespace-nowrap px-6 py-4 text-sm text-text-tertiary">{{ p.identifiant }}</div>

            <!-- Accès : modules (collaborateur) ou code (agent) -->
            <div class="px-6 py-4">
              <div v-if="p.type === 'collaborateur'" class="flex flex-wrap items-center gap-1">
                <DsBadge v-if="p.membre?.proprietaire" label="Propriétaire" color="brand" icon="shield-tick" variant="pill-color" size="sm" />
                <template v-else-if="accessEntries(p).length">
                  <AccessBadge v-for="[modId, lvl] in accessEntries(p)" :key="modId" :module-id="modId" :level="lvl" />
                </template>
                <span v-else class="text-sm text-text-quaternary">—</span>
              </div>
              <span v-else class="text-sm text-text-quaternary">—</span>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-center gap-1 px-4 py-4">
              <template v-if="canManage && !p.isCurrentUser">
                <button type="button" title="Modifier"
                  class="flex h-10 w-10 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface hover:text-text-secondary"
                  @click="openEdit(p)">
                  <DsIcon name="edit-01" :size="20" />
                </button>
                <button type="button" title="Retirer"
                  class="flex h-10 w-10 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-error-50 hover:text-error-600"
                  @click="askRemove(p)">
                  <DsIcon name="trash-01" :size="20" />
                </button>
              </template>
            </div>
          </div>

          <!-- Vide -->
          <div v-if="!pageRows.length" class="px-6 py-12 text-center text-sm text-text-tertiary">
            Aucun membre ne correspond à ta recherche.
          </div>
        </div>
      </div>

      <div class="border-t border-border px-4 py-3">
        <DsPagination :current-page="page" :total-pages="totalPages" @page-change="page = $event" />
      </div>
    </div>
  </div>

  <div v-else class="py-12 text-center text-text-tertiary">Aucune organisation active.</div>

  <!-- Panneaux ajout / édition (collaborateur ou agent) -->
  <MemberEditPanel
    v-if="editing?.kind === 'collaborateur'"
    :mode="editing.mode"
    :membre="editing.membre"
    @saved="onSaved"
    @close="editing = null"
  />
  <AgentEditPanel
    v-if="editing?.kind === 'agent'"
    :mode="editing.mode"
    :agent="editing.agent"
    @saved="onSaved"
    @close="editing = null"
  />

  <!-- Retrait -->
  <ConfirmDialog
    v-model="removeOpen"
    :title="removeTarget?.type === 'agent' ? 'Retirer cet agent ?' : 'Retirer ce membre ?'"
    :description="removeDescription"
    confirm-label="Retirer"
    @confirm="confirmRemove"
  />

  <!-- Renommer l'organisation -->
  <Modal v-model="renameOpen" title="Renommer l'organisation" size="md">
    <div class="mt-4">
      <DsInputField v-model="renameDraft" label="Nom de l'organisation" placeholder="Ma coopérative" />
    </div>
    <template #footer>
      <DsButton label="Annuler" variant="secondary-gray" size="md" @click="renameOpen = false" />
      <DsButton label="Enregistrer" variant="primary" size="md" :disabled="!renameDraft.trim()" @click="confirmRename" />
    </template>
  </Modal>

  <!-- Quitter / supprimer l'organisation -->
  <ConfirmDialog
    v-model="leaveOpen"
    title="Quitter l'organisation ?"
    :description="`Tu ne feras plus partie de ${org?.name}. Tu pourras y être réinvité plus tard.`"
    confirm-label="Quitter"
    tone="primary"
    @confirm="onLeave"
  />
  <ConfirmDialog
    v-model="deleteOrgOpen"
    title="Supprimer l'organisation ?"
    :description="`${org?.name} et toutes ses données seront définitivement supprimées. Action irréversible.`"
    confirm-label="Supprimer l'organisation"
    @confirm="onDeleteOrg"
  />

  <!-- Créer une organisation -->
  <Modal v-model="createOpen" title="Créer une organisation" description="Tu en deviendras le Propriétaire." size="md">
    <div class="mt-4 flex flex-col gap-4">
      <DsInputField v-model="createDraft.name" label="Nom de l'organisation" placeholder="Ma coopérative" />
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-text-secondary">Type</label>
        <DsInputDropdown v-model="createDraft.type" :options="orgTypeOptions" />
      </div>
    </div>
    <template #footer>
      <DsButton label="Annuler" variant="secondary-gray" size="md" @click="createOpen = false" />
      <DsButton label="Créer l'organisation" variant="primary" size="md" :disabled="!createDraft.name.trim()" @click="confirmCreateOrg" />
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import Modal from '~/components/ui/Modal.vue'
import { useSessionStore } from '~/stores/session'
import { useToastStore } from '~/stores/toast'
import {
  ORGANISATION_TYPE_LABELS,
  type AccessLevel,
  type Membre,
  type OrgAgent,
  type OrganisationType,
} from '~/types/organisation'

const session = useSessionStore()
const toast   = useToastStore()
session.init()

const org       = computed(() => session.activeOrg)
const canManage = computed(() => session.isOwner)

// ── Modèle unifié : un Membre est de type « collaborateur » ou « agent ». ─────
type PersonType = 'collaborateur' | 'agent'
type PersonStatut = 'actif' | 'invite' | 'inactif'
interface PersonRow {
  type:          PersonType
  id:            string
  prenom:        string
  nom:           string
  identifiant:   string          // email (collaborateur) ou téléphone (agent)
  statut:        PersonStatut
  isCurrentUser: boolean
  membre?:       Membre
  agent?:        OrgAgent
}

const people = computed<PersonRow[]>(() => {
  const collabs: PersonRow[] = (org.value?.membres ?? []).map((m) => ({
    type: 'collaborateur', id: m.id, prenom: m.prenom, nom: m.nom,
    identifiant: m.email, statut: m.status, isCurrentUser: m.isCurrentUser, membre: m,
  }))
  const agents: PersonRow[] = (org.value?.agents ?? []).map((a) => ({
    type: 'agent', id: a.id, prenom: a.prenom, nom: a.nom,
    identifiant: a.telephone, statut: a.statut, isCurrentUser: false, agent: a,
  }))
  const rank = (p: PersonRow) => (p.isCurrentUser ? 0 : p.statut === 'actif' ? 1 : 2)
  return [...collabs, ...agents].sort((x, y) => rank(x) - rank(y))
})

const columns = ['Nom et prénom', 'Type', 'Identifiant', 'Accès', 'Actions']
const gridClass = 'grid grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1.7fr)_116px]'

// ── Filtre par type + recherche + pagination ─────────────────────────────────
const typeFilter = ref<'tous' | 'collaborateur' | 'agent'>('tous')
const typeOptions = [
  { value: 'tous',          label: 'Tous les membres' },
  { value: 'collaborateur', label: 'Collaborateurs' },
  { value: 'agent',         label: 'Agents' },
]

const search = ref('')
const page   = ref(1)
const pageSize = 6

const filtered = computed(() => {
  let list = people.value
  if (typeFilter.value !== 'tous') list = list.filter((p) => p.type === typeFilter.value)
  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter((p) => `${p.prenom} ${p.nom}`.toLowerCase().includes(q) || p.identifiant.toLowerCase().includes(q))
  return list
})
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const pageRows = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))

watch([filtered, totalPages], () => { if (page.value > totalPages.value) page.value = totalPages.value })
watch([search, typeFilter], () => { page.value = 1 })

// ── Helpers d'affichage ──────────────────────────────────────────────────────
function initials(p: PersonRow) { return `${p.prenom.charAt(0)}${p.nom.charAt(0)}`.toUpperCase() }
function accessEntries(p: PersonRow) { return Object.entries(p.membre?.access ?? {}) as [string, AccessLevel][] }

// ── Ajout / édition ──────────────────────────────────────────────────────────
const addOpen  = ref(false)
const editing  = ref<{ kind: PersonType; mode: 'add' | 'edit'; membre?: Membre; agent?: OrgAgent } | null>(null)
function onAdd(kind: PersonType) { addOpen.value = false; editing.value = { kind, mode: 'add' } }
function openEdit(p: PersonRow) {
  editing.value = p.type === 'collaborateur'
    ? { kind: 'collaborateur', mode: 'edit', membre: p.membre }
    : { kind: 'agent', mode: 'edit', agent: p.agent }
}
function onSaved(message: string) { toast.show({ title: message }); editing.value = null }

// ── Retrait ──────────────────────────────────────────────────────────────────
const removeOpen   = ref(false)
const removeTarget = ref<PersonRow | null>(null)
const removeDescription = computed(() => {
  const t = removeTarget.value
  if (!t) return ''
  return t.type === 'agent'
    ? `${t.prenom} ${t.nom} ne pourra plus se connecter à l'app mobile.`
    : `${t.prenom} ${t.nom} n'aura plus accès à ${org.value?.name}.`
})
function askRemove(p: PersonRow) { removeTarget.value = p; removeOpen.value = true }
function confirmRemove() {
  const t = removeTarget.value
  if (t) {
    if (t.type === 'agent') session.removeAgent(t.id)
    else session.removeMembre(t.id)
    toast.show({ title: `${t.prenom} ${t.nom} a été retiré.` })
  }
  removeTarget.value = null
}

// ── Menu org (kebab) : renommer / quitter / supprimer ────────────────────────
const kebabOpen = ref(false)
function onKebab(fn: () => void) { kebabOpen.value = false; fn() }

const renameOpen  = ref(false)
const renameDraft = ref('')
function openRename() { kebabOpen.value = false; renameDraft.value = org.value?.name ?? ''; renameOpen.value = true }
function confirmRename() {
  if (!renameDraft.value.trim()) return
  session.updateActiveOrg({ name: renameDraft.value.trim() })
  renameOpen.value = false
  toast.show({ title: 'Organisation renommée.' })
}

const leaveOpen     = ref(false)
const deleteOrgOpen = ref(false)
function onLeave() {
  const name = org.value?.name ?? ''
  session.leaveOrg(session.activeOrgId)
  toast.show({ title: `Tu as quitté ${name}.` })
}
function onDeleteOrg() {
  const name = org.value?.name ?? ''
  session.deleteOrg(session.activeOrgId)
  toast.show({ title: `${name} a été supprimée.` })
}

// ── Créer une organisation ────────────────────────────────────────────────────
const createOpen  = ref(false)
const createDraft = reactive({ name: '', type: 'agroindustriel' as OrganisationType })
const orgTypeOptions = (Object.keys(ORGANISATION_TYPE_LABELS) as OrganisationType[]).map((value) => ({
  value, label: ORGANISATION_TYPE_LABELS[value],
}))
function openCreateOrg() { createDraft.name = ''; createDraft.type = 'agroindustriel'; createOpen.value = true }
function confirmCreateOrg() {
  if (!createDraft.name.trim()) return
  const created = session.createOrg({ name: createDraft.name.trim(), type: createDraft.type })
  createOpen.value = false
  toast.show({ title: `${created.name} créée.`, description: 'Tu en es le Propriétaire.' })
}
</script>
