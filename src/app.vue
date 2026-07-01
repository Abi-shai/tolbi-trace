<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ScreenTransition :show="uiStore.moduleTransition">
    <img :src="tolbiLogoAnimation" alt="" class="size-[150px] object-contain pointer-events-none" />
  </ScreenTransition>
  <ToastHost />
  <DebugPanel v-if="scenario.enabled" />
</template>

<script setup lang="ts">
import { useScenarioStore } from '~/stores/scenario'
import { useUIStore } from '~/stores/ui'
import ToastHost from '~/components/ui/ToastHost.vue'
import DebugPanel from '~/components/debug/DebugPanel.vue'
import tolbiLogoAnimation from '~/assets/images/tolbi-logo-animation.gif'

const scenario = useScenarioStore()
const uiStore  = useUIStore()
</script>
