<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-modal-overlay/70 backdrop-blur-sm" @click="$emit('cancel')" />

      <div class="relative bg-white rounded-xl w-full max-w-[480px] overflow-hidden shadow-lg">
        <div class="px-6 pt-6 pb-5 relative">
          <div class="pr-8">
            <h2 class="text-lg font-semibold text-text-primary leading-7">
              Modifications non enregistrées
            </h2>
            <p class="text-sm text-text-tertiary leading-5 mt-1">
              Vous avez des modifications non enregistrées. Voulez-vous les enregistrer avant de quitter ?
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
          <Button variant="secondary" @click="$emit('discard')">
            Quitter sans enregistrer
          </Button>
          <Button variant="primary" @click="$emit('save')">
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import Button from '~/components/ui/Button.vue'

defineEmits<{
  save:    []
  discard: []
  cancel:  []
}>()
</script>
