<template>
  <div class="flex flex-col h-screen">
    <Topbar />
    <div class="flex flex-1 min-h-0 overflow-hidden">
      <DataOsSidebar />
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden bg-surface">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Topbar       from '~/components/layout/Topbar.vue'
import DataOsSidebar from '~/components/dataos/DataOsSidebar.vue'
</script>
