'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { X, Trash2, Plus, GripVertical, Users, AlertTriangle } from 'lucide-react'
import { useWorkflowBuilderStore } from '@/store/workflow-builder'
import { useAgentsStore } from '@/store/agents'
import { QUESTION_TYPE_LABELS, type QuestionType, type ValidationType } from '@/types/workflow-step'
import { cn } from '@/lib/utils'

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'qr_batch',   label: 'Scan QR (rafale)' },
  { value: 'qr_scan',    label: 'Scan QR' },
  { value: 'producteur', label: 'Producteur' },
  { value: 'texte',      label: 'Texte libre' },
  { value: 'nombre',     label: 'Nombre' },
  { value: 'date',       label: 'Date' },
  { value: 'selection',  label: 'Sélection' },
]

export default function StepConfigPanel() {
  const steps          = useWorkflowBuilderStore((s) => s.steps)
  const selectedId     = useWorkflowBuilderStore((s) => s.selectedStepId)
  const selectStep     = useWorkflowBuilderStore((s) => s.selectStep)
  const updateStep     = useWorkflowBuilderStore((s) => s.updateStep)
  const removeStep     = useWorkflowBuilderStore((s) => s.removeStep)
  const addQuestion    = useWorkflowBuilderStore((s) => s.addQuestion)
  const removeQuestion = useWorkflowBuilderStore((s) => s.removeQuestion)
  const updateQuestion = useWorkflowBuilderStore((s) => s.updateQuestion)

  const [confirmDelete, setConfirmDelete] = useState(false)

  const initAgents     = useAgentsStore((s) => s.init)
  const agents         = useAgentsStore((s) => s.agents)

  const pathname   = usePathname()
  const workflowId = pathname.match(/^\/workflows\/([^/]+)/)?.[1] ?? ''

  useEffect(() => { initAgents() }, [initAgents])

  const step            = steps.find((s) => s.id === selectedId)
  const workflowAgents  = agents.filter((a) => a.workflowId === workflowId)

  if (!step) return null

  const validationType = step.validationType ?? 'form'

  function handleDelete() {
    removeStep(step!.id)
    setConfirmDelete(false)
  }

  function handleAgentChange(value: string) {
    if (!step) return
    if (!value) {
      updateStep(step.id, { agentId: undefined, agentRole: '' })
      return
    }
    const agent = agents.find((a) => a.id === value)
    if (agent) {
      updateStep(step.id, { agentId: agent.id, agentRole: agent.name })
    }
  }

  return (
    <aside className="w-[360px] shrink-0 border-l border-border bg-white flex flex-col overflow-hidden">

      <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0">
          {step.order}
        </span>
        <span className="text-sm font-semibold text-text-primary truncate flex-1 min-w-0">
          {step.name}
        </span>
        <button
          onClick={() => selectStep(null)}
          className="flex items-center justify-center p-1.5 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-surface transition-colors shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">

        <div className="px-5 py-5 space-y-4">

          <div>
            <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">
              Nom de l'étape
            </label>
            <input
              type="text"
              value={step.name}
              onChange={(e) => updateStep(step.id, { name: e.target.value })}
              className="w-full px-3 py-2 text-sm text-text-primary border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="Nom de l'étape"
            />
          </div>

          {/* Agent assigné */}
          <div>
            <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">
              Agent assigné
            </label>

            {workflowAgents.length > 0 ? (
              <select
                value={step.agentId ?? ''}
                onChange={(e) => handleAgentChange(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none cursor-pointer"
              >
                <option value="">— Aucun agent assigné</option>
                {workflowAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} · {agent.role}
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-3 py-2.5 border border-dashed border-border rounded-lg bg-surface text-xs text-text-muted">
                Aucun agent dans l'équipe pour l'instant.
              </div>
            )}

            <Link
              href={`/workflows/${workflowId}/agents`}
              className="flex items-center gap-1 mt-1.5 text-xs text-primary hover:underline"
            >
              <Users size={11} />
              Gérer l'équipe
            </Link>
          </div>

          {/* Type de validation */}
          <div>
            <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">
              Type de validation
            </label>
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(['form', 'code'] as ValidationType[]).map((val) => (
                <button
                  key={val}
                  onClick={() => updateStep(step.id, { validationType: val })}
                  className={cn(
                    'flex-1 py-2 text-xs font-semibold transition-colors',
                    validationType === val
                      ? 'bg-primary text-white'
                      : 'bg-white text-text-tertiary hover:text-text-secondary hover:bg-surface',
                  )}
                >
                  {val === 'form' ? 'Formulaire' : 'Code de validation'}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-text-muted mt-1 leading-4">
              {validationType === 'form'
                ? 'L\'agent remplit les champs définis ci-dessous.'
                : 'L\'agent saisit un code unique pour valider l\'étape.'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">
              Description{' '}
              <span className="font-normal normal-case text-text-muted">(optionnel)</span>
            </label>
            <textarea
              value={step.description ?? ''}
              onChange={(e) => updateStep(step.id, { description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 text-sm text-text-primary border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
              placeholder="Description courte de cette étape"
            />
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="px-5 py-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
              Questions
              <span className="ml-1.5 px-1.5 py-0.5 bg-surface rounded text-text-muted font-normal normal-case">
                {step.questions.length}
              </span>
            </h3>
            <button
              onClick={() => addQuestion(step.id, 'texte')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover transition-colors"
            >
              <Plus size={12} />
              Ajouter
            </button>
          </div>

          {step.questions.length === 0 ? (
            <div className="py-10 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center mb-3">
                <Plus size={14} className="text-text-muted" />
              </div>
              <p className="text-sm font-medium text-text-secondary mb-1">Aucune question</p>
              <p className="text-xs text-text-muted leading-4 max-w-[200px]">
                Clique sur "Ajouter" pour définir les données à collecter.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {step.questions.map((q) => (
                <div
                  key={q.id}
                  className="group flex items-start gap-2 p-3 border border-border rounded-lg bg-white hover:border-border-strong transition-colors"
                >
                  <GripVertical size={14} className="text-text-muted mt-[9px] shrink-0 cursor-grab" />

                  <div className="flex-1 space-y-2 min-w-0">
                    <select
                      value={q.type}
                      onChange={(e) =>
                        updateQuestion(step.id, q.id, { type: e.target.value as QuestionType })
                      }
                      className="w-full px-2.5 py-1.5 text-xs font-semibold border border-border rounded-md bg-surface text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none cursor-pointer"
                    >
                      {QUESTION_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={q.label}
                      onChange={(e) =>
                        updateQuestion(step.id, q.id, { label: e.target.value })
                      }
                      placeholder={`Libellé — ex. "${QUESTION_TYPE_LABELS[q.type]}"`}
                      className="w-full px-2.5 py-1.5 text-xs text-text-primary border border-border rounded-md placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>

                  <button
                    onClick={() => removeQuestion(step.id, q.id)}
                    className="p-1.5 rounded-md text-text-muted hover:text-status-anomaly hover:bg-red-50 transition-colors shrink-0 mt-0.5 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer — suppression */}
      <div className="shrink-0 px-5 py-4 border-t border-border">
        <button
          onClick={() => setConfirmDelete(true)}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-status-anomaly transition-colors"
        >
          <Trash2 size={13} />
          Supprimer l'étape
        </button>
      </div>

      {/* Modale de confirmation */}
      {confirmDelete && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setConfirmDelete(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-white rounded-xl shadow-xl border border-border w-full max-w-sm mx-4 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-100 shrink-0">
                <AlertTriangle size={16} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Supprimer cette étape ?</p>
                <p className="text-xs text-text-muted mt-0.5">« {step.name} »</p>
              </div>
            </div>
            <p className="text-xs text-text-secondary leading-5">
              Cette action est irréversible. Les questions configurées et l'agent assigné seront supprimés avec l'étape.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 border border-border bg-white text-sm font-semibold text-text-secondary rounded-lg hover:bg-surface transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </aside>
  )
}
