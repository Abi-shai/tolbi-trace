<template>
  <div class="group relative h-[72px] bg-white border border-[#eaecf0] rounded-xl overflow-hidden w-full shrink-0">

    <!-- Progress fill -->
    <div
      v-if="progress < 100"
      class="absolute top-[-1px] bottom-[-1px] left-[-1px] bg-[#f2f4f7] transition-[right] duration-200 ease-out"
      :style="{ right: `calc(${100 - progress}%)` }"
    />

    <!-- Content -->
    <div
      class="absolute flex gap-3 items-center top-[15px] left-[15px]"
      :class="progress < 100 ? 'right-[55px]' : 'right-[47px]'"
    >
      <slot name="icon" />
      <div class="flex-1 min-w-0 flex flex-col gap-0">
        <p class="text-sm font-medium text-text-secondary leading-5 truncate">{{ name }}</p>
        <p class="text-sm text-text-tertiary leading-5 truncate">{{ formattedSize }} – {{ progress }}% chargé</p>
      </div>
    </div>

    <!-- Right: spinner ou poubelle -->
    <div class="absolute right-[15px] top-1/2 -translate-y-1/2">
      <div v-if="progress < 100" class="spinner" />
      <button
        v-else
        class="p-1.5 rounded-md text-[#d92d20] hover:bg-[#fff1f0] transition-all duration-150 opacity-0 group-hover:opacity-100"
        @click="$emit('remove')"
      >
        <Trash2 :size="18" />
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Trash2 } from 'lucide-vue-next'

const props = defineProps<{ name: string; size: number; progress: number }>()
defineEmits<{ remove: [] }>()

const formattedSize = computed(() => {
  if (props.size < 1024)        return `${props.size} B`
  if (props.size < 1024 * 1024) return `${Math.round(props.size / 1024)} KB`
  return `${(props.size / (1024 * 1024)).toFixed(1)} MB`
})
</script>

<style scoped>
.spinner {
  width: 28px;
  height: 28px;
  border: 2.5px solid #eaecf0;
  border-top-color: var(--ds-semantic-fg-brand-primary, #056033);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
