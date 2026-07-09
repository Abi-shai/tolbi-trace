<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-40 bg-black/20"
        @click="requestClose"
      />
    </Transition>

    <!-- Panneau : entre par la droite, sort vers la droite -->
    <Transition name="slide-panel" @after-leave="onAfterLeave">
      <aside
        v-if="visible"
        class="fixed inset-y-0 right-0 z-50 bg-white border-l border-border-strong shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] flex flex-col overflow-hidden"
        :style="{ width: `${width}px` }"
      >
        <!-- Header -->
        <div class="relative px-6 pt-6 pb-0 shrink-0 flex flex-col gap-4">
          <DsCloseButton @click="requestClose" class="absolute top-6 right-4" />

          <div class="flex flex-col gap-4">
            <div
              v-if="$slots.icon"
              :class="iconFrame ? 'flex items-center justify-center w-10 h-10 rounded-lg border border-border shadow-xs text-text-tertiary' : 'flex'"
            >
              <slot name="icon" />
            </div>
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center gap-3">
                <h2 class="text-xl font-semibold text-text-primary leading-[30px]">{{ title }}</h2>
                <slot name="title-trailing" />
              </div>
              <slot name="subtitle">
                <p v-if="supportingText" class="text-sm text-text-tertiary leading-5">{{ supportingText }}</p>
              </slot>
            </div>
          </div>

          <div class="h-px bg-border w-full" />
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6">
          <slot />
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="px-6 py-4 border-t border-border shrink-0 flex items-center justify-end gap-3">
          <slot name="footer" :close="requestClose" />
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  supportingText?: string
  width?: number
  /** Encadre l'icône d'en-tête dans une boîte bordée (featured icon).
      false = contenu brut, sans cadre (ex. avatar producteur). */
  iconFrame?: boolean
  /** Garde optionnelle : retourne false pour bloquer la fermeture
      (ex. changements non enregistrés → on affiche une confirmation à la place). */
  beforeClose?: () => boolean
}>(), {
  width: 400,
  iconFrame: true,
})

const emit = defineEmits<{ close: [] }>()

const visible = ref(false)

onMounted(() => {
  requestAnimationFrame(() => { visible.value = true })
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') requestClose()
}

/** Déclenche la sortie animée ; le parent est notifié à la fin via @close.
    Si `beforeClose` renvoie false, la fermeture est bloquée (le parent gère). */
function requestClose() {
  if (props.beforeClose && props.beforeClose() === false) return
  visible.value = false
}

function onAfterLeave() {
  emit('close')
}

defineExpose({ close: requestClose })
</script>
