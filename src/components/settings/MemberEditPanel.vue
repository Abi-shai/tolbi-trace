<template>
  <!-- Panneau latéral (Figma node 1069) : ajout / édition d'un membre.
       Prénom+nom, email, puis picker d'accès par module. Même coquille pour un
       futur Agent (email → téléphone + code à 4 chiffres) — cf. Sprint 18. -->
  <SlideOverPanel
    ref="panel"
    :title="mode === 'add' ? 'Ajouter un membre' : 'Modifier les informations'"
    :supporting-text="mode === 'add'
      ? 'Invite une personne dans ton organisation et choisis ses accès aux modules.'
      : 'Mets à jour les informations et les accès de ce membre.'"
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

    <div class="flex flex-col gap-3">
      <div>
        <h3 class="text-base font-semibold text-text-primary">Choisis les autorisations</h3>
        <p class="mt-0.5 text-sm text-text-tertiary">
          Choisis les modules et le niveau d'accès de ce membre.
        </p>
      </div>
      <ModuleAccessPicker v-model="access" :enabled-modules="enabledModules" />
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
import type { Membre, ModuleAccess } from '~/types/organisation'

const props = defineProps<{ mode: 'add' | 'edit'; membre?: Membre }>()
const emit  = defineEmits<{ close: []; saved: [string] }>()

const session = useSessionStore()

const panel = ref<{ close: () => void } | null>(null)

const enabledModules = computed(() => session.activeOrg?.enabledModules ?? [])

const name   = ref(props.membre ? `${props.membre.prenom} ${props.membre.nom}`.trim() : '')
const email  = ref(props.membre?.email ?? '')
const access = ref<ModuleAccess>({ ...(props.membre?.access ?? {}) })

const valid = computed(() => name.value.trim() !== '' && /.+@.+\..+/.test(email.value))

function splitName(full: string) {
  const parts = full.trim().split(/\s+/)
  const nom = parts.length > 1 ? parts.pop()! : ''
  return { prenom: parts.join(' '), nom }
}

function save() {
  if (!valid.value) return
  const { prenom, nom } = splitName(name.value)
  const payload = { prenom, nom, email: email.value.trim(), access: { ...access.value } }

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
