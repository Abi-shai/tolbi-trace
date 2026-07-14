<template>
  <div v-if="org" class="flex flex-col gap-6">
    <!-- En-tête de section : titre + actions org (créer / renommer / quitter /
         supprimer — le switch d'org se fait dans la sidebar). -->
    <div class="flex items-start justify-between gap-4 border-b border-border pb-5">
      <div class="min-w-0">
        <h2 class="text-xl font-semibold text-text-primary">Organisation</h2>
        <p class="mt-1 text-base text-text-tertiary">Gère les membres de ton organisation, leurs rôles et leurs accès.</p>
      </div>
      <div class="flex shrink-0 items-center gap-3">
        <DsButton
          label="Créer une organisation"
          variant="primary"
          size="md"
          icon-leading="plus"
          @click="openCreateOrg"
        />
        <DsDropdown trigger="icon" :open="kebabOpen" @update:open="kebabOpen = $event">
          <DsDropdownItem v-if="session.isOwner" label="Renommer l'organisation" icon="edit-01" @click="openRename" />
          <DsDropdownItem label="Quitter l'organisation" icon="log-out-01" @click="onKebab(() => (leaveOpen = true))" />
          <template v-if="session.isOwner">
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
    </div>

    <!-- UNE barre d'outils horizontale : bascule Rôles · Membres, puis recherche,
         filtre et action contextuels — ils apparaissent selon la vue active. -->
    <div class="flex flex-wrap items-center gap-3">
      <DsButtonGroup>
        <DsButtonGroupItem label="Rôles" :active="view === 'roles'" @click="view = 'roles'" />
        <DsButtonGroupItem label="Membres" :active="view === 'membres'" @click="view = 'membres'" />
      </DsButtonGroup>

      <div class="w-full shrink-0 sm:w-[280px]">
        <DsInputField
          v-model="search"
          :placeholder="view === 'membres' ? 'Rechercher un membre…' : 'Rechercher un rôle…'"
        >
          <template #icon-leading>
            <DsIcon name="search-md" :size="20" class="text-text-quaternary" />
          </template>
        </DsInputField>
      </div>
      <div v-if="view === 'membres'" class="w-[200px] shrink-0">
        <DsInputDropdown v-model="typeFilter" :options="typeOptions" leading-icon="filter-funnel-01" />
      </div>

      <div class="flex-1" />

      <template v-if="session.canManageTeam">
        <DsButton
          v-if="view === 'roles'"
          label="Créer un rôle"
          variant="secondary-gray"
          size="md"
          icon-leading="plus"
          class="shrink-0"
          @click="rolesTabRef?.openCreate()"
        />
        <DsDropdown v-else trigger="button" button-label="Ajouter un membre" :open="addOpen" @update:open="addOpen = $event">
          <DsDropdownItem label="Un collaborateur" icon="user-plus-01" @click="onAdd('collaborateur')" />
          <DsDropdownItem label="Un agent" icon="phone-01" @click="onAdd('agent')" />
        </DsDropdown>
      </template>
    </div>

    <RolesTab v-if="view === 'roles'" ref="rolesTabRef" :search="search" />
    <MembresTab v-else ref="membresTabRef" :search="search" :type-filter="typeFilter" />
  </div>

  <div v-else class="py-12 text-center text-text-tertiary">Aucune organisation active.</div>

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
import { useRoute, useRouter } from 'vue-router'
import Modal from '~/components/ui/Modal.vue'
import MembresTab from '~/components/settings/MembresTab.vue'
import RolesTab from '~/components/settings/RolesTab.vue'
import { useSessionStore } from '~/stores/session'
import { useToastStore } from '~/stores/toast'
import { ORGANISATION_TYPE_LABELS, type OrganisationType } from '~/types/organisation'

const session = useSessionStore()
const toast   = useToastStore()
const route   = useRoute()
const router  = useRouter()
session.init()

const org = computed(() => session.activeOrg)

// ── Bascule Rôles · Membres (Rôles en premier = vue d'arrivée). Deep-linkable
//    via ?vue= (ex. le panneau d'affectation Data OS cible la vue Membres). ────
type OrgView = 'roles' | 'membres'
const view = ref<OrgView>(route.query.vue === 'membres' ? 'membres' : 'roles')
watch(view, (v) => {
  search.value = ''
  if (route.query.vue !== v) router.replace({ query: { ...route.query, vue: v } })
})

// ── État de la barre d'outils, partagé avec la vue active via props ──────────
const search     = ref('')
const typeFilter = ref<'tous' | 'collaborateur' | 'agent'>('tous')
const typeOptions = [
  { value: 'tous',          label: 'Tous les membres' },
  { value: 'collaborateur', label: 'Collaborateurs' },
  { value: 'agent',         label: 'Agents' },
]

// Les actions contextuelles délèguent aux vues (panneaux ajout/création).
const rolesTabRef   = ref<InstanceType<typeof RolesTab> | null>(null)
const membresTabRef = ref<InstanceType<typeof MembresTab> | null>(null)
const addOpen = ref(false)
function onAdd(kind: 'collaborateur' | 'agent') {
  addOpen.value = false
  membresTabRef.value?.openAdd(kind)
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
