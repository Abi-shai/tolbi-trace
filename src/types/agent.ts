export type AgentStatut = 'actif' | 'inactif'

export interface Agent {
  id: string
  name: string
  role?: string
  phone?: string
  /** Code PIN à 4 chiffres, unique à l'échelle du Fournisseur (tenant). */
  pin: string
  statut: AgentStatut
  workflowId: string
  lastActivity?: string
  progress?: number
}
