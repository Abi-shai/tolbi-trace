<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center px-4">

        <div
          class="absolute inset-0 bg-modal-overlay/70 backdrop-blur-sm"
          @click="$emit('update:modelValue', false)"
        />

        <div
          class="relative bg-white rounded-xl w-full overflow-hidden shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)]"
          :class="sizes[size ?? 'md']"
        >
          <!-- Header -->
          <div class="px-6 pt-6 relative" :class="$slots.icon ? 'pb-0' : 'pb-5'">

            <!-- Layout horizontal (avec icône) -->
            <div v-if="$slots.icon" class="flex gap-4 items-start pr-8">
              <slot name="icon" />
              <div class="flex-1 min-w-0">
                <p class="text-[18px] font-semibold text-text-primary leading-7">{{ title }}</p>
                <p v-if="description" class="text-sm text-text-secondary leading-5 mt-1">{{ description }}</p>
              </div>
            </div>

            <!-- Layout vertical (sans icône) -->
            <div v-else class="pr-8">
              <p class="text-[18px] font-semibold text-text-primary leading-7">{{ title }}</p>
              <p v-if="description" class="text-sm text-text-tertiary leading-5 mt-1">{{ description }}</p>
            </div>

            <slot />

            <DsCloseButton
              size="md"
              class="absolute top-3 right-3"
              @click="$emit('update:modelValue', false)"
            />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="flex items-center justify-end gap-3 px-6"
            :class="$slots.icon ? 'pt-8 pb-6' : 'border-t border-border py-4'"
          >
            <slot name="footer" />
          </div>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modelValue:   boolean
  title:        string
  description?: string
  size?:        'sm' | 'md' | 'lg'
}>()

defineEmits<{ 'update:modelValue': [value: boolean] }>()

const sizes = {
  sm: 'max-w-[380px]',
  md: 'max-w-[480px]',
  lg: 'max-w-[544px]',
}
</script>

<style scoped>
.modal-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.modal-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.97); }
</style>
