'use client'

import { X, Download, Copy, Check } from 'lucide-react'
import QRCode from 'react-qr-code'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { QRCode as QRCodeType } from '@/types/qr-code'
import Button from '@/components/ui/Button'

const STEP_LABELS = [
  'Collecte chez le producteur',
  'Pesée et contrôle humidité',
  'Chargement transport',
  'Réception entrepôt',
  'Contrôle qualité final',
]

interface QRCodeViewerModalProps {
  qrCode: QRCodeType
  onClose: () => void
}

export default function QRCodeViewerModal({ qrCode, onClose }: QRCodeViewerModalProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(qrCode.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const stepLabel = STEP_LABELS[qrCode.currentStep - 1]

  // This component only mounts on client (triggered by user interaction),
  // so document.body is always available — no mounted-state guard needed.
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Card */}
      <div className="relative z-10 bg-white rounded-xl shadow-[0px_20px_48px_rgba(16,24,40,0.24)] w-full max-w-sm">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-text-primary font-mono">{qrCode.code}</h2>
            <p className="text-xs text-text-tertiary mt-0.5">
              Étape {qrCode.currentStep}/5 · {stepLabel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-surface transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center px-8 py-8 gap-4">
          <div className="p-5 bg-white rounded-xl border border-border shadow-[0px_1px_4px_rgba(16,24,40,0.08)]">
            <QRCode value={qrCode.code} size={180} />
          </div>

          {qrCode.producerName && (
            <div className="text-center">
              <p className="text-xs text-text-tertiary">Producteur</p>
              <p className="text-sm font-semibold text-text-primary">{qrCode.producerName}</p>
              {qrCode.cooperativeName && (
                <p className="text-xs text-text-tertiary mt-0.5">{qrCode.cooperativeName}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-border">
          <Button variant="secondary" icon={copied ? Check : Copy} onClick={handleCopy} fullWidth>
            {copied ? 'Copié !' : 'Copier le code'}
          </Button>
          <Button variant="primary" icon={Download} fullWidth>
            Télécharger
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
