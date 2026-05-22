import { create } from 'zustand'
import type { Workflow } from '@/types/workflow'
import { workflows as initialWorkflows } from '@/data/workflows'

let _counter = 0

interface WorkflowsState {
  workflows: Workflow[]
  initialized: boolean
  init: () => void
  createWorkflow: (name: string, description: string) => string
  publishWorkflow: (id: string) => void
}

export const useWorkflowsStore = create<WorkflowsState>((set, get) => ({
  workflows: [],
  initialized: false,

  init: () => {
    if (!get().initialized) {
      set({ workflows: initialWorkflows, initialized: true })
    }
  },

  createWorkflow: (name, description) => {
    const id = `wf-new-${++_counter}-${Date.now()}`
    const newWorkflow: Workflow = {
      id,
      name,
      description,
      project: 'AgroSénégal SA',
      stepCount: 0,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      bagsTotal: 0,
      bagsCompleted: 0,
      bagsInProgress: 0,
      bagsPending: 0,
    }
    set((s) => ({ workflows: [...s.workflows, newWorkflow] }))
    return id
  },

  publishWorkflow: (id) =>
    set((s) => ({
      workflows: s.workflows.map((w) =>
        w.id === id ? { ...w, status: 'active' as const } : w,
      ),
    })),
}))
