<template>
  <AgentsClient :workflow-id="id" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AgentsClient from '~/components/workflow-agents/AgentsClient.vue'

definePageMeta({ layout: 'app' })

const route = useRoute()
const id    = computed(() => route.params.id as string)
</script>
