<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-modal-overlay/70 backdrop-blur-sm" @click="$emit('cancel')" />

      <div class="relative bg-white rounded-xl w-full max-w-[480px] overflow-hidden shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)]">
        <div class="px-6 pt-6 pb-5 relative">
          <div class="pr-8">
            <h2 class="text-[18px] font-semibold text-text-primary leading-7">
              Publier le processus
            </h2>
            <p class="text-sm text-text-tertiary leading-5 mt-1">
              Une fois publié, ce processus sera visible et accessible aux agents sur l'application mobile. Vous pourrez le repasser en brouillon à tout moment.
            </p>
          </div>
          <button
            @click="$emit('cancel')"
            class="absolute top-3 right-3 flex items-center justify-center w-11 h-11 rounded-lg text-text-tertiary hover:bg-surface transition-colors"
          >
            <X :size="20" />
          </button>
        </div>

        <div class="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <Button variant="secondary" @click="$emit('cancel')">Annuler</Button>
          <Button variant="primary" @click="$emit('confirm')">Publier</Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import Button from '~/components/ui/Button.vue'

defineEmits<{
  confirm: []
  cancel:  []
}>()
</script>
