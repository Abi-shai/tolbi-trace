<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
    <Header title="Processus" description="Créez et gérez vos processus de traçabilité terrain.">
      <template #actions>
        <DsButton label="Nouveau processus" icon-leading="plus" variant="primary" @click="panelOpen = true" />
      </template>
    </Header>

    <main class="flex-1 overflow-y-auto px-6 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <WorkflowCard v-for="workflow in store.workflows" :key="workflow.id" :workflow="workflow" />
      </div>
    </main>

    <Transition name="slide-panel">
      <NewWorkflowPanel
        v-if="panelOpen"
        @create="handleCreate"
        @close="panelOpen = false"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkflowsStore } from '~/stores/workflows'
import Header from '~/components/layout/Header.vue'
import WorkflowCard from './WorkflowCard.vue'
import NewWorkflowPanel from './NewWorkflowPanel.vue'

const router    = useRouter()
const store     = useWorkflowsStore()
const panelOpen = ref(false)

store.init()

function handleCreate(name: string, description: string) {
  const id = store.createWorkflow(name, description)
  panelOpen.value = false
  router.push(`/source/workflows/${id}`)
}
</script>
