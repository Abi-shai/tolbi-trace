'use client'

import { useState } from 'react'
import { X, UserPlus } from 'lucide-react'
import { useAgentsStore } from '@/store/agents'

interface NewAgentPanelProps {
  workflowId: string
  onClose: () => void
}

export default function NewAgentPanel({ workflowId, onClose }: NewAgentPanelProps) {
  const addAgent = useAgentsStore((s) => s.addAgent)

  const [name,  setName]  = useState('')
  const [role,  setRole]  = useState('')
  const [phone, setPhone] = useState('')

  function handleSubmit() {
    if (!name.trim() || !role.trim()) return
    addAgent(workflowId, name.trim(), role.trim(), phone.trim() || undefined)
    onClose()
  }

  return (
    <aside className="w-[360px] shrink-0 border-l border-border bg-white flex flex-col overflow-hidden">

      <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-50 shrink-0">
          <UserPlus size={14} className="text-primary" />
        </div>
        <span className="text-sm font-semibold text-text-primary flex-1 min-w-0">
          Ajouter un agent
        </span>
        <button
          onClick={onClose}
          className="flex items-center justify-center p-1.5 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-surface transition-colors shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

        <div>
          <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">
            Nom complet
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Ex. Mamadou Diallo"
            autoFocus
            className="w-full px-3 py-2 text-sm text-text-primary border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">
            Rôle / Titre
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Ex. Magasinier, Responsable qualité…"
            className="w-full px-3 py-2 text-sm text-text-primary border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">
            Téléphone{' '}
            <span className="font-normal normal-case text-text-muted">(optionnel)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+221 77 000 00 00"
            className="w-full px-3 py-2 text-sm text-text-primary border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

      </div>

      <div className="px-5 py-4 border-t border-border shrink-0">
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || !role.trim()}
          className="w-full px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Ajouter l'agent
        </button>
      </div>
    </aside>
  )
}
