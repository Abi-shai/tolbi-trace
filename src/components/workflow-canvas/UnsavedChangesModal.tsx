'use client'

import { X } from 'lucide-react'
import Button from '@/components/ui/Button'

interface UnsavedChangesModalProps {
  onSave: () => void
  onDiscard: () => void
  onCancel: () => void
}

export default function UnsavedChangesModal({ onSave, onDiscard, onCancel }: UnsavedChangesModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-modal-overlay/70 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative bg-white rounded-xl w-full max-w-[480px] overflow-hidden shadow-lg">
        <div className="px-6 pt-6 pb-5 relative">
          <div className="pr-8">
            <h2 className="text-lg font-semibold text-text-primary leading-7">
              Modifications non enregistrées
            </h2>
            <p className="text-sm text-text-tertiary leading-5 mt-1">
              Vous avez des modifications non enregistrées. Voulez-vous les enregistrer avant de quitter ?
            </p>
          </div>
          <button
            onClick={onCancel}
            className="absolute top-3 right-3 flex items-center justify-center w-11 h-11 rounded-lg text-text-tertiary hover:bg-surface transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onDiscard}>
            Quitter sans enregistrer
          </Button>
          <Button variant="primary" onClick={onSave}>
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  )
}
