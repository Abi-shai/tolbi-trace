<template>
  <Teleport to="body">
    <Transition name="fade">
      <div class="fixed inset-0 z-40 bg-black/20" @click="$emit('close')" />
    </Transition>

    <Transition name="slide-panel">
      <aside
        class="fixed inset-y-0 right-0 z-50 w-[400px] bg-white border-l border-border-strong shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] flex flex-col overflow-hidden"
      >
        <!-- Header -->
        <div class="relative px-6 pt-6 pb-0 shrink-0 flex flex-col gap-4">
          <DsCloseButton @click="$emit('close')" class="absolute top-6 right-4" />

          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-center w-10 h-10 rounded-lg border border-border shadow-xs text-text-tertiary">
              <component :is="isEdit ? UserCog : UserPlus" :size="16" />
            </div>
            <div class="flex flex-col gap-1">
              <h2 class="text-xl font-semibold text-text-primary leading-[30px]">
                {{ isEdit ? "Modifier l'agent" : 'Ajouter un agent' }}
              </h2>
              <p class="text-sm text-text-tertiary leading-5">
                {{ isEdit
                  ? "Mets à jour les informations de l'agent."
                  : "Renseigne les informations de l'agent terrain à assigner à ce processus. Un code PIN lui sera attribué automatiquement." }}
              </p>
            </div>
          </div>

          <div class="h-px bg-border w-full" />
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6">
          <DsInputField
            label="Nom complet"
            type="text"
            v-model="name"
            @keydown.enter="handleSubmit"
            placeholder="Ex. Mamadou Diallo"
          />

          <DsInputField
            label="Rôle"
            hint="Optionnel"
            type="text"
            v-model="role"
            placeholder="Ex. Magasinier coopérative"
          />

          <DsInputField
            label="Téléphone"
            hint="Optionnel — requis pour le partage WhatsApp"
            type="tel"
            v-model="phone"
            placeholder="+221 77 000 00 00"
          />
        </div>

        <div class="px-6 py-4 border-t border-border shrink-0 flex items-center justify-end gap-3">
          <DsButton label="Annuler" variant="secondary-gray" @click="$emit('close')" />
          <DsButton
            :label="submitLabel"
            variant="primary"
            :disabled="!name.trim()"
            @click="handleSubmit"
          />
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UserPlus, UserCog } from 'lucide-vue-next'
import { useAgentsStore } from '~/stores/agents'
import type { Agent } from '~/types/agent'

const props = defineProps<{ workflowId: string; agent?: Agent }>()
const emit  = defineEmits<{ close: [] }>()

const agentsStore = useAgentsStore()
const isEdit = !!props.agent
const submitLabel = isEdit ? 'Enregistrer' : "Ajouter l'agent"
const name  = ref(props.agent?.name ?? '')
const role  = ref(props.agent?.role ?? '')
const phone = ref(props.agent?.phone ?? '')

function handleSubmit() {
  if (!name.value.trim()) return
  const input = {
    name: name.value.trim(),
    role: role.value.trim() || undefined,
    phone: phone.value.trim() || undefined,
  }
  if (props.agent) {
    agentsStore.updateAgent(props.agent.id, input)
  } else {
    agentsStore.addAgent(props.workflowId, input)
  }
  emit('close')
}
</script>
