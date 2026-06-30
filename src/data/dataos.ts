import type { Projet, FormulaireTemplate, QuestionFieldOption } from '~/types/dataos'

// Questions prédéfinies proposées dans le sélecteur d'une carte question.
export const questionFieldOptions: QuestionFieldOption[] = [
  { id: 'prenom',         label: 'Prénom',                  fieldType: 'text'  },
  { id: 'nom',            label: 'Nom',                     fieldType: 'text'  },
  { id: 'telephone',      label: 'Numéro de téléphone',     fieldType: 'phone' },
  { id: 'date_naissance', label: 'Date de naissance',       fieldType: 'date'  },
  { id: 'cni',            label: 'Pièce d’identité (CNI)',  fieldType: 'text'  },
]

let qSeq = 0
const q = (label: string, fieldType: 'text' | 'phone' | 'date') => ({
  id: `q-tpl-${++qSeq}`,
  fieldType,
  label,
})

// Modèles de formulaire proposés via « Utiliser un template ».
export const formulaireTemplates: FormulaireTemplate[] = [
  {
    id: 'tpl-recensement',
    name: 'Recensement producteur',
    description: 'Identité du producteur, contact et coopérative.',
    questions: [
      q('Prénom', 'text'),
      q('Numéro de téléphone', 'phone'),
      q('Date de naissance', 'date'),
    ],
  },
  {
    id: 'tpl-parcelle',
    name: 'Cartographie de parcelle',
    description: 'Géolocalisation et surface des parcelles.',
    questions: [
      q('Nom de la parcelle', 'text'),
    ],
  },
  {
    id: 'tpl-socio',
    name: 'Enquête socio-économique',
    description: 'Données sur le ménage et l’exploitation.',
    questions: [
      q('Prénom', 'text'),
      q('Nom', 'text'),
    ],
  },
]

// Données mock alignées sur le scénario de démo :
// Client AgroSénégal SA · Coopérative Kaolack Maïs · campagne maïs nov. 2025.
export const projetsMock: Projet[] = [
  {
    id:          'prj-001',
    name:        'Pilote_Mais_Sud',
    description: 'Recensement des producteurs de maïs — bassin sud de Kaolack.',
    formulaires: 2,
    reponses:    148,
    agents:      3,
    createdAt:   '2025-06-12',
    createdBy:   'Awa Thiam',
  },
  {
    id:          'prj-002',
    name:        'Enquête_Humidité_Récolte',
    description: 'Relevés d’humidité au champ avant la pesée.',
    formulaires: 1,
    reponses:    0,
    agents:      0,
    createdAt:   '2025-06-24',
    createdBy:   'Moussa Diop',
  },
  {
    id:          'prj-003',
    name:        'Recensement_Arachide_2024',
    description: 'Campagne arachide 2024.',
    formulaires: 3,
    reponses:    512,
    agents:      6,
    createdAt:   '2024-10-03',
    createdBy:   'Awa Thiam',
  },
]
