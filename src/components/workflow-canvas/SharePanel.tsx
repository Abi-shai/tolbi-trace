'use client'

import { useState } from 'react'
import { X, Link2, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWorkflowBuilderStore } from '@/store/workflow-builder'

interface SharePanelProps {
  workflowId: string
  workflowName: string
}

export default function SharePanel({ workflowId, workflowName }: SharePanelProps) {
  const open       = useWorkflowBuilderStore((s) => s.sharePanelOpen)
  const closePanel = useWorkflowBuilderStore((s) => s.closeSharePanel)
  const [copied, setCopied] = useState(false)

  const joinUrl = `https://tolbi.app/join/${workflowId}`
  const qrUrl   = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinUrl)}&color=056033&bgcolor=ffffff&margin=12`

  function handleCopy() {
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ width: 0 }}
          animate={{ width: 360 }}
          exit={{ width: 0 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          className="shrink-0 border-l border-border bg-white flex flex-col overflow-hidden"
        >
          <div className="w-[360px] flex flex-col flex-1 min-h-0">

            <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-50 shrink-0">
                <Link2 size={14} className="text-primary" />
              </div>
              <span className="text-sm font-semibold text-text-primary flex-1 min-w-0 truncate">
                Partager le processus
              </span>
              <button
                onClick={closePanel}
                className="flex items-center justify-center p-1.5 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-surface transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

              {/* QR Code */}
              <div className="flex flex-col items-center gap-3 py-5 bg-surface rounded-xl border border-border">
                <img
                  src={qrUrl}
                  alt="QR code d'accès mobile"
                  className="w-[160px] h-[160px] rounded-lg"
                />
                <p className="text-xs text-text-tertiary text-center leading-4 max-w-[200px]">
                  L'agent scanne ce code pour accéder au processus sur mobile
                </p>
              </div>

              {/* Workflow name label */}
              <div>
                <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                  Processus partagé
                </p>
                <p className="text-sm font-medium text-text-primary leading-5">{workflowName}</p>
              </div>

              {/* Copyable link */}
              <div>
                <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">
                  Lien d'accès
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0 px-3 py-2 bg-surface border border-border rounded-lg">
                    <p className="text-xs text-text-secondary truncate font-mono">{joinUrl}</p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center w-9 h-9 shrink-0 rounded-lg border border-border bg-white hover:bg-surface transition-colors text-text-secondary"
                  >
                    {copied ? <Check size={14} className="text-primary" /> : <Link2 size={14} />}
                  </button>
                </div>
              </div>

              {/* Info */}
              <p className="text-xs text-text-muted leading-4">
                Partagez ce lien ou ce QR code avec vos agents terrain. Ils pourront accéder au processus sur l'application mobile Tolbi.
              </p>

            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
