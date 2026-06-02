<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60" @click="$emit('close')" />

      <!-- Card -->
      <div class="relative z-10 bg-white rounded-xl shadow-[0px_20px_48px_rgba(16,24,40,0.24)] w-full max-w-sm">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 class="text-sm font-semibold text-text-primary font-mono">{{ qrCode.code }}</h2>
            <p class="text-xs text-text-tertiary mt-0.5">
              Étape {{ qrCode.currentStep }}/5 · {{ stepLabel }}
            </p>
          </div>
          <DsCloseButton @click="$emit('close')" />
        </div>

        <!-- QR Code -->
        <div class="flex flex-col items-center px-8 py-8 gap-4">
          <div class="p-5 bg-white rounded-xl border border-border shadow-[0px_1px_4px_rgba(16,24,40,0.08)]">
            <QrcodeVue :value="qrCode.code" :size="180" />
          </div>

          <div v-if="qrCode.producerName" class="text-center">
            <p class="text-xs text-text-tertiary">Producteur</p>
            <p class="text-sm font-semibold text-text-primary">{{ qrCode.producerName }}</p>
            <p v-if="qrCode.cooperativeName" class="text-xs text-text-tertiary mt-0.5">{{ qrCode.cooperativeName }}</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center gap-2 px-5 py-4 border-t border-border">
          <DsButton
            :label="copied ? 'Copié !' : 'Copier le code'"
            :icon-leading="copied ? 'check' : undefined"
            variant="secondary-gray"
            class="flex-1"
            @click="handleCopy"
          />
          <DsButton label="Télécharger" icon-leading="download-01" variant="primary" class="flex-1" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import QrcodeVue from 'qrcode.vue'
import type { QRCode as QRCodeType } from '~/types/qr-code'

const STEP_LABELS = [
  'Collecte chez le producteur',
  'Pesée et contrôle humidité',
  'Chargement transport',
  'Réception entrepôt',
  'Contrôle qualité final',
]

const props = defineProps<{
  qrCode: QRCodeType
}>()

defineEmits<{ close: [] }>()

const copied = ref(false)

const stepLabel = computed(() => STEP_LABELS[props.qrCode.currentStep - 1])

function handleCopy() {
  navigator.clipboard.writeText(props.qrCode.code)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1500)
}
</script>
