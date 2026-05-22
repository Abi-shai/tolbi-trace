'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useWorkflowsStore } from '@/store/workflows'
import Header from '@/components/layout/Header'
import WorkflowCard from './WorkflowCard'
import NewWorkflowPanel from './NewWorkflowPanel'

export default function WorkflowsClient() {
  const router         = useRouter()
  const init           = useWorkflowsStore((s) => s.init)
  const workflows      = useWorkflowsStore((s) => s.workflows)
  const createWorkflow = useWorkflowsStore((s) => s.createWorkflow)

  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => { init() }, [init])

  function handleCreate(name: string, description: string) {
    const id = createWorkflow(name, description)
    setPanelOpen(false)
    router.push(`/workflows/${id}`)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <Header
        title="Workflows"
        description="Créez des workflows et gérez la traçabilité de vos campagnes de bout en bout."
        actions={
          <button
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-xs"
          >
            <Plus size={16} />
            Nouveau workflow
          </button>
        }
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-4xl">
            <p className="text-sm text-text-tertiary mb-5">
              {workflows.length} workflow{workflows.length > 1 ? 's' : ''}
            </p>

            <div className="grid gap-3">
              {workflows.map((workflow) => (
                <WorkflowCard key={workflow.id} workflow={workflow} />
              ))}
            </div>
          </div>
        </main>

        {panelOpen && (
          <NewWorkflowPanel
            onCreate={handleCreate}
            onClose={() => setPanelOpen(false)}
          />
        )}
      </div>
    </div>
  )
}
