export type WorkflowStatus = 'active' | 'draft'

export interface Workflow {
  id: string
  name: string
  description: string
  project: string
  stepCount: number
  status: WorkflowStatus
  createdAt: string
  bagsTotal: number
  bagsCompleted: number
  bagsInProgress: number
  bagsPending: number
}
