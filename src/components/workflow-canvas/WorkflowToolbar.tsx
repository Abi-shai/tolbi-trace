'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Pencil, Share2, Rocket } from 'lucide-react'
import { useWorkflowBuilderStore } from '@/store/workflow-builder'
import { useWorkflowsStore } from '@/store/workflows'
import UnsavedChangesModal from './UnsavedChangesModal'
import PublishConfirmModal from './PublishConfirmModal'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import type { WorkflowStatus } from '@/types/workflow'

const STATUS_BADGE_VARIANT: Record<WorkflowStatus, 'success' | 'neutral'> = {
  active: 'success',
  draft:  'neutral',
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
              <Badge variant={STATUS_BADGE_VARIANT[status]}>
                {STATUS_LABELS[status]}
              </Badge>
            </div>
            <p className="text-xs text-text-tertiary leading-4">
              {count} étape{count > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">

          {status === 'active' && (
            <Button variant="secondary" icon={Share2} size="sm" onClick={openSharePanel}>
              Partager
            </Button>
          )}

          {status === 'draft' && (
            <Button variant="primary" icon={Rocket} size="sm" onClick={() => setShowPublishModal(true)}>
              Publier
            </Button>
          )}

          <Button variant="secondary" icon={Pencil} size="sm" onClick={openSettings}>
            Modifier
          </Button>

          <Button
            variant={hasUnsaved ? 'primary' : 'secondary'}
            icon={hasUnsaved ? undefined : Check}
            size="sm"
            onClick={markSaved}
            disabled={!hasUnsaved}
          >
            {hasUnsaved ? 'Enregistrer' : 'Enregistré'}
          </Button>
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
