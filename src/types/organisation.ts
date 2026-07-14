// L'Organisation = le tenant de la plateforme (cf. CONTEXT.md + ADR-0009).
// « Fournisseur » n'est plus qu'un *type* d'organisation. Tout ce qui est
// org-scopé dans Paramètres (membres, abonnement, paiement) suit l'org active.

export type OrganisationType = 'agroindustriel' | 'cooperative' | 'hedge-fund'

export const ORGANISATION_TYPE_LABELS: Record<OrganisationType, string> = {
  agroindustriel: 'Agroindustriel',
  cooperative:    'Coopérative',
  'hedge-fund':   'Hedge fund / Banque',
}

// ── Accès par module (cf. CONTEXT.md « Accès (module) » + ADR-0014) ─────────────
// Les permissions se donnent PAR MODULE et sont portées par le RÔLE du membre —
// jamais posées membre par membre. Deux niveaux : Lecteur < Éditeur. L'ancien
// niveau « Admin » (contrôle total dans UN module) est retiré : « Admin » ne
// désigne plus qu'un rôle natif.
export type AccessLevel = 'lecteur' | 'editeur'

/** Couleur du badge DsBadge par niveau (Lecteur vert, Éditeur ambre). */
export type AccessBadgeColor = 'success' | 'warning'

export interface AccessLevelMeta {
  value:       AccessLevel
  label:       string
  description: string
  badgeColor:  AccessBadgeColor
}

export const ACCESS_LEVELS: AccessLevelMeta[] = [
  { value: 'lecteur', label: 'Lecteur', description: 'Lecture seule. Observe sans rien modifier.', badgeColor: 'success' },
  { value: 'editeur', label: 'Éditeur', description: 'Crée et modifie dans ce module.',            badgeColor: 'warning' },
]

export const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  lecteur: 'Lecteur',
  editeur: 'Éditeur',
}

export const ACCESS_BADGE_COLOR: Record<AccessLevel, AccessBadgeColor> = {
  lecteur: 'success',
  editeur: 'warning',
}

/** Accès portés par un rôle : id de module → niveau. L'absence de clé = aucun accès. */
export type ModuleAccess = Record<string, AccessLevel>

// ── Rôles (ADR-0014) ─────────────────────────────────────────────────────────────
// Un Rôle = paquet NOMMÉ de permissions, l'unique source d'accès d'un
// Collaborateur (exactement un rôle par membre, obligatoire dès l'invitation).
// Natifs : livrés avec le produit, non modifiables ni supprimables, accès complet
// à tous les modules — seuls leurs pouvoirs d'organisation diffèrent.
// Customs : nom + map module → niveau, rien d'autre (jamais de pouvoir d'org).
export type NativeRoleId = 'proprietaire' | 'super-admin' | 'admin'

export interface NativeRoleMeta {
  id:          NativeRoleId
  label:       string
  description: string
}

export const NATIVE_ROLES: NativeRoleMeta[] = [
  { id: 'proprietaire', label: 'Propriétaire', description: 'Le créateur de l’organisation. Tout, y compris l’abonnement, le paiement et la suppression. Unique et transférable.' },
  { id: 'super-admin',  label: 'Super-admin',  description: 'Gère les membres, les rôles et les agents. Accès complet à tous les modules, sans la facturation.' },
  { id: 'admin',        label: 'Admin',        description: 'Accès complet à tous les modules. Ne gère ni l’équipe ni la facturation.' },
]

export const NATIVE_ROLE_BY_ID: Record<NativeRoleId, NativeRoleMeta> = Object.fromEntries(
  NATIVE_ROLES.map((r) => [r.id, r]),
) as Record<NativeRoleId, NativeRoleMeta>

export function isNativeRoleId(id: string): id is NativeRoleId {
  return id in NATIVE_ROLE_BY_ID
}

/** Rôle custom : créé par l'Organisation, attribuable à ses Collaborateurs. */
export interface CustomRole {
  id:     string
  name:   string
  access: ModuleAccess
}

// ── Membre (User-dans-une-Organisation) ────────────────────────────────────────
export type MembreStatus = 'actif' | 'invite'

export interface Membre {
  id:            string
  prenom:        string
  nom:           string
  email:         string
  telephone?:    string
  avatarSrc?:    string
  /** Le rôle du membre — NativeRoleId ou id d'un CustomRole de l'org (ADR-0014). */
  roleId:        string
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
  /** Accès binaires par module (porte mobile, sans niveau) — l'Affectation à un
   *  travail (formulaire, étape) EXIGE le grant du module correspondant (ADR-0014). */
  modules:   string[]
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
  /** Modules inclus dans le plan de l'org — les autres sont désactivés au picker. */
  enabledModules: string[]
  /** Rôles custom de l'org (les natifs sont des constantes produit, cf. NATIVE_ROLES). */
  roles:          CustomRole[]
  plan:           Plan
  membres:        Membre[]
  agents:         OrgAgent[]
  paymentMethods: PaymentMethod[]
  invoices:       Invoice[]
}
