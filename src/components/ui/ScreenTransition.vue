<template>
  <Teleport to="body">
    <Transition name="fullscreen-overlay">
      <div v-if="show" class="fixed inset-0 bg-white flex items-center justify-center" :style="{ zIndex }">
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ show: boolean; zIndex?: number }>(), { zIndex: 9991 })
</script>

<style scoped>
/* Entrée : glisse depuis le bas */
.fullscreen-overlay-enter-active {
  transition: transform 0.42s cubic-bezier(0.16, 1, 0.3, 1);
}
.fullscreen-overlay-enter-from {
  transform: translateY(100%);
}

/* Sortie : glisse vers le haut */
.fullscreen-overlay-leave-active {
  transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
}
.fullscreen-overlay-leave-to {
  transform: translateY(-100%);
}
</style>
