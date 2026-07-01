// Data OS — agent terrain assigné à un Formulaire.
// Parallèle du type `Agent` (Source), mais scopé à un Formulaire et non à un
// workflow (voir docs/adr/0006 et la distinction Agent/Enquêteur du glossaire).

export type DataosAgentStatut = 'actif' | 'inactif'

export interface DataosAgent {
  id: string
  name: string
  phone?: string
  /** Code PIN à 4 chiffres, unique à l'échelle du Fournisseur (tenant). */
  pin: string
  statut: DataosAgentStatut
  /** Formulaire auquel l'agent est assigné. */
  formulaireId: string
  lastActivity?: string
}
