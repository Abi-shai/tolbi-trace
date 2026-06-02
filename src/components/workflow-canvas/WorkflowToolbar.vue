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
          <DsBadge :color="STATUS_BADGE_COLOR[status]" :label="STATUS_LABELS[status]" size="sm" />
        </div>
        <p class="text-xs text-text-tertiary leading-4">
          {{ count }} étape{{ count > 1 ? 's' : '' }}
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <DsButton
        v-if="status === 'active'"
        label="Partager"
        variant="secondary-gray"
        size="sm"
        @click="builder.openSharePanel()"
      />

      <DsButton
        v-if="status === 'draft'"
        label="Publier"
        variant="primary"
        size="sm"
        @click="showPublishModal = true"
      />

      <DsButton
        label="Modifier"
        icon-leading="edit-01"
        variant="secondary-gray"
        size="sm"
        @click="builder.openSettings()"
      />

      <DsButton
        :variant="builder.hasUnsavedChanges ? 'primary' : 'secondary-gray'"
        :icon-leading="builder.hasUnsavedChanges ? undefined : 'check'"
        :label="builder.hasUnsavedChanges ? 'Enregistrer' : 'Enregistré'"
        size="sm"
        :disabled="!builder.hasUnsavedChanges"
        @click="builder.markSaved()"
      />
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
import { ArrowLeft } from 'lucide-vue-next'
import { useWorkflowBuilderStore } from '~/stores/workflow-builder'
import { useWorkflowsStore } from '~/stores/workflows'
import UnsavedChangesModal from './UnsavedChangesModal.vue'
import PublishConfirmModal from './PublishConfirmModal.vue'
import type { WorkflowStatus } from '~/types/workflow'

const STATUS_BADGE_COLOR: Record<WorkflowStatus, string> = {
  active: 'success',
  draft:  'gray',
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
