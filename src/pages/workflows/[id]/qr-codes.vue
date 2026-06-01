<template>
  <div v-if="!workflow" class="flex flex-col flex-1 items-center justify-center">
    <p class="text-sm text-text-muted">Processus introuvable.</p>
  </div>
  <QRCodesClient v-else :initial-codes="codes" :workflow-id="id" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import QRCodesClient from '~/components/qr-codes/QRCodesClient.vue'
import { useWorkflowsStore } from '~/stores/workflows'
import { qrCodes } from '~/data/qr-codes'

definePageMeta({ layout: 'app' })

const route = useRoute()
const store = useWorkflowsStore()
const id    = computed(() => route.params.id as string)

store.init()

const workflow = computed(() => store.workflows.find((w) => w.id === id.value))
const codes    = computed(() => qrCodes.filter((c) => c.workflowId === id.value))
</script>
