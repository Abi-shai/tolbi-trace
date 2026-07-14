<template>
  <!-- Table unifiée (Membre = collaborateur | agent ; colonne Type). Chrome DsTable.
       La barre d'outils (bascule, recherche, filtre, ajout) vit dans OrganisationTab —
       la recherche et le filtre arrivent en props.
       Colonne Accès (ADR-0014) : badge du RÔLE pour un collaborateur, badges des
       grants modules (binaires, sans niveau) pour un agent. -->
  <div v-if="org" class="overflow-hidden rounded-lg border border-border shadow-sm">
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

          <!-- Accès : rôle (collaborateur) ou grants modules (agent) -->
          <div class="px-6 py-4">
            <div v-if="p.type === 'collaborateur'">
              <DsBadge
                :label="roleBadge(p).label"
                :color="roleBadge(p).color"
                :icon="roleBadge(p).icon"
                variant="pill-color"
                size="sm"
              />
            </div>
            <div v-else class="flex flex-wrap items-center gap-1">
              <template v-if="p.agent?.modules.length">
                <AccessBadge v-for="modId in p.agent.modules" :key="modId" :module-id="modId" />
              </template>
              <span v-else class="text-sm text-text-quaternary">—</span>
            </div>
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
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSessionStore } from '~/stores/session'
import { useToastStore } from '~/stores/toast'
import {
  isNativeRoleId,
  NATIVE_ROLE_BY_ID,
  type Membre,
  type OrgAgent,
} from '~/types/organisation'

const props = defineProps<{
  search:     string
  typeFilter: 'tous' | 'collaborateur' | 'agent'
}>()

const session = useSessionStore()
const toast   = useToastStore()
session.init()

const org = computed(() => session.activeOrg)
// Gestion de l'équipe : Propriétaire OU Super-admin (ADR-0014).
const canManage = computed(() => session.canManageTeam)

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

// ── Filtre par type + recherche (props) + pagination ─────────────────────────
const page   = ref(1)
const pageSize = 6

const filtered = computed(() => {
  let list = people.value
  if (props.typeFilter !== 'tous') list = list.filter((p) => p.type === props.typeFilter)
  const q = props.search.trim().toLowerCase()
  if (q) list = list.filter((p) => `${p.prenom} ${p.nom}`.toLowerCase().includes(q) || p.identifiant.toLowerCase().includes(q))
  return list
})
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const pageRows = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))

watch([filtered, totalPages], () => { if (page.value > totalPages.value) page.value = totalPages.value })
watch(() => [props.search, props.typeFilter], () => { page.value = 1 })

// ── Helpers d'affichage ──────────────────────────────────────────────────────
function initials(p: PersonRow) { return `${p.prenom.charAt(0)}${p.nom.charAt(0)}`.toUpperCase() }
// Badge du rôle : Propriétaire en brand, autres natifs gris avec bouclier, les
// rôles custom en gris sans icône.
function roleBadge(p: PersonRow): { label: string; color: string; icon?: string } {
  const roleId = p.membre?.roleId ?? ''
  if (roleId === 'proprietaire') return { label: 'Propriétaire', color: 'brand', icon: 'shield-tick' }
  if (isNativeRoleId(roleId))    return { label: NATIVE_ROLE_BY_ID[roleId].label, color: 'gray', icon: 'shield-tick' }
  return { label: session.roleName(roleId), color: 'gray' }
}

// ── Ajout / édition (l'ajout est déclenché par la barre d'outils du parent) ──
const editing = ref<{ kind: PersonType; mode: 'add' | 'edit'; membre?: Membre; agent?: OrgAgent } | null>(null)
function openAdd(kind: PersonType) { editing.value = { kind, mode: 'add' } }
function openEdit(p: PersonRow) {
  editing.value = p.type === 'collaborateur'
    ? { kind: 'collaborateur', mode: 'edit', membre: p.membre }
    : { kind: 'agent', mode: 'edit', agent: p.agent }
}
function onSaved(message: string) { toast.show({ title: message }); editing.value = null }

defineExpose({ openAdd })

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
</script>
