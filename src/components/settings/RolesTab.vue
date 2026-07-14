<template>
  <!-- Table des rôles (chrome DsTable, grille custom comme la table Membres).
       La barre d'outils (bascule, recherche, « Créer un rôle ») vit dans
       OrganisationTab — la recherche arrive en prop. Natifs puis customs, dans
       une seule liste ; les natifs ne portent aucune action (ADR-0014). -->
  <div class="overflow-hidden rounded-lg border border-border shadow-sm">
    <div class="overflow-x-auto">
      <div class="min-w-[880px]" style="font-family: var(--ds-typography-font-family-inter)">
        <div :class="gridClass" class="border-b border-border bg-surface">
          <div
            v-for="c in columns"
            :key="c"
            class="py-3 text-xs font-medium text-text-tertiary"
            :class="c === 'Actions' ? 'px-4' : 'px-6'"
          >{{ c }}</div>
        </div>

        <div v-for="r in filteredRows" :key="r.id" :class="gridClass" class="items-center border-b border-border last:border-b-0">
          <!-- Rôle : nom + description (natifs), lisible en entier — pas de troncature.
               Ligne secondaire en text-sm tertiaire, la taille standard du texte
               d'appui partout dans l'app (cellule Identifiant, supporting texts). -->
          <div class="flex min-w-0 flex-col gap-0.5 px-6 py-4">
            <span class="truncate text-sm font-medium text-text-primary">{{ r.name }}</span>
            <span v-if="r.description" class="text-sm text-text-tertiary">{{ r.description }}</span>
          </div>

          <!-- Accès portés par le rôle -->
          <div class="px-6 py-4">
            <span v-if="r.kind === 'natif'" class="text-sm text-text-tertiary">Tous les modules</span>
            <div v-else class="flex flex-wrap items-center gap-1">
              <template v-if="accessEntries(r).length">
                <AccessBadge v-for="[modId, lvl] in accessEntries(r)" :key="modId" :module-id="modId" :level="lvl" />
              </template>
              <span v-else class="text-sm text-text-quaternary">—</span>
            </div>
          </div>

          <!-- Porteurs -->
          <div class="whitespace-nowrap px-6 py-4 text-sm text-text-tertiary">
            {{ carrierLabel(r.id) }}
          </div>

          <!-- Actions (rôles custom uniquement) -->
          <div class="flex items-center justify-center gap-1 px-4 py-4">
            <template v-if="canManage && r.kind === 'custom'">
              <button type="button" title="Modifier"
                class="flex h-10 w-10 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface hover:text-text-secondary"
                @click="openEdit(r.id)">
                <DsIcon name="edit-01" :size="20" />
              </button>
              <button type="button" title="Supprimer"
                class="flex h-10 w-10 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-error-50 hover:text-error-600"
                @click="askDelete(r.id)">
                <DsIcon name="trash-01" :size="20" />
              </button>
            </template>
          </div>
        </div>

        <!-- Vide -->
        <div v-if="!filteredRows.length" class="px-6 py-12 text-center text-sm text-text-tertiary">
          Aucun rôle ne correspond à ta recherche.
        </div>
      </div>
    </div>
  </div>

  <!-- Création / édition d'un rôle custom -->
  <RoleEditPanel
    v-if="editing"
    :mode="editing.mode"
    :role="editing.role"
    @saved="onSaved"
    @close="editing = null"
  />

  <!-- Suppression : si le rôle est porté, la réaffectation se choisit ICI, dans le
       même geste — jamais de fallback silencieux (ADR-0014). -->
  <Modal v-model="deleteOpen" :title="deleteTarget ? `Supprimer « ${deleteTarget.name} » ?` : ''" size="md">
    <div class="mt-4 flex flex-col gap-4">
      <p class="text-sm text-text-tertiary">
        <template v-if="carrierCount > 0">
          {{ carrierCount }} membre{{ carrierCount > 1 ? 's' : '' }} porte{{ carrierCount > 1 ? 'nt' : '' }} ce rôle.
          Choisis le rôle qu'{{ carrierCount > 1 ? 'ils porteront' : 'il portera' }} ensuite pour continuer.
        </template>
        <template v-else>
          Aucun membre ne porte ce rôle. Sa suppression est définitive.
        </template>
      </p>
      <div v-if="carrierCount > 0" class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-text-secondary">Nouveau rôle des porteurs</label>
        <DsInputDropdown v-model="reassignTo" :options="reassignOptions" placeholder="Choisis un rôle" />
      </div>
    </div>
    <template #footer>
      <DsButton label="Annuler" variant="secondary-gray" size="md" @click="deleteOpen = false" />
      <DsButton
        label="Supprimer le rôle"
        variant="danger"
        size="md"
        :disabled="carrierCount > 0 && !reassignTo"
        @click="confirmDelete"
      />
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Modal from '~/components/ui/Modal.vue'
import { useSessionStore } from '~/stores/session'
import { useToastStore } from '~/stores/toast'
import {
  NATIVE_ROLES,
  type AccessLevel,
  type CustomRole,
} from '~/types/organisation'

const props = defineProps<{ search: string }>()

const session = useSessionStore()
const toast   = useToastStore()
session.init()

const canManage = computed(() => session.canManageTeam)

// ── Lignes : natifs (constantes produit) puis customs (org active) ───────────
interface RoleRow {
  id:           string
  name:         string
  description?: string
  kind:         'natif' | 'custom'
  access?:      Record<string, AccessLevel>
}

const rows = computed<RoleRow[]>(() => [
  ...NATIVE_ROLES.map((n) => ({ id: n.id, name: n.label, description: n.description, kind: 'natif' as const })),
  ...session.customRoles.map((r) => ({ id: r.id, name: r.name, kind: 'custom' as const, access: r.access })),
])

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const filteredRows = computed(() => {
  const q = norm(props.search.trim())
  if (!q) return rows.value
  return rows.value.filter((r) => norm(r.name).includes(q) || (r.description && norm(r.description).includes(q)))
})

const columns = ['Rôle', 'Accès', 'Porteurs', 'Actions']
const gridClass = 'grid grid-cols-[minmax(0,2.2fr)_minmax(0,2.3fr)_minmax(0,0.9fr)_116px]'

function accessEntries(r: RoleRow) { return Object.entries(r.access ?? {}) as [string, AccessLevel][] }
function carrierLabel(roleId: string) {
  const n = session.roleCarrierCount(roleId)
  return n === 0 ? '—' : `${n} membre${n > 1 ? 's' : ''}`
}

// ── Création / édition (la création est déclenchée par la barre du parent) ───
const editing = ref<{ mode: 'add' | 'edit'; role?: CustomRole } | null>(null)
function openCreate() { editing.value = { mode: 'add' } }
function openEdit(roleId: string) {
  const role = session.customRoles.find((r) => r.id === roleId)
  if (role) editing.value = { mode: 'edit', role }
}
function onSaved(message: string) { toast.show({ title: message }); editing.value = null }

defineExpose({ openCreate })

// ── Suppression avec réaffectation obligatoire ───────────────────────────────
const deleteOpen   = ref(false)
const deleteTarget = ref<CustomRole | null>(null)
const reassignTo   = ref('')

const carrierCount = computed(() =>
  deleteTarget.value ? session.roleCarrierCount(deleteTarget.value.id) : 0,
)
// Destinations possibles : natifs (sauf Propriétaire, qui s'obtient par transfert)
// + les autres rôles custom.
const reassignOptions = computed(() => [
  ...NATIVE_ROLES.filter((r) => r.id !== 'proprietaire').map((r) => ({ value: r.id, label: r.label })),
  ...session.customRoles.filter((r) => r.id !== deleteTarget.value?.id).map((r) => ({ value: r.id, label: r.name })),
])

function askDelete(roleId: string) {
  const role = session.customRoles.find((r) => r.id === roleId)
  if (!role) return
  deleteTarget.value = role
  reassignTo.value   = ''
  deleteOpen.value   = true
}
function confirmDelete() {
  const t = deleteTarget.value
  if (!t) return
  const n = carrierCount.value
  if (n > 0 && !reassignTo.value) return
  const destination = n > 0 ? session.roleName(reassignTo.value) : ''
  session.deleteRole(t.id, n > 0 ? reassignTo.value : undefined)
  toast.show({
    title:       `Rôle « ${t.name} » supprimé.`,
    description: n > 0 ? `${n} membre${n > 1 ? 's' : ''} basculé${n > 1 ? 's' : ''} vers ${destination}.` : undefined,
  })
  deleteOpen.value   = false
  deleteTarget.value = null
}
</script>
