export interface StepProgress {
  stepId: string
  order: number
  name: string
  agentRole: string
  bagsTotal: number
  bagsCompleted: number
  bagsInProgress: number
}

export interface ActiveAgent {
  id: string
  name: string
  role: string
  currentStep: string
  bagsScanned: number
  bagsTarget: number
  lastSeen: string
}

export interface RecentEvent {
  id: string
  bagCode: string
  stepName: string
  agentName: string
  action: 'validated' | 'started'
  timestamp: string
  isoDate: string
}

export const stepProgress: StepProgress[] = [
  {
    stepId: 'step-1',
    order: 1,
    name: 'Collecte chez le producteur',
    agentRole: 'Magasinier coopérative',
    bagsTotal: 0,
    bagsCompleted: 38,
    bagsInProgress: 10,
  },
  {
    stepId: 'step-2',
    order: 2,
    name: 'Pesée et contrôle humidité',
    agentRole: 'Responsable qualité',
    bagsTotal: 38,
    bagsCompleted: 28,
    bagsInProgress: 8,
  },
  {
    stepId: 'step-3',
    order: 3,
    name: 'Chargement transport',
    agentRole: 'Transporteur',
    bagsTotal: 28,
    bagsCompleted: 23,
    bagsInProgress: 4,
  },
  {
    stepId: 'step-4',
    order: 4,
    name: 'Réception entrepôt',
    agentRole: 'Magasinier agroindustriel',
    bagsTotal: 23,
    bagsCompleted: 20,
    bagsInProgress: 3,
  },
  {
    stepId: 'step-5',
    order: 5,
    name: 'Contrôle qualité final',
    agentRole: 'Responsable qualité',
    bagsTotal: 20,
    bagsCompleted: 20,
    bagsInProgress: 0,
  },
]

export const activeAgents: ActiveAgent[] = [
  {
    id: 'agent-1',
    name: 'Ibou Sarr',
    role: 'Magasinier coopérative',
    currentStep: 'Collecte chez le producteur',
    bagsScanned: 6,
    bagsTarget: 10,
    lastSeen: 'Il y a 8 min',
  },
  {
    id: 'agent-2',
    name: 'Abdou Kane',
    role: 'Responsable qualité',
    currentStep: 'Pesée et contrôle humidité',
    bagsScanned: 4,
    bagsTarget: 8,
    lastSeen: 'Il y a 2 min',
  },
  {
    id: 'agent-3',
    name: 'Saliou Ba',
    role: 'Transporteur',
    currentStep: 'Chargement transport',
    bagsScanned: 5,
    bagsTarget: 8,
    lastSeen: 'Il y a 31 min',
  },
]

export const recentEvents: RecentEvent[] = [
  {
    id: 'ev-1',
    bagCode: 'KLK-2025-035',
    stepName: 'Réception entrepôt',
    agentName: 'Moussa Cissé',
    action: 'validated',
    timestamp: 'Il y a 5 min',
    isoDate: '2025-11-15',
  },
  {
    id: 'ev-2',
    bagCode: 'KLK-2025-034',
    stepName: 'Réception entrepôt',
    agentName: 'Moussa Cissé',
    action: 'validated',
    timestamp: 'Il y a 7 min',
    isoDate: '2025-11-15',
  },
  {
    id: 'ev-3',
    bagCode: 'KLK-2025-033',
    stepName: 'Chargement transport',
    agentName: 'Saliou Ba',
    action: 'validated',
    timestamp: 'Il y a 31 min',
    isoDate: '2025-11-15',
  },
  {
    id: 'ev-4',
    bagCode: 'KLK-2025-032',
    stepName: 'Pesée et contrôle humidité',
    agentName: 'Abdou Kane',
    action: 'validated',
    timestamp: 'Il y a 45 min',
    isoDate: '2025-11-15',
  },
  {
    id: 'ev-5',
    bagCode: 'KLK-2025-031',
    stepName: 'Collecte chez le producteur',
    agentName: 'Ibou Sarr',
    action: 'started',
    timestamp: 'Il y a 52 min',
    isoDate: '2025-11-15',
  },
  {
    id: 'ev-6',
    bagCode: 'KLK-2025-029',
    stepName: 'Contrôle qualité final',
    agentName: 'Abdou Kane',
    action: 'validated',
    timestamp: 'Hier, 16:42',
    isoDate: '2025-11-14',
  },
  {
    id: 'ev-7',
    bagCode: 'KLK-2025-028',
    stepName: 'Chargement transport',
    agentName: 'Saliou Ba',
    action: 'validated',
    timestamp: 'Hier, 15:10',
    isoDate: '2025-11-14',
  },
  {
    id: 'ev-8',
    bagCode: 'KLK-2025-021',
    stepName: 'Collecte chez le producteur',
    agentName: 'Ibou Sarr',
    action: 'started',
    timestamp: '13/11, 11:05',
    isoDate: '2025-11-13',
  },
]

// 7-day sparkline data (Nov 9–15) for each KPI
export const kpiTrends = {
  total:      [38, 40, 41, 44, 46, 47, 48],
  completed:  [8,  11, 14, 16, 18, 19, 20],
  inProgress: [18, 17, 16, 16, 14, 14, 15],
  pending:    [12, 12, 11, 12, 14, 11, 10],
}
