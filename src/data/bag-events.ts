import type { BagEvent } from '@/types/bag-event'

// Historiques détaillés pour des sacs représentatifs
const histories: Record<string, BagEvent[]> = {

  // Sac complété (étape 5) — KLK-2025-001
  'qr-001': [
    {
      id: 'ev-001-1', stepOrder: 1, stepName: 'Collecte chez le producteur',
      agentName: 'Ibou Sarr', agentRole: 'Magasinier coopérative',
      timestamp: '20 oct. 2025, 08:14',
      entries: [
        { label: 'Producteur identifié', value: 'Mamadou Diallo' },
        { label: 'Nombre de sacs collectés', value: '4' },
      ],
    },
    {
      id: 'ev-001-2', stepOrder: 2, stepName: 'Pesée et contrôle humidité',
      agentName: 'Abdou Kane', agentRole: 'Responsable qualité',
      timestamp: '20 oct. 2025, 10:32',
      entries: [
        { label: 'Poids brut (kg)', value: '52,4' },
        { label: "Taux d'humidité (%)", value: '13,2' },
        { label: 'Résultat du contrôle', value: 'Conforme' },
      ],
    },
    {
      id: 'ev-001-3', stepOrder: 3, stepName: 'Chargement transport',
      agentName: 'Saliou Ba', agentRole: 'Transporteur',
      timestamp: '20 oct. 2025, 14:05',
      entries: [
        { label: 'Numéro de bordereau', value: 'BDR-2025-0042' },
        { label: 'Nombre de sacs chargés', value: '4' },
      ],
    },
    {
      id: 'ev-001-4', stepOrder: 4, stepName: 'Réception entrepôt',
      agentName: 'Moussa Cissé', agentRole: 'Magasinier agroindustriel',
      timestamp: '21 oct. 2025, 09:18',
      entries: [
        { label: 'Nombre de sacs reçus', value: '4' },
        { label: 'Date de réception', value: '21 oct. 2025' },
      ],
    },
    {
      id: 'ev-001-5', stepOrder: 5, stepName: 'Contrôle qualité final',
      agentName: 'Abdou Kane', agentRole: 'Responsable qualité',
      timestamp: '21 oct. 2025, 11:47',
      entries: [
        { label: 'Poids net (kg)', value: '50,1' },
        { label: "Taux d'impuretés (%)", value: '1,8' },
        { label: 'Décision qualité', value: 'Accepté' },
        { label: 'Observations', value: 'Qualité standard. Humidité dans les normes.' },
      ],
    },
  ],

  // Sac en cours (étape 3) — KLK-2025-028
  'qr-028': [
    {
      id: 'ev-028-1', stepOrder: 1, stepName: 'Collecte chez le producteur',
      agentName: 'Ibou Sarr', agentRole: 'Magasinier coopérative',
      timestamp: '21 oct. 2025, 07:58',
      entries: [
        { label: 'Producteur identifié', value: 'Ibrahima Sy' },
        { label: 'Nombre de sacs collectés', value: '3' },
      ],
    },
    {
      id: 'ev-028-2', stepOrder: 2, stepName: 'Pesée et contrôle humidité',
      agentName: 'Abdou Kane', agentRole: 'Responsable qualité',
      timestamp: '21 oct. 2025, 10:05',
      entries: [
        { label: 'Poids brut (kg)', value: '49,8' },
        { label: "Taux d'humidité (%)", value: '14,0' },
        { label: 'Résultat du contrôle', value: 'Conforme' },
      ],
    },
    {
      id: 'ev-028-3', stepOrder: 3, stepName: 'Chargement transport',
      agentName: 'Saliou Ba', agentRole: 'Transporteur',
      timestamp: '21 oct. 2025, 13:40',
      entries: [
        { label: 'Numéro de bordereau', value: 'BDR-2025-0051' },
        { label: 'Nombre de sacs chargés', value: '3' },
      ],
    },
  ],

  // Sac en cours (étape 4) — KLK-2025-034
  'qr-034': [
    {
      id: 'ev-034-1', stepOrder: 1, stepName: 'Collecte chez le producteur',
      agentName: 'Ibou Sarr', agentRole: 'Magasinier coopérative',
      timestamp: '20 oct. 2025, 09:22',
      entries: [
        { label: 'Producteur identifié', value: 'Ousmane Thiam' },
        { label: 'Nombre de sacs collectés', value: '5' },
      ],
    },
    {
      id: 'ev-034-2', stepOrder: 2, stepName: 'Pesée et contrôle humidité',
      agentName: 'Abdou Kane', agentRole: 'Responsable qualité',
      timestamp: '20 oct. 2025, 11:48',
      entries: [
        { label: 'Poids brut (kg)', value: '55,2' },
        { label: "Taux d'humidité (%)", value: '12,9' },
        { label: 'Résultat du contrôle', value: 'Conforme' },
      ],
    },
    {
      id: 'ev-034-3', stepOrder: 3, stepName: 'Chargement transport',
      agentName: 'Saliou Ba', agentRole: 'Transporteur',
      timestamp: '20 oct. 2025, 15:30',
      entries: [
        { label: 'Numéro de bordereau', value: 'BDR-2025-0047' },
        { label: 'Nombre de sacs chargés', value: '5' },
      ],
    },
    {
      id: 'ev-034-4', stepOrder: 4, stepName: 'Réception entrepôt',
      agentName: 'Moussa Cissé', agentRole: 'Magasinier agroindustriel',
      timestamp: '21 oct. 2025, 08:55',
      entries: [
        { label: 'Nombre de sacs reçus', value: '5' },
        { label: 'Date de réception', value: '21 oct. 2025' },
      ],
    },
  ],

  // Sac bloqué à l'étape 2 — KLK-2025-046
  'qr-046': [
    {
      id: 'ev-046-1', stepOrder: 1, stepName: 'Collecte chez le producteur',
      agentName: 'Ibou Sarr', agentRole: 'Magasinier coopérative',
      timestamp: '22 oct. 2025, 09:02',
      entries: [
        { label: 'Producteur identifié', value: 'Ibrahima Sy' },
        { label: 'Nombre de sacs collectés', value: '2' },
      ],
    },
    {
      id: 'ev-046-2', stepOrder: 2, stepName: 'Pesée et contrôle humidité',
      agentName: 'Abdou Kane', agentRole: 'Responsable qualité',
      timestamp: '22 oct. 2025, 11:14',
      entries: [
        { label: 'Poids brut (kg)', value: '48,7' },
        { label: "Taux d'humidité (%)", value: '24,1' },
        { label: 'Résultat du contrôle', value: 'Non conforme' },
      ],
    },
  ],

  // Sac bloqué à l'étape 2 — KLK-2025-047
  'qr-047': [
    {
      id: 'ev-047-1', stepOrder: 1, stepName: 'Collecte chez le producteur',
      agentName: 'Ibou Sarr', agentRole: 'Magasinier coopérative',
      timestamp: '22 oct. 2025, 09:18',
      entries: [
        { label: 'Producteur identifié', value: 'Rokhaya Ndiaye' },
        { label: 'Nombre de sacs collectés', value: '3' },
      ],
    },
    {
      id: 'ev-047-2', stepOrder: 2, stepName: 'Pesée et contrôle humidité',
      agentName: 'Abdou Kane', agentRole: 'Responsable qualité',
      timestamp: '22 oct. 2025, 11:30',
      entries: [
        { label: 'Poids brut (kg)', value: '61,3' },
        { label: "Taux d'humidité (%)", value: '15,1' },
        { label: 'Résultat du contrôle', value: 'Non conforme' },
      ],
    },
  ],
}

const STEP_NAMES = [
  'Collecte chez le producteur',
  'Pesée et contrôle humidité',
  'Chargement transport',
  'Réception entrepôt',
  'Contrôle qualité final',
]

const STEP_AGENTS = [
  { name: 'Ibou Sarr',    role: 'Magasinier coopérative'     },
  { name: 'Abdou Kane',   role: 'Responsable qualité'         },
  { name: 'Saliou Ba',    role: 'Transporteur'                },
  { name: 'Moussa Cissé', role: 'Magasinier agroindustriel'   },
  { name: 'Abdou Kane',   role: 'Responsable qualité'         },
]

// Génère des événements génériques pour les sacs sans historique détaillé
function generateGenericEvents(bagId: string, currentStep: number): BagEvent[] {
  const seed = parseInt(bagId.replace('qr-', ''), 10)
  return Array.from({ length: currentStep }, (_, i) => {
    const order = i + 1
    const agent = STEP_AGENTS[i]
    const baseDate = 20 + (seed % 4)
    return {
      id: `ev-${bagId}-${order}`,
      stepOrder: order,
      stepName: STEP_NAMES[i],
      agentName: agent.name,
      agentRole: agent.role,
      timestamp: `${baseDate} oct. 2025, ${(8 + i * 2).toString().padStart(2, '0')}:${(seed % 60).toString().padStart(2, '0')}`,
      entries: [{ label: 'Étape validée', value: 'Oui' }],
    }
  })
}

export function getBagEvents(bagId: string, currentStep: number): BagEvent[] {
  return histories[bagId] ?? generateGenericEvents(bagId, currentStep)
}
