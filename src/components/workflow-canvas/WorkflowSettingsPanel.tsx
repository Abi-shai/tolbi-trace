'use client'

import { X, Settings2 } from 'lucide-react'
import { useWorkflowBuilderStore } from '@/store/workflow-builder'

export default function WorkflowSettingsPanel() {
  const open          = useWorkflowBuilderStore((s) => s.settingsPanelOpen)
  const name          = useWorkflowBuilderStore((s) => s.workflowName)
  const description   = useWorkflowBuilderStore((s) => s.workflowDescription)
  const closeSettings = useWorkflowBuilderStore((s) => s.closeSettings)
  const updateMeta    = useWorkflowBuilderStore((s) => s.updateWorkflowMeta)

  if (!open) return null

  return (
    <aside className="w-[360px] shrink-0 border-l border-border bg-white flex flex-col overflow-hidden">

      <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-50 shrink-0">
          <Settings2 size={14} className="text-primary" />
        </div>
        <span className="text-sm font-semibold text-text-primary flex-1 min-w-0">
          Paramètres du workflow
        </span>
        <button
          onClick={closeSettings}
          className="flex items-center justify-center p-1.5 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-surface transition-colors shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

        <div>
          <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">
            Nom du workflow
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => updateMeta(e.target.value, description)}
            placeholder="Ex. Collecte maïs — Campagne nov. 2025"
            className="w-full px-3 py-2 text-sm text-text-primary border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">
            Description{' '}
            <span className="font-normal normal-case text-text-muted">(optionnel)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => updateMeta(name, e.target.value)}
            placeholder="Décris l'objectif et le contexte de ce workflow…"
            rows={4}
            className="w-full px-3 py-2 text-sm text-text-primary border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
          />
        </div>

      </div>
    </aside>
  )
}
