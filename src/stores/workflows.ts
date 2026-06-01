import { defineStore } from 'pinia'
import type { Workflow } from '~/types/workflow'
import { workflows as initialWorkflows } from '~/data/workflows'

let _counter = 0

export const useWorkflowsStore = defineStore('workflows', {
  state: () => ({
    workflows: [] as Workflow[],
    initialized: false,
  }),

  actions: {
    init() {
      if (!this.initialized) {
        this.workflows = [...initialWorkflows]
        this.initialized = true
      }
    },

    createWorkflow(name: string, description: string): string {
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
      this.workflows.push(newWorkflow)
      return id
    },

    publishWorkflow(id: string) {
      const wf = this.workflows.find((w) => w.id === id)
      if (wf) wf.status = 'active'
    },
  },
})
