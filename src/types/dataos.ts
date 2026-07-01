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
export type QuestionFieldType = 'text' | 'phone' | 'date' | 'producteur'

// Un producteur de la liste prédéfinie alimentant une question « Liste de
// producteurs » (importée depuis un CSV : colonnes nom, prénom, identifiant).
// Sur le terrain, l'agent choisit dans cette liste — aucune saisie libre.
export interface ProducteurOption {
  id: string
  nom: string
  prenom: string
  identifiant: string
}

export interface Question {
  id: string
  fieldType: QuestionFieldType | null
  /** Titre/intitulé de la question, éditable via le panneau Paramètres. */
  label: string
  /** Réponse obligatoire sur le terrain (défaut : oui). */
  required?: boolean
  /** Indice affiché à l'agent pour préciser la question. */
  hint?: string
  /** Question dont dépend l'affichage de celle-ci (affichage conditionnel). */
  linkedQuestionId?: string | null
  /** Liste prédéfinie (type « Liste de producteurs ») importée depuis un CSV. */
  producteurs?: ProducteurOption[]
  /** Nom du fichier CSV importé pour alimenter la liste. */
  producteurSource?: string
}

// Patch appliqué depuis le panneau Paramètres d'une question.
export interface QuestionSettingsPatch {
  label?: string
  fieldType?: QuestionFieldType | null
  required?: boolean
  hint?: string
  linkedQuestionId?: string | null
  producteurs?: ProducteurOption[]
  producteurSource?: string
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
