'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAgentsStore } from '@/store/agents'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

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

  if (typeof window === 'undefined') return null

  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
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
            onClick={onClose}
            className="absolute top-6 right-4 flex items-center justify-center w-10 h-10 rounded-lg text-text-tertiary hover:bg-surface transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-border shadow-xs text-text-tertiary">
              <UserPlus size={16} />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-text-primary leading-[30px]">Ajouter un agent</h2>
              <p className="text-sm text-text-tertiary leading-5">
                Renseigne les informations de l'agent terrain à assigner à ce workflow.
              </p>
            </div>
          </div>

          <div className="h-px bg-border w-full" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6">
          <Input
            label="Nom complet"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Ex. Mamadou Diallo"
            autoFocus
          />

          <Input
            label="Rôle / Titre"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Ex. Magasinier, Responsable qualité…"
          />

          <Input
            label="Téléphone"
            hint="Optionnel"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+221 77 000 00 00"
          />
        </div>

        <div className="px-6 py-4 border-t border-border shrink-0 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!name.trim() || !role.trim()}>
            Ajouter l'agent
          </Button>
        </div>
      </motion.aside>
    </>,
    document.body
  )
}
