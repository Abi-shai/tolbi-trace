<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <Topbar />
    <div class="flex flex-1 min-h-0 overflow-hidden">
      <Sidebar />
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden bg-surface">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Topbar from '~/components/layout/Topbar.vue'
import Sidebar from '~/components/layout/Sidebar.vue'
</script>
