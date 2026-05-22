'use client'

import { useState } from 'react'
import { X, GitBranch } from 'lucide-react'

interface NewWorkflowPanelProps {
  onCreate: (name: string, description: string) => void
  onClose: () => void
}

export default function NewWorkflowPanel({ onCreate, onClose }: NewWorkflowPanelProps) {
  const [name,        setName]        = useState('')
  const [description, setDescription] = useState('')

  function handleSubmit() {
    if (!name.trim()) return
    onCreate(name.trim(), description.trim())
  }

  return (
    <aside className="w-[360px] shrink-0 border-l border-border bg-white flex flex-col overflow-hidden">

      <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-50 shrink-0">
          <GitBranch size={14} className="text-primary" />
        </div>
        <span className="text-sm font-semibold text-text-primary flex-1 min-w-0">
          Nouveau workflow
        </span>
        <button
          onClick={onClose}
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
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Ex. Collecte maïs — Campagne nov. 2025"
            autoFocus
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
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décris l'objectif et le contexte de ce workflow…"
            rows={4}
            className="w-full px-3 py-2 text-sm text-text-primary border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
          />
        </div>
      </div>

      <div className="px-5 py-4 border-t border-border shrink-0">
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="w-full px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Créer le workflow
        </button>
      </div>
    </aside>
  )
}
