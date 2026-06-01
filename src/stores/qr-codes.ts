import { defineStore } from 'pinia'
import type { QRCode } from '~/types/qr-code'

export const useQRCodesStore = defineStore('qrCodes', {
  state: () => ({
    codes: [] as QRCode[],
    initialized: false,
  }),

  actions: {
    initCodes(codes: QRCode[]) {
      this.codes = [...codes]
      this.initialized = true
    },
  },
})
