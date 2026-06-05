<template>
  <div v-if="!workflow" class="flex flex-col flex-1 items-center justify-center">
    <p class="text-sm text-text-quaternary">Processus introuvable.</p>
  </div>
  <GraphPageClient v-else :nodes="graphNodes" :edges="graphEdges" :workflow-id="String(route.params.id)" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GraphPageClient from '~/components/graph/GraphPageClient.vue'
import { useWorkflowsStore } from '~/stores/workflows'
import { graphNodes, graphEdges } from '~/data/graph'

definePageMeta({ layout: 'app' })

const route = useRoute()
const store = useWorkflowsStore()
store.init()

const workflow = computed(() => store.workflows.find((w) => w.id === route.params.id))
</script>
