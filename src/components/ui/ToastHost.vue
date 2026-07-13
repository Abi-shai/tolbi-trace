<template>
  <Teleport to="body">
    <!-- Placement : bas-droite (cf. design Figma), empilé, marge ~24px -->
    <TransitionGroup
      name="toast"
      tag="div"
      class="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none"
    >
      <div
        v-for="t in toast.items"
        :key="t.id"
        class="toast-item pointer-events-auto relative w-[400px] max-w-[calc(100vw-3rem)] p-4 rounded-xl bg-white border border-border-strong shadow-lg"
      >
        <!-- Contenu : titre + texte de support + action éventuelle -->
        <div class="flex flex-col gap-3 pr-8">
          <div class="flex flex-col gap-1">
            <p class="text-sm font-semibold text-text-primary leading-5">{{ t.title }}</p>
            <p v-if="t.description" class="text-sm text-text-secondary leading-5">{{ t.description }}</p>
          </div>
          <div v-if="t.actions?.length" class="flex gap-4">
            <button
              v-for="(a, i) in t.actions"
              :key="i"
              class="text-sm font-semibold leading-5 text-[var(--ds-color-brand-700)] hover:underline"
              @click="a.onClick()"
            >
              {{ a.label }}
            </button>
          </div>
        </div>

        <!-- Fermeture, ancrée en haut à droite -->
        <button
          class="absolute top-[7px] right-[7px] flex items-center justify-center w-9 h-9 rounded-md text-text-quaternary hover:bg-surface hover:text-text-secondary transition-colors"
          aria-label="Fermer"
          @click="toast.dismiss(t.id)"
        >
          <X :size="20" />
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { useToastStore } from '~/stores/toast'

const toast = useToastStore()
</script>

<style scoped>
/* Motion DS : entrée 150ms, sortie 200ms, ease-out — glisse depuis la droite. */
.toast-enter-active { transition: opacity var(--ds-motion-duration-moderate) ease-out, transform var(--ds-motion-duration-moderate) ease-out; }
.toast-leave-active { transition: opacity var(--ds-motion-duration-enter) ease-out, transform var(--ds-motion-duration-enter) ease-out; }
.toast-enter-from,
.toast-leave-to { opacity: 0; transform: translateX(16px); }
.toast-move { transition: transform var(--ds-motion-duration-enter) ease-out; }
</style>
