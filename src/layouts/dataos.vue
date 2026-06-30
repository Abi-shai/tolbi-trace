<template>
  <div class="flex flex-col h-screen">
    <Topbar />
    <div class="flex flex-1 min-h-0 overflow-hidden">
      <!-- Sidebar double (projet + formulaires) dans l'éditeur de formulaire ;
           sidebar simple (Projets) partout ailleurs dans Data OS. -->
      <component :is="inFormulaire ? DataOsSidebar : DataOsSidebarSingle" />
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden bg-surface">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Topbar             from '~/components/layout/Topbar.vue'
import DataOsSidebar       from '~/components/dataos/DataOsSidebar.vue'
import DataOsSidebarSingle from '~/components/dataos/DataOsSidebarSingle.vue'

const route = useRoute()
const inFormulaire = computed(() => route.path.includes('/formulaires/'))
</script>
