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

// ── Analytiques (onglet d'un formulaire) ──
// Visualisation des données collectées : une carte-graphique par question
// sélectionnée. Données de démo dédiées, découplées des vraies questions du
// builder (le modèle Question n'a pas de type « choix » ni de réponses stockées).

export type AnalyticsChartType = 'barre' | 'circulaire' | 'ligne'

// Une catégorie de réponse (ex: « Cacao ») et sa valeur par période.
// Les séries alimentent directement les barres/lignes ; le camembert dérive
// de la somme des valeurs de chaque série sur la période.
export interface AnalyticsSeries {
  name: string
  /** Couleur de la série (hex). Cultures : cacao/riz extraits du Figma. */
  color: string
  /** Une valeur par bucket de `periods`, même longueur. */
  values: number[]
}

// Une question analysable, rendue comme une carte-graphique.
export interface AnalyticsQuestion {
  id: string
  label: string
  /** Buckets de l'axe X (axe temporel « Période »). */
  periods: string[]
  series: AnalyticsSeries[]
  /** Type de graphe affiché par défaut, surchargé par carte. */
  defaultChart: AnalyticsChartType
}

// Cartouches de tête de l'onglet Analytiques.
export interface AnalyticsSummary {
  producteurs: number
  parcelles: number
  surfaceHa: number
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
  /** Agents (roster de l'org) affectés à ce formulaire — ils le collectent sur
   *  l'app mobile. Cf. ADR-0012 (Affectation). Références d'`OrgAgent.id`. */
  agentIds?: string[]
  /** Nombre de réponses collectées via ce formulaire. */
  reponses: number
  /** Date de création (ISO, AAAA-MM-JJ). */
  createdAt: string
  /** Auteur du formulaire. */
  createdBy: string
}
