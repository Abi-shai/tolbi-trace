'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Pencil, Share2, Rocket } from 'lucide-react'
import { useWorkflowBuilderStore } from '@/store/workflow-builder'
import { useWorkflowsStore } from '@/store/workflows'
import UnsavedChangesModal from './UnsavedChangesModal'
import PublishConfirmModal from './PublishConfirmModal'
import type { WorkflowStatus } from '@/types/workflow'

const STATUS_BADGE: Record<WorkflowStatus, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  draft:  'bg-surface text-text-tertiary border-border',
}

const STATUS_LABELS: Record<WorkflowStatus, string> = {
  active: 'Actif',
  draft:  'Brouillon',
}

interface WorkflowToolbarProps {
  workflowId: string
  workflowName: string
  description: string
  status: WorkflowStatus
  stepCount: number
}

export default function WorkflowToolbar({ workflowId, workflowName, description, status, stepCount }: WorkflowToolbarProps) {
  const router           = useRouter()
  const initWorkflowMeta = useWorkflowBuilderStore((s) => s.initWorkflowMeta)
  const openSettings     = useWorkflowBuilderStore((s) => s.openSettings)
  const openSharePanel   = useWorkflowBuilderStore((s) => s.openSharePanel)
  const storeSteps       = useWorkflowBuilderStore((s) => s.steps)
  const storeName        = useWorkflowBuilderStore((s) => s.workflowName)
  const hasUnsaved       = useWorkflowBuilderStore((s) => s.hasUnsavedChanges)
  const markSaved        = useWorkflowBuilderStore((s) => s.markSaved)
  const publishWorkflow  = useWorkflowsStore((s) => s.publishWorkflow)

  const [showUnsavedModal,  setShowUnsavedModal]  = useState(false)
  const [showPublishModal,  setShowPublishModal]   = useState(false)

  useEffect(() => {
    initWorkflowMeta(workflowName, description)
  }, [workflowName, description, initWorkflowMeta])

  const count       = storeSteps.length > 0 ? storeSteps.length : stepCount
  const displayName = storeName || workflowName

  function handleBackClick() {
    if (hasUnsaved) {
      setShowUnsavedModal(true)
    } else {
      router.push('/workflows')
    }
  }

  function handleSaveAndLeave() {
    markSaved()
    router.push('/workflows')
  }

  function handlePublishConfirm() {
    publishWorkflow(workflowId)
    setShowPublishModal(false)
  }

  return (
    <>
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackClick}
            className="flex items-center justify-center p-1.5 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-surface transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="w-px h-5 bg-border" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-text-primary leading-5">{displayName}</h1>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${STATUS_BADGE[status]}`}>
                {STATUS_LABELS[status]}
              </span>
            </div>
            <p className="text-xs text-text-tertiary leading-4">
              {count} étape{count > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">

          {/* Partager — actif seulement */}
          {status === 'active' && (
            <button
              onClick={openSharePanel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-text-secondary text-sm font-medium hover:bg-surface transition-colors"
            >
              <Share2 size={14} />
              Partager
            </button>
          )}

          {/* Publier — brouillon seulement */}
          {status === 'draft' && (
            <button
              onClick={() => setShowPublishModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors shadow-xs"
            >
              <Rocket size={14} />
              Publier
            </button>
          )}

          <button
            onClick={openSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-text-secondary text-sm font-medium hover:bg-surface transition-colors"
          >
            <Pencil size={14} />
            Modifier
          </button>

          <button
            onClick={markSaved}
            disabled={!hasUnsaved}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors shadow-xs disabled:cursor-default
              bg-primary text-white hover:bg-primary-hover
              disabled:bg-surface disabled:text-text-tertiary disabled:border disabled:border-border disabled:shadow-none"
          >
            {hasUnsaved ? 'Enregistrer' : <><Check size={14} />Enregistré</>}
          </button>
        </div>
      </div>

      {showUnsavedModal && (
        <UnsavedChangesModal
          onSave={handleSaveAndLeave}
          onDiscard={() => router.push('/workflows')}
          onCancel={() => setShowUnsavedModal(false)}
        />
      )}

      {showPublishModal && (
        <PublishConfirmModal
          onConfirm={handlePublishConfirm}
          onCancel={() => setShowPublishModal(false)}
        />
      )}
    </>
  )
}
