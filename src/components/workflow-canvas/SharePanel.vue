<template>
  <Transition name="config-panel">
    <aside
      v-if="builder.sharePanelOpen"
      class="shrink-0 border-l border-border bg-white flex flex-col overflow-hidden"
      style="width: 360px"
    >
      <div class="w-[360px] flex flex-col flex-1 min-h-0">

        <div class="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
          <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-50 shrink-0">
            <Link2 :size="14" class="text-primary" />
          </div>
          <span class="text-sm font-semibold text-text-primary flex-1 min-w-0 truncate">
            Partager le processus
          </span>
          <DsCloseButton @click="builder.closeSharePanel()" />
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          <!-- QR Code -->
          <div class="flex flex-col items-center gap-3 py-5 bg-surface rounded-xl border border-border">
            <img
              :src="qrUrl"
              alt="QR code d'accès mobile"
              class="w-[160px] h-[160px] rounded-lg"
            />
            <p class="text-xs text-text-tertiary text-center leading-4 max-w-[200px]">
              L'agent scanne ce code pour accéder au processus sur mobile
            </p>
          </div>

          <!-- Workflow name -->
          <div>
            <p class="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Processus partagé</p>
            <p class="text-sm font-medium text-text-primary leading-5">{{ workflowName }}</p>
          </div>

          <!-- Copyable link -->
          <div>
            <p class="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Lien d'accès</p>
            <div class="flex items-center gap-2">
              <div class="flex-1 min-w-0 px-3 py-2 bg-surface border border-border rounded-lg">
                <p class="text-xs text-text-secondary truncate font-mono">{{ joinUrl }}</p>
              </div>
              <button
                @click="handleCopy"
                class="flex items-center justify-center w-9 h-9 shrink-0 rounded-lg border border-border bg-white hover:bg-surface transition-colors text-text-secondary"
              >
                <Check v-if="copied" :size="14" class="text-primary" />
                <Link2 v-else :size="14" />
              </button>
            </div>
          </div>

          <p class="text-xs text-text-quaternary leading-4">
            Partagez ce lien ou ce QR code avec vos agents terrain. Ils pourront accéder au processus sur l'application mobile Tolbi.
          </p>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Link2, Check } from 'lucide-vue-next'
import { useWorkflowBuilderStore } from '~/stores/workflow-builder'

const props = defineProps<{
  workflowId:   string
  workflowName: string
}>()

const builder = useWorkflowBuilderStore()
const copied  = ref(false)

const joinUrl = computed(() => `https://tolbi.app/join/${props.workflowId}`)
const qrUrl   = computed(() =>
  `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinUrl.value)}&color=056033&bgcolor=ffffff&margin=12`,
)

function handleCopy() {
  navigator.clipboard.writeText(joinUrl.value).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}
</script>

<style scoped>
.config-panel-enter-active,
.config-panel-leave-active {
  transition: width 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.config-panel-enter-from,
.config-panel-leave-to {
  width: 0 !important;
}
</style>
