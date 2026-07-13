<template>
  <!-- Panneau ajout / édition d'un agent (Sprint 18 / ADR-0014). L'identifiant est
       le TÉLÉPHONE. On NE configure PAS de code : l'agent crée son code à 4 chiffres
       lui-même à sa première connexion sur l'app mobile (code personnel).
       Les accès aux modules sont BINAIRES (porte mobile, sans niveau) — l'affecter
       à un travail (formulaire, étape) exige le grant du module correspondant. -->
  <SlideOverPanel
    ref="panel"
    :title="mode === 'add' ? 'Ajouter un agent' : 'Modifier l\'agent'"
    :supporting-text="mode === 'add'
      ? 'L\'agent se connecte à l\'app mobile avec son numéro de téléphone.'
      : 'Mets à jour les informations et les accès de cet agent.'"
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

    <div class="flex flex-col gap-3">
      <div>
        <h3 class="text-base font-semibold text-text-primary">Accès aux modules</h3>
        <p class="mt-0.5 text-sm text-text-tertiary">
          L'agent ne peut travailler que dans les modules cochés — on ne peut
          l'affecter qu'à du travail de ces modules.
        </p>
      </div>
      <div class="flex flex-col gap-1">
        <button
          v-for="m in availableModules"
          :key="m.id"
          type="button"
          class="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface"
          :class="selectedModules.has(m.id) && 'bg-surface'"
          @click="toggleModule(m.id)"
        >
          <DsCheckbox :model-value="selectedModules.has(m.id)" size="sm" visual-only />
          <DsModuleIcon :module="m.moduleIcon" :size="24" class="shrink-0" />
          <span class="flex-1 truncate text-sm font-semibold text-text-secondary">{{ m.name }}</span>
        </button>
      </div>
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
import { MODULES } from '~/data/modules'
import type { OrgAgent } from '~/types/organisation'

const props = defineProps<{ mode: 'add' | 'edit'; agent?: OrgAgent }>()
const emit  = defineEmits<{ close: []; saved: [string] }>()

const session = useSessionStore()
const panel   = ref<{ close: () => void } | null>(null)

const name      = ref(props.agent ? `${props.agent.prenom} ${props.agent.nom}`.trim() : '')
const telephone = ref(props.agent?.telephone ?? '')
const selectedModules = ref<Set<string>>(new Set(props.agent?.modules ?? []))

// Seuls les modules de l'offre de l'org sont proposables.
const availableModules = computed(() => {
  const enabled = session.activeOrg?.enabledModules ?? []
  return MODULES.filter((m) => enabled.includes(m.id))
})

const valid = computed(() => name.value.trim() !== '' && telephone.value.trim() !== '')

function toggleModule(id: string) {
  const next = new Set(selectedModules.value)
  next.has(id) ? next.delete(id) : next.add(id)
  selectedModules.value = next
}

function splitName(full: string) {
  const parts = full.trim().split(/\s+/)
  const nom = parts.length > 1 ? parts.pop()! : ''
  return { prenom: parts.join(' '), nom }
}

function save() {
  if (!valid.value) return
  const { prenom, nom } = splitName(name.value)
  const modules = [...selectedModules.value]

  if (props.mode === 'add') {
    session.inviteAgent({ prenom, nom, telephone: telephone.value, modules })
    emit('saved', `Agent ${prenom} ajouté.`)
  } else if (props.agent) {
    session.updateAgent(props.agent.id, { prenom, nom, telephone: telephone.value, modules })
    emit('saved', `${prenom || 'L\'agent'} a été mis à jour.`)
  }
  panel.value?.close()
}
</script>
