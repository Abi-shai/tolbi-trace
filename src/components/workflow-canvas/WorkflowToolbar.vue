<template>
  <div class="flex items-center justify-between px-5 py-3 border-b border-border bg-white shrink-0">
    <div class="flex items-center gap-3">
      <button
        @click="handleBackClick"
        class="flex items-center justify-center p-1.5 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-surface transition-colors"
      >
        <ArrowLeft :size="16" />
      </button>
      <div class="w-px h-5 bg-border" />
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-sm font-semibold text-text-primary leading-5">{{ displayName }}</h1>
          <Badge :variant="STATUS_BADGE_VARIANT[status]">{{ STATUS_LABELS[status] }}</Badge>
        </div>
        <p class="text-xs text-text-tertiary leading-4">
          {{ count }} étape{{ count > 1 ? 's' : '' }}
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <Button v-if="status === 'active'" variant="secondary" :icon="Share2" size="sm" @click="builder.openSharePanel()">
        Partager
      </Button>

      <Button v-if="status === 'draft'" variant="primary" :icon="Rocket" size="sm" @click="showPublishModal = true">
        Publier
      </Button>

      <Button variant="secondary" :icon="Pencil" size="sm" @click="builder.openSettings()">
        Modifier
      </Button>

      <Button
        :variant="builder.hasUnsavedChanges ? 'primary' : 'secondary'"
        :icon="builder.hasUnsavedChanges ? undefined : Check"
        size="sm"
        @click="builder.markSaved()"
        :disabled="!builder.hasUnsavedChanges"
      >
        {{ builder.hasUnsavedChanges ? 'Enregistrer' : 'Enregistré' }}
      </Button>
    </div>
  </div>

  <UnsavedChangesModal
    v-if="showUnsavedModal"
    @save="handleSaveAndLeave"
    @discard="router.push('/workflows')"
    @cancel="showUnsavedModal = false"
  />

  <PublishConfirmModal
    v-if="showPublishModal"
    @confirm="handlePublishConfirm"
    @cancel="showPublishModal = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Check, Pencil, Share2, Rocket } from 'lucide-vue-next'
import { useWorkflowBuilderStore } from '~/stores/workflow-builder'
import { useWorkflowsStore } from '~/stores/workflows'
import UnsavedChangesModal from './UnsavedChangesModal.vue'
import PublishConfirmModal from './PublishConfirmModal.vue'
import Button from '~/components/ui/Button.vue'
import Badge from '~/components/ui/Badge.vue'
import type { WorkflowStatus } from '~/types/workflow'

const STATUS_BADGE_VARIANT: Record<WorkflowStatus, 'success' | 'neutral'> = {
  active: 'success',
  draft:  'neutral',
}

const STATUS_LABELS: Record<WorkflowStatus, string> = {
  active: 'Actif',
  draft:  'Brouillon',
}

const props = defineProps<{
  workflowId:   string
  workflowName: string
  description:  string
  status:       WorkflowStatus
  stepCount:    number
}>()

const router  = useRouter()
const builder = useWorkflowBuilderStore()
const wfStore = useWorkflowsStore()

const showUnsavedModal = ref(false)
const showPublishModal = ref(false)

onMounted(() => builder.initWorkflowMeta(props.workflowName, props.description))

const count       = computed(() => builder.steps.length > 0 ? builder.steps.length : props.stepCount)
const displayName = computed(() => builder.workflowName || props.workflowName)

function handleBackClick() {
  if (builder.hasUnsavedChanges) {
    showUnsavedModal.value = true
  } else {
    router.push('/workflows')
  }
}

function handleSaveAndLeave() {
  builder.markSaved()
  router.push('/workflows')
}

function handlePublishConfirm() {
  wfStore.publishWorkflow(props.workflowId)
  showPublishModal.value = false
}
</script>
