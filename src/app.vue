<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <DebugPanel v-if="scenario.enabled" />
</template>

<script setup lang="ts">
import { useScenarioStore } from '~/stores/scenario'
import DebugPanel from '~/components/debug/DebugPanel.vue'

const scenario = useScenarioStore()
</script>
