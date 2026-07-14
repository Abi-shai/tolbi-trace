<template>
  <!-- Création / édition d'un rôle custom (ADR-0014) : un NOM + les accès aux
       modules (Lecteur/Éditeur) — rien d'autre, jamais de pouvoir d'organisation.
       Éditer un rôle s'applique immédiatement à tous ses porteurs. -->
  <SlideOverPanel
    ref="panel"
    :title="mode === 'add' ? 'Créer un rôle' : 'Modifier le rôle'"
    :supporting-text="mode === 'add'
      ? 'Nomme le rôle et choisis les accès aux modules qu\'il donne.'
      : carrierNote"
    :width="480"
    @close="emit('close')"
  >
    <template #icon>
      <DsIcon :name="mode === 'add' ? 'plus' : 'edit-01'" :size="20" />
    </template>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-text-secondary">Nom du rôle</label>
      <DsInputField v-model="name" placeholder="Responsable qualité" />
    </div>

    <div class="flex flex-col gap-3">
      <div>
        <h3 class="text-base font-semibold text-text-primary">Accès aux modules</h3>
        <p class="mt-0.5 text-sm text-text-tertiary">
          Choisis les modules et le niveau d'accès que ce rôle donne à ses porteurs.
        </p>
      </div>
      <ModuleAccessPicker v-model="access" :enabled-modules="enabledModules" />
    </div>

    <template #footer="{ close }">
      <DsButton label="Annuler" variant="secondary-gray" size="md" @click="close" />
      <DsButton
        :label="mode === 'add' ? 'Créer le rôle' : 'Enregistrer'"
        variant="primary"
        size="md"
        :icon-leading="mode === 'add' ? 'plus' : undefined"
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
import type { CustomRole, ModuleAccess } from '~/types/organisation'

const props = defineProps<{ mode: 'add' | 'edit'; role?: CustomRole }>()
const emit  = defineEmits<{ close: []; saved: [string] }>()

const session = useSessionStore()
const panel   = ref<{ close: () => void } | null>(null)

const enabledModules = computed(() => session.activeOrg?.enabledModules ?? [])

const name   = ref(props.role?.name ?? '')
const access = ref<ModuleAccess>({ ...(props.role?.access ?? {}) })

// Un rôle sans aucun accès ne servirait à rien : nom + au moins un module.
const valid = computed(() => name.value.trim() !== '' && Object.keys(access.value).length > 0)

const carrierNote = computed(() => {
  const n = props.role ? session.roleCarrierCount(props.role.id) : 0
  return n > 0
    ? `Tes changements s'appliqueront immédiatement aux ${n} membre${n > 1 ? 's' : ''} qui porte${n > 1 ? 'nt' : ''} ce rôle.`
    : 'Aucun membre ne porte encore ce rôle.'
})

function save() {
  if (!valid.value) return
  const payload = { name: name.value.trim(), access: { ...access.value } }

  if (props.mode === 'add') {
    session.createRole(payload)
    emit('saved', `Rôle « ${payload.name} » créé.`)
  } else if (props.role) {
    session.updateRole(props.role.id, payload)
    emit('saved', `Rôle « ${payload.name} » mis à jour.`)
  }
  panel.value?.close()
}
</script>
