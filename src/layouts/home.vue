<template>
  <!-- Shell cross-module (Accueil + Paramètres) : topbar + sidebar Accueil. -->
  <div class="flex flex-col h-screen">
    <Topbar />
    <div class="flex flex-1 min-h-0 overflow-hidden">
      <HomeSidebar />
      <div class="flex flex-col flex-1 min-w-0 overflow-y-auto bg-surface">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Topbar from '~/components/layout/Topbar.vue'
import HomeSidebar from '~/components/layout/HomeSidebar.vue'
</script>
