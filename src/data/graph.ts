export type NodeType = 'step' | 'bag' | 'producer' | 'agent' | 'cooperative'
export type EdgeType = 'sequence' | 'scanned_at' | 'belongs_to' | 'assigned_to' | 'member_of'
export type NodeStatus = 'done' | 'in_progress' | 'pending' | 'blocked'

export interface GraphNode {
  id: string
  type: NodeType
  label: string

  status?: NodeStatus
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  type: EdgeType
}

export const graphNodes: GraphNode[] = [
  // Coopérative
  { id: 'coop-1', type: 'cooperative', label: 'Coop.\nKaolack Maïs' },

  // Étapes du workflow
  { id: 'step-1', type: 'step', label: '1 · Collecte',    status: 'in_progress' },
  { id: 'step-2', type: 'step', label: '2 · Pesée',       status: 'in_progress' },
  { id: 'step-3', type: 'step', label: '3 · Chargement',  status: 'in_progress' },
  { id: 'step-4', type: 'step', label: '4 · Réception',   status: 'in_progress' },
  { id: 'step-5', type: 'step', label: '5 · Qualité',     status: 'done'        },

  // Agents
  { id: 'agent-1', type: 'agent', label: 'Ibou Sarr' },
  { id: 'agent-2', type: 'agent', label: 'Abdou Kane' },
  { id: 'agent-3', type: 'agent', label: 'Saliou Ba' },
  { id: 'agent-4', type: 'agent', label: 'Moussa Cissé' },

  // Producteurs (5 représentatifs)
  { id: 'prod-1', type: 'producer', label: 'Mamadou\nDiallo' },
  { id: 'prod-2', type: 'producer', label: 'Fatou\nNdao' },
  { id: 'prod-3', type: 'producer', label: 'Ibrahima\nSy' },
  { id: 'prod-4', type: 'producer', label: 'Aissatou\nFaye' },
  { id: 'prod-5', type: 'producer', label: 'Ousmane\nThiam' },

  // Sacs — représentant les 4 états
  { id: 'bag-001', type: 'bag', label: '001' },
  { id: 'bag-003', type: 'bag', label: '003' },
  { id: 'bag-005', type: 'bag', label: '005' },
  { id: 'bag-008', type: 'bag', label: '008' },
  { id: 'bag-012', type: 'bag', label: '012' },
  { id: 'bag-022', type: 'bag', label: '022' },
  { id: 'bag-025', type: 'bag', label: '025' },
  { id: 'bag-028', type: 'bag', label: '028' },
  { id: 'bag-031', type: 'bag', label: '031' },
  { id: 'bag-034', type: 'bag', label: '034' },
  { id: 'bag-037', type: 'bag', label: '037' },
  { id: 'bag-042', type: 'bag', label: '042' },
  { id: 'bag-046', type: 'bag', label: '046' },
  { id: 'bag-047', type: 'bag', label: '047' },
]

export const graphEdges: GraphEdge[] = [
  // Séquence du workflow
  { id: 'e-s1-s2', source: 'step-1', target: 'step-2', type: 'sequence' },
  { id: 'e-s2-s3', source: 'step-2', target: 'step-3', type: 'sequence' },
  { id: 'e-s3-s4', source: 'step-3', target: 'step-4', type: 'sequence' },
  { id: 'e-s4-s5', source: 'step-4', target: 'step-5', type: 'sequence' },

  // Agents assignés aux étapes
  { id: 'e-ag1-s1', source: 'agent-1', target: 'step-1', type: 'assigned_to' },
  { id: 'e-ag2-s2', source: 'agent-2', target: 'step-2', type: 'assigned_to' },
  { id: 'e-ag3-s3', source: 'agent-3', target: 'step-3', type: 'assigned_to' },
  { id: 'e-ag4-s4', source: 'agent-4', target: 'step-4', type: 'assigned_to' },
  { id: 'e-ag2-s5', source: 'agent-2', target: 'step-5', type: 'assigned_to' },

  // Producteurs membres de la coopérative
  { id: 'e-p1-c', source: 'prod-1', target: 'coop-1', type: 'member_of' },
  { id: 'e-p2-c', source: 'prod-2', target: 'coop-1', type: 'member_of' },
  { id: 'e-p3-c', source: 'prod-3', target: 'coop-1', type: 'member_of' },
  { id: 'e-p4-c', source: 'prod-4', target: 'coop-1', type: 'member_of' },
  { id: 'e-p5-c', source: 'prod-5', target: 'coop-1', type: 'member_of' },

  // Sacs → producteur d'origine
  { id: 'e-b001-p1', source: 'bag-001', target: 'prod-1', type: 'belongs_to' },
  { id: 'e-b003-p2', source: 'bag-003', target: 'prod-2', type: 'belongs_to' },
  { id: 'e-b005-p3', source: 'bag-005', target: 'prod-3', type: 'belongs_to' },
  { id: 'e-b008-p4', source: 'bag-008', target: 'prod-4', type: 'belongs_to' },
  { id: 'e-b012-p5', source: 'bag-012', target: 'prod-5', type: 'belongs_to' },
  { id: 'e-b022-p1', source: 'bag-022', target: 'prod-1', type: 'belongs_to' },
  { id: 'e-b025-p2', source: 'bag-025', target: 'prod-2', type: 'belongs_to' },
  { id: 'e-b028-p3', source: 'bag-028', target: 'prod-3', type: 'belongs_to' },
  { id: 'e-b031-p4', source: 'bag-031', target: 'prod-4', type: 'belongs_to' },
  { id: 'e-b034-p5', source: 'bag-034', target: 'prod-5', type: 'belongs_to' },
  { id: 'e-b037-p1', source: 'bag-037', target: 'prod-1', type: 'belongs_to' },
  { id: 'e-b042-p2', source: 'bag-042', target: 'prod-2', type: 'belongs_to' },
  { id: 'e-b046-p3', source: 'bag-046', target: 'prod-3', type: 'belongs_to' },
  { id: 'e-b047-p4', source: 'bag-047', target: 'prod-4', type: 'belongs_to' },

  // Sacs → étape actuelle
  { id: 'e-b001-s5', source: 'bag-001', target: 'step-5', type: 'scanned_at' },
  { id: 'e-b003-s5', source: 'bag-003', target: 'step-5', type: 'scanned_at' },
  { id: 'e-b005-s5', source: 'bag-005', target: 'step-5', type: 'scanned_at' },
  { id: 'e-b008-s5', source: 'bag-008', target: 'step-5', type: 'scanned_at' },
  { id: 'e-b012-s5', source: 'bag-012', target: 'step-5', type: 'scanned_at' },
  { id: 'e-b022-s2', source: 'bag-022', target: 'step-2', type: 'scanned_at' },
  { id: 'e-b025-s2', source: 'bag-025', target: 'step-2', type: 'scanned_at' },
  { id: 'e-b028-s3', source: 'bag-028', target: 'step-3', type: 'scanned_at' },
  { id: 'e-b031-s3', source: 'bag-031', target: 'step-3', type: 'scanned_at' },
  { id: 'e-b034-s4', source: 'bag-034', target: 'step-4', type: 'scanned_at' },
  { id: 'e-b037-s1', source: 'bag-037', target: 'step-1', type: 'scanned_at' },
  { id: 'e-b042-s1', source: 'bag-042', target: 'step-1', type: 'scanned_at' },
  { id: 'e-b046-s2', source: 'bag-046', target: 'step-2', type: 'scanned_at' },
  { id: 'e-b047-s2', source: 'bag-047', target: 'step-2', type: 'scanned_at' },
]
