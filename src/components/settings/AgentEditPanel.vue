<template>
  <!-- Panneau ajout / édition d'un agent (Sprint 18). L'identifiant est le
       TÉLÉPHONE. On NE configure PAS de code : l'agent crée son code à 4 chiffres
       lui-même à sa première connexion sur l'app mobile (code personnel). -->
  <SlideOverPanel
    ref="panel"
    :title="mode === 'add' ? 'Ajouter un agent' : 'Modifier l\'agent'"
    :supporting-text="mode === 'add'
      ? 'L\'agent se connecte à l\'app mobile avec son numéro de téléphone.'
      : 'Mets à jour les informations de connexion de cet agent.'"
    :width="480"
    @close="emit('close')"
  >
    <template #icon>
      <DsIcon :name="mode === 'add' ? 'user-plus-01' : 'edit-01'" :size="20" />
    </template>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-text-secondary">Prénom et nom</label>
      <DsInputField v-model="name" placeholder="Mamadou Diallo" />
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-text-secondary">
        Téléphone <span class="font-normal text-text-tertiary">(identifiant de connexion)</span>
      </label>
      <!-- Le téléphone est l'identifiant de connexion : fixé à la création, non
           modifiable ensuite (même règle que l'email d'un collaborateur). -->
      <PhoneField v-model="telephone" :disabled="mode === 'edit'" />
    </div>

    <template #footer="{ close }">
      <DsButton label="Annuler" variant="secondary-gray" size="md" @click="close" />
      <DsButton
        :label="mode === 'add' ? 'Ajouter l\'agent' : 'Enregistrer'"
        variant="primary"
        size="md"
        :icon-leading="mode === 'add' ? 'user-plus-01' : undefined"
        :disabled="!valid"
        @click="save"
      />
    </template>
  </SlideOverPanel>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SlideOverPanel from '~/components/ui/SlideOverPanel.vue'
import PhoneField from '~/components/ui/PhoneField.vue'
import { useSessionStore } from '~/stores/session'
import type { OrgAgent } from '~/types/organisation'

const props = defineProps<{ mode: 'add' | 'edit'; agent?: OrgAgent }>()
const emit  = defineEmits<{ close: []; saved: [string] }>()

const session = useSessionStore()
const panel   = ref<{ close: () => void } | null>(null)

const name      = ref(props.agent ? `${props.agent.prenom} ${props.agent.nom}`.trim() : '')
const telephone = ref(props.agent?.telephone ?? '')

const valid = computed(() => name.value.trim() !== '' && telephone.value.trim() !== '')

function splitName(full: string) {
  const parts = full.trim().split(/\s+/)
  const nom = parts.length > 1 ? parts.pop()! : ''
  return { prenom: parts.join(' '), nom }
}

function save() {
  if (!valid.value) return
  const { prenom, nom } = splitName(name.value)

  if (props.mode === 'add') {
    session.inviteAgent({ prenom, nom, telephone: telephone.value })
    emit('saved', `Agent ${prenom} ajouté.`)
  } else if (props.agent) {
    session.updateAgent(props.agent.id, { prenom, nom, telephone: telephone.value })
    emit('saved', `${prenom || 'L\'agent'} a été mis à jour.`)
  }
  panel.value?.close()
}
</script>
