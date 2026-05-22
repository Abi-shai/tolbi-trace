'use client'

import { X } from 'lucide-react'

interface UnsavedChangesModalProps {
  onSave: () => void
  onDiscard: () => void
  onCancel: () => void
}

export default function UnsavedChangesModal({ onSave, onDiscard, onCancel }: UnsavedChangesModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop — dark + blur, matching Figma */}
      <div
        className="absolute inset-0 bg-modal-overlay/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl w-full max-w-[480px] overflow-hidden shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)]">

        {/* Header */}
        <div className="px-6 pt-6 pb-5 relative">
          <div className="pr-8">
            <h2 className="text-[18px] font-semibold text-text-primary leading-7">
              Modifications non enregistrées
            </h2>
            <p className="text-sm text-text-tertiary leading-5 mt-1">
              Tu as des modifications non enregistrées sur ce canvas. Veux-tu les enregistrer avant de quitter ?
            </p>
          </div>

          <button
            onClick={onCancel}
            className="absolute top-3 right-3 flex items-center justify-center w-11 h-11 rounded-lg text-text-tertiary hover:bg-surface transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onDiscard}
            className="px-4 py-[10px] text-sm font-semibold text-text-secondary bg-white border border-border rounded-lg hover:bg-surface transition-colors shadow-xs"
          >
            Quitter sans enregistrer
          </button>
          <button
            onClick={onSave}
            className="px-4 py-[10px] text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors shadow-xs"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}
