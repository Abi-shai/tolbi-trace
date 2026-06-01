<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
    <Header title="Tableau de bord" :description="`${workflowName} · ${workflowProject}`" />

    <main class="flex-1 overflow-y-auto px-6 py-6 space-y-4">
      <ProcessStepper />

      <div class="grid grid-cols-3 gap-4 items-start">
        <div class="col-span-2">
          <CampaignEntriesCard />
        </div>
        <div class="col-span-1">
          <AgentsNowCard :agents="activeAgents" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Header from '~/components/layout/Header.vue'
import ProcessStepper from './ProcessStepper.vue'
import CampaignEntriesCard from './CampaignEntriesCard.vue'
import AgentsNowCard from './AgentsNowCard.vue'
import { activeAgents } from '~/data/dashboard'

defineProps<{
  workflowName:    string
  workflowProject: string
}>()
</script>
