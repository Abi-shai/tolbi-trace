'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { useWorkflowsStore } from '@/store/workflows'
import Header from '@/components/layout/Header'
import WorkflowCard from './WorkflowCard'
import NewWorkflowPanel from './NewWorkflowPanel'
import Button from '@/components/ui/Button'

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
        title="Processus"
        description="Créez et gérez vos processus de traçabilité terrain."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setPanelOpen(true)}>
            Nouveau processus
          </Button>
        }
      />

      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {workflows.map((workflow) => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </div>
      </main>

      <AnimatePresence>
        {panelOpen && (
          <NewWorkflowPanel
            onCreate={handleCreate}
            onClose={() => setPanelOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
