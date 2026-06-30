// Data OS (ex: Survey) — module de collecte de données terrain.
// Un Projet est un conteneur de collecte générique (non typé) : il contient
// des formulaires et les réponses collectées par les agents terrain.

export interface Projet {
  id: string
  name: string
  description?: string
  // Un Projet n'a pas de statut : le statut vit sur les formulaires qu'il contient.
  /** Nombre de formulaires définis dans le projet. */
  formulaires: number
  /** Nombre de réponses collectées sur le terrain. */
  reponses: number
  /** Nombre d'agents déployés sur le projet. */
  agents: number
  /** Date de création (ISO, AAAA-MM-JJ). */
  createdAt: string
  /** Auteur du projet. */
  createdBy: string
}

// Invitation d'un utilisateur à collaborer sur un projet.
export type MembreRole = 'lecteur' | 'editeur' | 'admin'

export interface Invitation {
  id: string
  projetId: string
  email: string
  role: MembreRole
  sentAt: string
}

// Modèle de formulaire prêt à l'emploi (point de départ d'une collecte).
export interface FormulaireTemplate {
  id: string
  name: string
  description: string
  questions: Question[]
}

// Question prédéfinie proposée dans le sélecteur d'une carte question.
export interface QuestionFieldOption {
  id: string
  label: string
  fieldType: QuestionFieldType
}

// Une question d'un formulaire. `fieldType` reste null tant qu'aucun type
// n'a été choisi (état placeholder de la carte question).
export type QuestionFieldType = 'text' | 'phone' | 'date'

export interface Question {
  id: string
  fieldType: QuestionFieldType | null
  label: string
}

// Contrairement au Projet, un Formulaire porte un statut (cycle de vie).
export type FormulaireStatus = 'brouillon' | 'publie'

export interface Formulaire {
  id: string
  /** Projet auquel appartient le formulaire. */
  projetId: string
  name: string
  description?: string
  status: FormulaireStatus
  /** Questions composant le formulaire. */
  questions: Question[]
  /** Nombre de réponses collectées via ce formulaire. */
  reponses: number
  /** Date de création (ISO, AAAA-MM-JJ). */
  createdAt: string
  /** Auteur du formulaire. */
  createdBy: string
}
