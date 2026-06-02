<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-modal-overlay/70 backdrop-blur-sm" @click="$emit('cancel')" />

      <div class="relative bg-white rounded-xl w-full max-w-[480px] overflow-hidden shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)]">
        <div class="px-6 pt-6 pb-5 relative">
          <div class="pr-8">
            <h2 class="text-[18px] font-semibold text-text-primary leading-7">Publier le processus</h2>
            <p class="text-sm text-text-tertiary leading-5 mt-1">
              Une fois publié, ce processus sera visible et accessible aux agents sur l'application mobile. Vous pourrez le repasser en brouillon à tout moment.
            </p>
          </div>
          <DsCloseButton @click="$emit('cancel')" size="md" class="absolute top-3 right-3" />
        </div>

        <div class="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <DsButton label="Annuler" variant="secondary-gray" @click="$emit('cancel')" />
          <DsButton label="Publier" variant="primary" @click="$emit('confirm')" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineEmits<{
  confirm: []
  cancel:  []
}>()
</script>
