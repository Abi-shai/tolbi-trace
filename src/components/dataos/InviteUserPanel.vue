<template>
  <SlideOverPanel
    ref="panel"
    title="Inviter un utilisateur"
    supporting-text="Invite un collaborateur à accéder à ce projet."
    @close="$emit('close')"
  >
    <template #icon>
      <UserPlus :size="20" />
    </template>

    <DsInputField
      label="Adresse e-mail"
      type="email"
      v-model="email"
      @keydown.enter="handleSubmit"
      placeholder="nom@organisation.com"
    />

    <DsInputDropdown
      label="Rôle"
      v-model="role"
      :options="roleOptions"
      placeholder="Sélectionne un rôle"
    />

    <template #footer="{ close }">
      <DsButton label="Annuler" variant="secondary-gray" @click="close" />
      <DsButton
        label="Envoyer l'invitation"
        variant="primary"
        :loading="submitting"
        :disabled="!isValid"
        @click="handleSubmit"
      />
    </template>
  </SlideOverPanel>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { UserPlus } from 'lucide-vue-next'
import SlideOverPanel from '~/components/ui/SlideOverPanel.vue'
import type { MembreRole } from '~/types/dataos'

const emit = defineEmits<{
  submit: [email: string, role: MembreRole]
  close:  []
}>()

const panel      = ref<InstanceType<typeof SlideOverPanel> | null>(null)
const email      = ref('')
const role       = ref<MembreRole>('editeur')
const submitting = ref(false)
let submitTimer: ReturnType<typeof setTimeout>

const roleOptions = [
  { label: 'Lecteur', value: 'lecteur' },
  { label: 'Éditeur', value: 'editeur' },
  { label: 'Admin',   value: 'admin'   },
]

const isValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))

function handleSubmit() {
  if (!isValid.value || submitting.value) return
  submitting.value = true
  submitTimer = setTimeout(() => {
    emit('submit', email.value.trim(), role.value)
    panel.value?.close()
  }, 600)
}

onBeforeUnmount(() => clearTimeout(submitTimer))
</script>
