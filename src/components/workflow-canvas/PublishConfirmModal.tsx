'use client'

import { X } from 'lucide-react'
import Button from '@/components/ui/Button'

interface PublishConfirmModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export default function PublishConfirmModal({ onConfirm, onCancel }: PublishConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-modal-overlay/70 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative bg-white rounded-xl w-full max-w-[480px] overflow-hidden shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)]">
        <div className="px-6 pt-6 pb-5 relative">
          <div className="pr-8">
            <h2 className="text-[18px] font-semibold text-text-primary leading-7">
              Publier le workflow
            </h2>
            <p className="text-sm text-text-tertiary leading-5 mt-1">
              Une fois publié, ce workflow sera visible et accessible aux agents sur l'application mobile. Tu pourras le repasser en brouillon à tout moment.
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
          <Button variant="secondary" onClick={onCancel}>Annuler</Button>
          <Button variant="primary" onClick={onConfirm}>Publier</Button>
        </div>
      </div>
    </div>
  )
}
