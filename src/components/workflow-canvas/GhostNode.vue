<template>
  <div class="flex flex-col items-center gap-3 w-[300px]">
    <Handle type="target" :position="Position.Top" class="!opacity-0 !pointer-events-none" :style="{ width: 0, height: 0 }" />
    <Handle type="source" :position="Position.Bottom" class="!opacity-0 !pointer-events-none" :style="{ width: 0, height: 0 }" />

    <div class="relative group">
      <button
        @click="builder.addStep()"
        :class="cn(
          'flex items-center justify-center border-2 border-dashed rounded-xl transition-all',
          data.isEmpty
            ? 'w-[120px] h-[120px] border-border hover:border-primary hover:bg-brand-50/40'
            : 'w-[56px] h-[56px] border-border hover:border-primary hover:bg-brand-50/40',
        )"
      >
        <Plus :size="data.isEmpty ? 22 : 16" class="text-text-muted group-hover:text-primary transition-colors" />
      </button>

      <div
        v-if="!data.isEmpty"
        class="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
      >
        <div class="bg-overlay text-white text-xs font-semibold px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap">
          Ajouter une étape
        </div>
        <div class="mx-auto mt-0.5 h-0 w-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-overlay" />
      </div>
    </div>

    <span v-if="data.isEmpty" class="text-sm text-text-muted select-none pointer-events-none whitespace-nowrap">
      Ajouter une première étape…
    </span>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Plus } from 'lucide-vue-next'
import { cn } from '~/lib/utils'
import { useWorkflowBuilderStore } from '~/stores/workflow-builder'

defineProps<{
  data: { isEmpty: boolean }
}>()

const builder = useWorkflowBuilderStore()
</script>
