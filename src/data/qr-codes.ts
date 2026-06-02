import type { QRCode } from '@/types/qr-code'
import { producers } from './producers'

function pad(n: number, digits = 3) {
  return String(n).padStart(digits, '0')
}

// Répartition des 48 sacs par étape du workflow (wf-001, 5 étapes)
// 001-020 : étape 5 (complétés)
// 021-026 : étape 2 | 027-032 : étape 3 | 033-035 : étape 4
// 036-045 : étape 1 (vient d'être collecté)
// 046-048 : bloqués à l'étape 2
export const qrCodes: QRCode[] = Array.from({ length: 48 }, (_, i) => {
  const n = i + 1
  const code = `KLK-2025-${pad(n)}`

  const currentStep: number =
    n <= 20 ? 5 :
    n <= 26 ? 2 :
    n <= 32 ? 3 :
    n <= 35 ? 4 :
    n <= 45 ? 1 :
    2  // bloqués à l'étape 2

  // Sacs 046-048 : anomalies signalées (bloqués, non conformes)
  const status: QRCode['status'] = n >= 46 ? 'anomaly' : 'active'

  // 041-045 et 048 sans producteur attribué (agent pas encore identifié)
  const isAssigned = !(n >= 41 && n <= 45) && n !== 48

  const producer = isAssigned ? producers[i % producers.length] : undefined

  return {
    id: `qr-${pad(n)}`,
    code,
    status,
    currentStep,
    producerId:      producer?.id,
    producerName:    producer?.name,
    cooperativeName: producer ? 'Coopérative Kaolack Maïs' : undefined,
    workflowId:      'wf-001',
    createdAt:       '2025-10-20',
  }
})
