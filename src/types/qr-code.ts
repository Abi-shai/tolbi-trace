export type QRCodeStatus = 'active'

export interface QRCode {
  id: string
  code: string
  status: QRCodeStatus
  currentStep: number
  producerId?: string
  producerName?: string
  cooperativeName?: string
  workflowId: string
  createdAt: string
}
