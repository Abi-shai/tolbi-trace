'use client'

import { X, Download, Copy, Check } from 'lucide-react'
import QRCode from 'react-qr-code'
import { useState } from 'react'
import type { QRCode as QRCodeType } from '@/types/qr-code'

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-[0px_8px_32px_rgba(16,24,40,0.16)] w-full max-w-sm mx-4">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-text-primary font-mono">{qrCode.code}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-text-tertiary">
                Étape {qrCode.currentStep}/5 — {stepLabel}
              </span>
            </div>
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
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg text-sm font-medium text-text-secondary hover:bg-surface transition-colors"
          >
            {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
            {copied ? 'Copié !' : 'Copier le code'}
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors">
            <Download size={14} />
            Télécharger
          </button>
        </div>
      </div>
    </div>
  )
}
