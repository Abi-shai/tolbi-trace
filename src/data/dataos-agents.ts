import type { DataosAgent } from '~/types/dataos-agent'

// Roster de démonstration semé (à la volée) sur chaque Formulaire ouvert.
// Les deux premiers noms sont ceux qui apparaissent dans « Suivi des réponses »
// (Ndiaye Ousseynou, Sabaly Issaga) pour que les onglets d'un formulaire
// racontent une seule histoire.
export type DataosAgentSeed = Omit<DataosAgent, 'id' | 'formulaireId'>

export const dataosAgentsSeed: DataosAgentSeed[] = [
  { name: 'Ousseynou Ndiaye', phone: '+221 77 123 45 67', pin: '4821', statut: 'actif', lastActivity: 'Hier, 15h00' },
  { name: 'Issaga Sabaly',    phone: '+221 70 234 56 78', pin: '7395', statut: 'actif', lastActivity: "Aujourd'hui, 9h30" },
  { name: 'Aminata Fall',     phone: '+221 76 345 67 89', pin: '2057', statut: 'actif', lastActivity: 'Hier, 11h15' },
  { name: 'Modou Faye',       phone: '+221 78 456 78 90', pin: '6130', statut: 'actif', lastActivity: 'Il y a 2 jours' },
]
