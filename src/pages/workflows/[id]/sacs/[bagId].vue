<template>
  <div v-if="!bag" class="flex flex-col flex-1 items-center justify-center">
    <p class="text-sm text-text-muted">QR code introuvable.</p>
  </div>
  <BagDetail v-else :bag="bag" :events="events" :workflow-id="workflowId" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BagDetail from '~/components/bags/BagDetail.vue'
import { qrCodes } from '~/data/qr-codes'
import { getBagEvents } from '~/data/bag-events'

definePageMeta({ layout: 'app' })

const route      = useRoute()
const workflowId = computed(() => route.params.id as string)
const bagId      = computed(() => route.params.bagId as string)

const bag    = computed(() => qrCodes.find((q) => q.id === bagId.value && q.workflowId === workflowId.value) ?? null)
const events = computed(() => bag.value ? getBagEvents(bag.value.id, bag.value.currentStep) : [])
</script>
