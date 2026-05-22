import type { WorkflowStep } from '@/types/workflow-step'

export const workflowSteps: Record<string, WorkflowStep[]> = {
  'wf-001': [
    {
      id: 'step-1',
      order: 1,
      name: 'Collecte chez le producteur',
      description: 'Scan des sacs à la sortie du champ, identification du producteur.',
      agentRole: 'Magasinier coopérative',
      agentId: 'ag-001',
      validationType: 'form',
      questions: [
        { id: 'q-1-1', type: 'qr_batch',   label: 'Scanner les sacs' },
        { id: 'q-1-2', type: 'producteur',  label: 'Identifier le producteur' },
        { id: 'q-1-3', type: 'nombre',      label: 'Nombre de sacs collectés' },
      ],
    },
    {
      id: 'step-2',
      order: 2,
      name: 'Pesée et contrôle humidité',
      description: 'Pesée individuelle des sacs et mesure du taux d\'humidité.',
      agentRole: 'Responsable qualité',
      agentId: 'ag-002',
      validationType: 'form',
      questions: [
        { id: 'q-2-1', type: 'nombre',    label: 'Poids brut (kg)' },
        { id: 'q-2-2', type: 'nombre',    label: 'Taux d\'humidité (%)' },
        { id: 'q-2-3', type: 'selection', label: 'Résultat du contrôle' },
      ],
    },
    {
      id: 'step-3',
      order: 3,
      name: 'Chargement transport',
      description: 'Chargement dans le camion, attribution du numéro de bordereau.',
      agentRole: 'Transporteur',
      agentId: 'ag-003',
      validationType: 'form',
      questions: [
        { id: 'q-3-1', type: 'qr_batch', label: 'Scanner les sacs chargés' },
        { id: 'q-3-2', type: 'texte',    label: 'Numéro de bordereau' },
        { id: 'q-3-3', type: 'nombre',   label: 'Nombre de sacs chargés' },
      ],
    },
    {
      id: 'step-4',
      order: 4,
      name: 'Réception entrepôt',
      description: 'Déchargement et vérification des sacs à l\'arrivée.',
      agentRole: 'Magasinier agroindustriel',
      agentId: 'ag-004',
      validationType: 'form',
      questions: [
        { id: 'q-4-1', type: 'qr_batch', label: 'Scanner les sacs reçus' },
        { id: 'q-4-2', type: 'nombre',   label: 'Nombre de sacs reçus' },
        { id: 'q-4-3', type: 'date',     label: 'Date de réception' },
      ],
    },
    {
      id: 'step-5',
      order: 5,
      name: 'Contrôle qualité final',
      description: 'Analyse finale : humidité, impuretés, poids net. Validation ou rejet.',
      agentRole: 'Responsable qualité',
      agentId: 'ag-002',
      validationType: 'form',
      questions: [
        { id: 'q-5-1', type: 'nombre',    label: 'Poids net (kg)' },
        { id: 'q-5-2', type: 'nombre',    label: 'Taux d\'impuretés (%)' },
        { id: 'q-5-3', type: 'selection', label: 'Décision qualité' },
        { id: 'q-5-4', type: 'texte',     label: 'Observations' },
      ],
    },
  ],
}
