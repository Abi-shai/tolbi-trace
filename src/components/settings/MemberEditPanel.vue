<template>
  <!-- Panneau latéral (Figma node 1069) : ajout / édition d'un collaborateur.
       Prénom+nom, email, puis le RÔLE — obligatoire, seule source d'accès du
       membre (ADR-0014). Propriétaire n'est pas attribuable (transfert only). -->
  <SlideOverPanel
    ref="panel"
    :title="mode === 'add' ? 'Ajouter un membre' : 'Modifier les informations'"
    :supporting-text="mode === 'add'
      ? 'Invite une personne dans ton organisation et choisis son rôle.'
      : 'Mets à jour les informations et le rôle de ce membre.'"
    :width="480"
    @close="emit('close')"
  >
    <template #icon>
      <DsIcon :name="mode === 'add' ? 'user-plus-01' : 'edit-01'" :size="20" />
    </template>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-text-secondary">Prénom et nom</label>
      <DsInputField v-model="name" placeholder="Awa Ndiaye" />
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-text-secondary">
        Adresse email
        <span v-if="mode === 'edit'" class="font-normal text-text-tertiary">(identifiant de connexion)</span>
      </label>
      <!-- L'email est l'identifiant de connexion : on le fixe à l'invitation, il
           n'est plus modifiable ensuite (cf. panneau Figma « Modifier », champ grisé). -->
      <DsInputField
        v-model="email"
        type="email"
        placeholder="awa@exemple.sn"
        :disabled="mode === 'edit'"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-text-secondary">Rôle</label>
      <DsInputDropdown v-model="roleId" :options="roleOptions" placeholder="Choisis un rôle" />
      <!-- Aperçu du rôle choisi : description (natif) ou accès portés (custom). -->
      <div v-if="selectedNative" class="rounded-lg bg-surface px-3.5 py-3 text-sm text-text-tertiary">
        {{ selectedNative.description }}
      </div>
      <div v-else-if="selectedCustom" class="flex flex-wrap items-center gap-1 rounded-lg bg-surface px-3.5 py-3">
        <template v-if="customEntries.length">
          <AccessBadge v-for="[modId, lvl] in customEntries" :key="modId" :module-id="modId" :level="lvl" />
        </template>
        <span v-else class="text-sm text-text-tertiary">Ce rôle ne donne accès à aucun module pour l'instant.</span>
      </div>
    </div>

    <template #footer="{ close }">
      <DsButton label="Annuler" variant="secondary-gray" size="md" @click="close" />
      <DsButton
        :label="mode === 'add' ? 'Envoyer l\'invitation' : 'Enregistrer les modifications'"
        variant="primary"
        size="md"
        :icon-leading="mode === 'add' ? 'send-01' : undefined"
        :disabled="!valid"
        @click="save"
      />
    </template>
  </SlideOverPanel>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SlideOverPanel from '~/components/ui/SlideOverPanel.vue'
import { useSessionStore } from '~/stores/session'
import {
  NATIVE_ROLES,
  NATIVE_ROLE_BY_ID,
  isNativeRoleId,
  type AccessLevel,
  type Membre,
} from '~/types/organisation'

const props = defineProps<{ mode: 'add' | 'edit'; membre?: Membre }>()
const emit  = defineEmits<{ close: []; saved: [string] }>()

const session = useSessionStore()

const panel = ref<{ close: () => void } | null>(null)

const name   = ref(props.membre ? `${props.membre.prenom} ${props.membre.nom}`.trim() : '')
const email  = ref(props.membre?.email ?? '')
const roleId = ref(props.membre?.roleId ?? '')

// Rôles attribuables : natifs sauf Propriétaire (unique, s'obtient par transfert)
// + les rôles custom de l'org.
const roleOptions = computed(() => [
  ...NATIVE_ROLES.filter((r) => r.id !== 'proprietaire').map((r) => ({ value: r.id, label: r.label })),
  ...session.customRoles.map((r) => ({ value: r.id, label: r.name })),
])

const selectedNative = computed(() =>
  isNativeRoleId(roleId.value) ? NATIVE_ROLE_BY_ID[roleId.value] : null,
)
const selectedCustom = computed(() =>
  session.customRoles.find((r) => r.id === roleId.value) ?? null,
)
const customEntries = computed(() =>
  Object.entries(selectedCustom.value?.access ?? {}) as [string, AccessLevel][],
)

// Le rôle est requis : pas d'état « membre sans rôle » (ADR-0014).
const valid = computed(() => name.value.trim() !== '' && /.+@.+\..+/.test(email.value) && roleId.value !== '')

function splitName(full: string) {
  const parts = full.trim().split(/\s+/)
  const nom = parts.length > 1 ? parts.pop()! : ''
  return { prenom: parts.join(' '), nom }
}

function save() {
  if (!valid.value) return
  const { prenom, nom } = splitName(name.value)
  const payload = { prenom, nom, email: email.value.trim(), roleId: roleId.value }

  if (props.mode === 'add') {
    session.inviteMembre(payload)
    emit('saved', `Invitation envoyée à ${payload.email}.`)
  } else if (props.membre) {
    session.updateMembre(props.membre.id, payload)
    emit('saved', `${prenom || 'Le membre'} a été mis à jour.`)
  }
  panel.value?.close()
}
</script>
