<template>
  <SlideOverPanel
    ref="panel"
    :title="title"
    :supporting-text="supportingText"
    @close="$emit('close')"
  >
    <template #icon>
      <component :is="isEdit ? UserCog : UserPlus" :size="20" />
    </template>

    <DsInputField
      label="Nom complet"
      type="text"
      v-model="name"
      @keydown.enter="handleSubmit"
      placeholder="Ex. Ousseynou Ndiaye"
    />

    <DsInputField
      label="Téléphone (optionnel)"
      hint="Requis pour le partage WhatsApp"
      type="tel"
      v-model="phone"
      placeholder="+221 77 000 00 00"
    />

    <template #footer="{ close }">
      <DsButton label="Annuler" variant="secondary-gray" @click="close" />
      <DsButton
        :label="submitLabel"
        variant="primary"
        :loading="submitting"
        :disabled="!name.trim()"
        @click="handleSubmit"
      />
    </template>
  </SlideOverPanel>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { UserPlus, UserCog } from 'lucide-vue-next'
import SlideOverPanel from '~/components/ui/SlideOverPanel.vue'
import { useDataosAgentsStore } from '~/stores/dataos-agents'
import type { DataosAgent } from '~/types/dataos-agent'

const props = defineProps<{ formulaireId: string; agent?: DataosAgent }>()
const emit  = defineEmits<{ close: []; created: [agent: DataosAgent] }>()

const agentsStore = useDataosAgentsStore()
const panel  = ref<InstanceType<typeof SlideOverPanel> | null>(null)
const isEdit = computed(() => !!props.agent)

const title = computed(() => (isEdit.value ? "Modifier l'agent" : 'Ajouter un agent'))
const supportingText = computed(() =>
  isEdit.value
    ? "Mets à jour les informations de l'agent."
    : "Renseigne les informations de l'agent terrain à assigner à ce formulaire. Un code PIN lui sera attribué automatiquement.",
)
const submitLabel = computed(() => (isEdit.value ? 'Enregistrer' : "Ajouter l'agent"))

const name  = ref(props.agent?.name ?? '')
const phone = ref(props.agent?.phone ?? '')

const submitting = ref(false)
let submitTimer: ReturnType<typeof setTimeout>

function handleSubmit() {
  if (!name.value.trim() || submitting.value) return
  submitting.value = true
  submitTimer = setTimeout(() => {
    const input = {
      name: name.value.trim(),
      phone: phone.value.trim() || undefined,
    }
    if (props.agent) {
      agentsStore.updateAgent(props.agent.id, input)
    } else {
      const agent = agentsStore.addAgent(props.formulaireId, input)
      emit('created', agent)
    }
    panel.value?.close()
  }, 600)
}

onBeforeUnmount(() => clearTimeout(submitTimer))
</script>
