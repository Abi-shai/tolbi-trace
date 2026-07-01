<script setup lang="ts">
import { computed } from 'vue'

definePageMeta({ layout: 'dataos' })

const route  = useRoute()
const formId = computed(() => String(route.params.formId ?? ''))
</script>

<template>
  <FormAgentsClient :formulaire-id="formId" />
</template>
