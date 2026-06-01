<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="true"
        class="fixed inset-0 z-40 bg-black/20"
        @click="$emit('close')"
      />
    </Transition>

    <Transition name="slide-panel">
      <aside
        class="fixed inset-y-0 right-0 z-50 w-[400px] bg-white border-l border-border-strong shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] flex flex-col overflow-hidden"
      >
        <!-- Header -->
        <div class="relative px-6 pt-6 pb-0 shrink-0 flex flex-col gap-4">
          <button
            @click="$emit('close')"
            class="absolute top-6 right-4 flex items-center justify-center w-10 h-10 rounded-lg text-text-tertiary hover:bg-surface transition-colors"
          >
            <X :size="16" />
          </button>

          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-center w-10 h-10 rounded-lg border border-border shadow-xs text-text-tertiary">
              <Route :size="16" />
            </div>
            <div class="flex flex-col gap-1">
              <h2 class="text-xl font-semibold text-text-primary leading-[30px]">Nouveau processus</h2>
              <p class="text-sm text-text-tertiary leading-5">Donnez un nom à votre processus.</p>
            </div>
          </div>

          <div class="h-px bg-border w-full" />
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6">
          <Input
            label="Nom du processus"
            type="text"
            v-model="name"
            @keydown.enter="handleSubmit"
            placeholder="Ex. Collecte maïs — Campagne nov. 2025"
            autofocus
          />

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-text-secondary">
              Description <span class="font-normal text-text-tertiary">(optionnel)</span>
            </label>
            <textarea
              v-model="description"
              placeholder="Décrivez l'objectif et le contexte de ce processus…"
              rows="4"
              class="w-full px-3.5 py-2.5 text-sm text-text-primary border border-border-strong rounded-lg placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
            />
          </div>
        </div>

        <div class="px-6 py-4 border-t border-border shrink-0 flex items-center justify-end gap-3">
          <Button variant="secondary" @click="$emit('close')">Annuler</Button>
          <Button variant="primary" @click="handleSubmit" :disabled="!name.trim()">
            Créer le processus
          </Button>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { X, Route } from 'lucide-vue-next'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'

const emit = defineEmits<{
  create: [name: string, description: string]
  close:  []
}>()

const name        = ref('')
const description = ref('')

function handleSubmit() {
  if (!name.value.trim()) return
  emit('create', name.value.trim(), description.value.trim())
}
</script>
