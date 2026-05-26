'use client'

import { createPortal } from 'react-dom'
import { X, Settings2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWorkflowBuilderStore } from '@/store/workflow-builder'
import Input from '@/components/ui/Input'

export default function WorkflowSettingsPanel() {
  const open          = useWorkflowBuilderStore((s) => s.settingsPanelOpen)
  const name          = useWorkflowBuilderStore((s) => s.workflowName)
  const description   = useWorkflowBuilderStore((s) => s.workflowDescription)
  const closeSettings = useWorkflowBuilderStore((s) => s.closeSettings)
  const updateMeta    = useWorkflowBuilderStore((s) => s.updateWorkflowMeta)

  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-40 bg-black/20"
        onClick={closeSettings}
      />

      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="fixed inset-y-0 right-0 z-50 w-[400px] bg-white border-l border-border-strong shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="relative px-6 pt-6 pb-0 shrink-0 flex flex-col gap-4">
          <button
            onClick={closeSettings}
            className="absolute top-6 right-4 flex items-center justify-center w-10 h-10 rounded-lg text-text-tertiary hover:bg-surface transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-border shadow-xs text-text-tertiary">
              <Settings2 size={16} />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-text-primary leading-[30px]">Paramètres</h2>
              <p className="text-sm text-text-tertiary leading-5">
                Modifiez le nom et la description de ce processus.
              </p>
            </div>
          </div>

          <div className="h-px bg-border w-full" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6">
          <Input
            label="Nom du processus"
            type="text"
            value={name}
            onChange={(e) => updateMeta(e.target.value, description)}
            placeholder="Ex. Collecte maïs — Campagne nov. 2025"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-secondary">
              Description{' '}
              <span className="font-normal text-text-tertiary">(optionnel)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => updateMeta(name, e.target.value)}
              placeholder="Décrivez l'objectif et le contexte de ce processus…"
              rows={4}
              className="w-full px-3.5 py-2.5 text-sm text-text-primary border border-border-strong rounded-lg placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
            />
          </div>
        </div>
      </motion.aside>
    </>
      )}
    </AnimatePresence>,
    document.body
  )
}
