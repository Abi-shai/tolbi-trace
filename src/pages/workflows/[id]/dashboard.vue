<template>
  <div v-if="!workflow" class="flex flex-col flex-1 items-center justify-center">
    <p class="text-sm text-text-muted">Processus introuvable.</p>
  </div>
  <DashboardClient
    v-else
    :workflow-name="workflow.name"
    :workflow-project="workflow.project"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DashboardClient from '~/components/dashboard/DashboardClient.vue'
import { useWorkflowsStore } from '~/stores/workflows'

definePageMeta({ layout: 'app' })

const route = useRoute()
const store = useWorkflowsStore()
store.init()

const workflow = computed(() => store.workflows.find((w) => w.id === route.params.id))
</script>
