// L'Organisation = le tenant de la plateforme (cf. CONTEXT.md + ADR-0009).
// « Fournisseur » n'est plus qu'un *type* d'organisation. Tout ce qui est
// org-scopé dans Paramètres (membres, abonnement, paiement) suit l'org active.

export type OrganisationType = 'agroindustriel' | 'cooperative' | 'hedge-fund'

export const ORGANISATION_TYPE_LABELS: Record<OrganisationType, string> = {
  agroindustriel: 'Agroindustriel',
  cooperative:    'Coopérative',
  'hedge-fund':   'Hedge fund / Banque',
}

// ── Accès par module (cf. CONTEXT.md « Accès (module) » + ADR-0010) ─────────────
// Les permissions se donnent PAR MODULE, pas globalement. Pour chaque module
// qu'un Membre peut atteindre, il détient un unique niveau : Lecteur < Éditeur <
// Admin. « Admin » ici = contrôle total DANS ce module — aucune gouvernance org.
export type AccessLevel = 'lecteur' | 'editeur' | 'admin'

/** Couleur du badge DsBadge par niveau (Lecteur vert, Éditeur ambre, Admin rouge). */
export type AccessBadgeColor = 'success' | 'warning' | 'error'

export interface AccessLevelMeta {
  value:       AccessLevel
  label:       string
  description: string
  badgeColor:  AccessBadgeColor
}

export const ACCESS_LEVELS: AccessLevelMeta[] = [
  { value: 'lecteur', label: 'Lecteur', description: 'Lecture seule. Observe sans rien modifier.',      badgeColor: 'success' },
  { value: 'editeur', label: 'Éditeur', description: 'Crée et modifie dans ce module.',                 badgeColor: 'warning' },
  { value: 'admin',   label: 'Admin',   description: 'Contrôle total dans ce module (pas de gouvernance org).', badgeColor: 'error' },
]

export const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  lecteur: 'Lecteur',
  editeur: 'Éditeur',
  admin:   'Admin',
}

export const ACCESS_BADGE_COLOR: Record<AccessLevel, AccessBadgeColor> = {
  lecteur: 'success',
  editeur: 'warning',
  admin:   'error',
}

/** Accès d'un membre : id de module → niveau. L'absence de clé = aucun accès. */
export type ModuleAccess = Record<string, AccessLevel>

// ── Membre (User-dans-une-Organisation) ────────────────────────────────────────
export type MembreStatus = 'actif' | 'invite'

export interface Membre {
  id:            string
  prenom:        string
  nom:           string
  email:         string
  telephone?:    string
  avatarSrc?:    string
  /** Accès par module (moduleId → niveau). */
  access:        ModuleAccess
  /** Propriétaire (créateur) : gouvernance — membres, facturation, suppression. */
  proprietaire:  boolean
  status:        MembreStatus
  isCurrentUser: boolean
}

// ── Agent (org-level, Sprint 18) ────────────────────────────────────────────────
// L'Agent devient membre de l'org : identifiant = téléphone, mot de passe = code à
// 4 chiffres reçu par SMS + WhatsApp. Ne se connecte jamais au web (seulement l'app
// mobile). v1 : identité seule — l'affectation aux formulaires viendra du cadrage.
export type AgentStatut = 'actif' | 'inactif'

export interface OrgAgent {
  id:        string
  prenom:    string
  nom:       string
  telephone: string   // identifiant de connexion
  statut:    AgentStatut
}
// Note : le code à 4 chiffres de l'agent est PERSONNEL. Il le configure lui-même à
// sa première connexion sur l'app mobile. Le web ne le crée ni ne l'affiche jamais.

// ── Abonnement / plan ───────────────────────────────────────────────────────────
export type PlanStatus = 'essai' | 'actif'

export interface Plan {
  name:            string
  status:          PlanStatus
  trialDaysLeft?:  number
  creditsIncluded: number
  creditsUsed:     number
  renewsOn?:       string  // ISO date
  prix?:           string  // ex : « 150 000 FCFA / mois »
}

// ── Paiement ─────────────────────────────────────────────────────────────────────
export type CardBrand = 'visa' | 'mastercard'

export interface PaymentMethod {
  id:        string
  brand:     CardBrand
  last4:     string
  expMonth:  number
  expYear:   number
  isDefault: boolean
}

export type InvoiceStatus = 'payee' | 'en-attente' | 'echouee'

export const INVOICE_STATUS_META: Record<InvoiceStatus, { label: string; color: string }> = {
  payee:        { label: 'Payée',      color: 'success' },
  'en-attente': { label: 'En attente', color: 'warning' },
  echouee:      { label: 'Échouée',    color: 'error'   },
}

export interface Invoice {
  id:      string
  numero:  string
  date:    string  // ISO
  montant: string
  status:  InvoiceStatus
}

// ── Organisation ────────────────────────────────────────────────────────────────
export interface Organisation {
  id:             string
  name:           string
  type:           OrganisationType
  logoInitials:   string
  logoColor:      string  // hex, pour l'avatar du logo
  /** Le User connecté est-il Propriétaire de cette org ? (gouvernance). */
  isOwner:        boolean
  /** Modules inclus dans le plan de l'org — les autres sont désactivés au picker. */
  enabledModules: string[]
  plan:           Plan
  membres:        Membre[]
  agents:         OrgAgent[]
  paymentMethods: PaymentMethod[]
  invoices:       Invoice[]
}
