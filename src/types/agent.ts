export interface Agent {
  id: string
  name: string
  role?: string
  phone?: string
  workflowId: string
  lastActivity?: string
  progress?: number
}
