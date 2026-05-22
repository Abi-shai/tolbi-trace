import { create } from 'zustand'
import type { QRCode } from '@/types/qr-code'

interface QRCodesState {
  codes: QRCode[]
  initialized: boolean
  initCodes: (codes: QRCode[]) => void
}

export const useQRCodesStore = create<QRCodesState>((set) => ({
  codes: [],
  initialized: false,
  initCodes: (codes) => set({ codes, initialized: true }),
}))
