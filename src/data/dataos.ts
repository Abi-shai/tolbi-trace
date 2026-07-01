import type { Projet, FormulaireTemplate, QuestionFieldOption, ProducteurOption } from '~/types/dataos'
import type { Producteur } from '~/types/producteur'
import { producteursMock } from '~/data/producteurs'

// Liste prédéfinie chargée lors de l'import CSV d'une question « Liste de
// producteurs ». Mock aligné sur le scénario de démo (Coopérative Kaolack Maïs),
// dérivé de la source de vérité producteurs du module ID.
// Mapping colonnes attendues (nom · prénom · identifiant) → données mock.
export const producteurListeMock: ProducteurOption[] = producteursMock.map((p) => ({
  id:          p.id,
  nom:         p.nom,
  prenom:      p.prenom,
  identifiant: p.ina,
}))

// Producteurs collectés sur le terrain via un formulaire, en attente de
// synchronisation vers KYF (TOLBI ID). Voir TOQ-559.
export const collecteProducteursMock: Producteur[] = [
  { id: 'col-1', prenom: 'Awa',      nom: 'Sarr',    codeParcelles: 'KLK-0101', ina: '20054201', telephone: '770010201', cooperative: 'Kaolack Maïs' },
  { id: 'col-2', prenom: 'Cheikh',   nom: 'Gueye',   codeParcelles: 'KLK-0102', ina: '20054202', telephone: '770010202', cooperative: 'Kaolack Maïs' },
  { id: 'col-3', prenom: 'Ndeye',    nom: 'Faye',    codeParcelles: 'KLK-0103', ina: '20054203', telephone: '770010203', cooperative: 'Kaolack Maïs' },
  { id: 'col-4', prenom: 'Moustapha',nom: 'Kane',    codeParcelles: 'KLK-0104', ina: '20054204', telephone: '770010204', cooperative: 'Kaolack Maïs' },
  { id: 'col-5', prenom: 'Bineta',   nom: 'Diouf',   codeParcelles: 'KLK-0105', ina: '20054205', telephone: '770010205', cooperative: 'Kaolack Maïs' },
  { id: 'col-6', prenom: 'Lamine',   nom: 'Ba',      codeParcelles: 'KLK-0106', ina: '20054206', telephone: '770010206', cooperative: 'Kaolack Maïs' },
  { id: 'col-7', prenom: 'Khady',    nom: 'Mbaye',   codeParcelles: 'KLK-0107', ina: '20054207', telephone: '770010207', cooperative: 'Kaolack Maïs' },
  { id: 'col-8', prenom: 'Serigne',  nom: 'Lo',      codeParcelles: 'KLK-0108', ina: '20054208', telephone: '770010208', cooperative: 'Kaolack Maïs' },
]

// Suivi des réponses : données collectées et leur stade de validation.
export type SuiviStade = 'accepte' | 'en-cours' | 'rejete'

export interface SuiviReponse {
  id: string
  niveau: string
  stade: SuiviStade
  culture: string
  nomEnqueteur: string
  prenomEnqueteur: string
}

export const reponsesStats = { total: 1000, valides: 650, enCours: 350 }

export const reponsesMock: SuiviReponse[] = [
  { id: 'r1', niveau: 'Géométrie',     stade: 'accepte',  culture: 'Arachide', nomEnqueteur: 'Ndiaye', prenomEnqueteur: 'Ousseynou' },
  { id: 'r2', niveau: 'Surface',       stade: 'accepte',  culture: 'Arachide', nomEnqueteur: 'Sabaly', prenomEnqueteur: 'Issaga' },
  { id: 'r3', niveau: 'Chevauchement', stade: 'en-cours', culture: 'Arachide', nomEnqueteur: 'Ndiaye', prenomEnqueteur: 'Ousseynou' },
  { id: 'r4', niveau: 'Photo',         stade: 'en-cours', culture: 'Arachide', nomEnqueteur: 'Ndiaye', prenomEnqueteur: 'Ousseynou' },
  { id: 'r5', niveau: 'Photo',         stade: 'en-cours', culture: 'Niébé',    nomEnqueteur: 'Ndiaye', prenomEnqueteur: 'Ousseynou' },
  { id: 'r6', niveau: 'Photo',         stade: 'en-cours', culture: 'Niébé',    nomEnqueteur: 'Ndiaye', prenomEnqueteur: 'Ousseynou' },
  { id: 'r7', niveau: 'Photo',         stade: 'rejete',   culture: 'Niébé',    nomEnqueteur: 'Ndiaye', prenomEnqueteur: 'Ousseynou' },
  { id: 'r8', niveau: 'Photo',         stade: 'accepte',  culture: 'Arachide', nomEnqueteur: 'Sabaly', prenomEnqueteur: 'Issaga' },
  { id: 'r9', niveau: 'Photo',         stade: 'accepte',  culture: 'Arachide', nomEnqueteur: 'Sabaly', prenomEnqueteur: 'Issaga' },
]

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
