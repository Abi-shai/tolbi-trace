'use client'

import { use, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { useWorkflowsStore } from '@/store/workflows'
import { useWorkflowBuilderStore } from '@/store/workflow-builder'
import { useAgentsStore } from '@/store/agents'
import WorkflowCanvas from '@/components/workflow-canvas/WorkflowCanvas'
import WorkflowToolbar from '@/components/workflow-canvas/WorkflowToolbar'
import StepConfigPanel from '@/components/workflow-canvas/StepConfigPanel'
import WorkflowSettingsPanel from '@/components/workflow-canvas/WorkflowSettingsPanel'
import SharePanel from '@/components/workflow-canvas/SharePanel'
import { workflowSteps } from '@/data/workflow-steps'

export default function WorkflowCanvasPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const init         = useWorkflowsStore((s) => s.init)
  const workflows    = useWorkflowsStore((s) => s.workflows)
  const hasUnsaved   = useWorkflowBuilderStore((s) => s.hasUnsavedChanges)
  const initAgents   = useAgentsStore((s) => s.init)

  useEffect(() => { init() }, [init])
  useEffect(() => { initAgents() }, [initAgents])

  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (hasUnsaved) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', guard)
    return () => window.removeEventListener('beforeunload', guard)
  }, [hasUnsaved])

  const workflow = workflows.find((w) => w.id === id)
  const steps    = workflowSteps[id] ?? []

  if (workflows.length > 0 && !workflow) notFound()

  if (!workflow) {
    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden items-center justify-center">
        <div className="text-sm text-text-muted">Chargement…</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <WorkflowToolbar
        workflowId={workflow.id}
        workflowName={workflow.name}
        description={workflow.description}
        status={workflow.status}
        stepCount={steps.length}
      />

      {/* Draft banner */}
      {workflow.status === 'draft' && (
        <div className="flex items-center gap-2 px-5 py-2 border-b border-amber-200 bg-amber-50 shrink-0">
          <AlertCircle size={13} className="text-amber-500 shrink-0" />
          <p className="text-xs text-amber-800 font-medium">
            Ce workflow est en brouillon — les agents n'y ont pas encore accès. Publie-le pour démarrer la collecte.
          </p>
        </div>
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <WorkflowCanvas steps={steps} />
        <StepConfigPanel />
        <WorkflowSettingsPanel />
        <SharePanel workflowId={workflow.id} workflowName={workflow.name} />
      </div>
    </div>
  )
}
