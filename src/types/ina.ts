// TOLBI INA — couche identité-credential (cf. CONTEXT.md + ADR-0013).
// INA credential le Producteur : le module ID possède l'identité, INA pose la
// Carte INA (jeton QR opaque + serial), le Wallet et les transactions, en
// référençant le producteur par id. Ces entités sont additives.

// Couleur de badge DsBadge. Principe (design-philosophy) : la couleur encode un
// signal (statut, alerte), elle ne décore pas. Par défaut, gris neutre.
export type BadgeColor = 'gray' | 'success' | 'error' | 'warning' | 'brand'

// ── Carte INA (credential) ───────────────────────────────────────────────────
// Cycle de vie d'une carte dans un lot (doc §2.4 / ADR-0013). Le Numéro INA reste
// logique (stable, non imprimé) ; ce qui est pré-imprimé sur la carte est le serial.
export type CarteStatut =
  | 'generee' | 'imprimee' | 'distribuee' | 'associee' | 'activee' | 'revoquee'

// Couleur = signal seulement : la carte active (success) et la carte révoquée
// (error) portent une couleur ; les états de pipeline restent neutres (gray).
export const CARTE_STATUT_META: Record<CarteStatut, { label: string; color: BadgeColor }> = {
  generee:    { label: 'Générée',    color: 'gray'    },
  imprimee:   { label: 'Imprimée',   color: 'gray'    },
  distribuee: { label: 'Distribuée', color: 'gray'    },
  associee:   { label: 'Associée',   color: 'gray'    },
  activee:    { label: 'Activée',    color: 'success' },
  revoquee:   { label: 'Révoquée',   color: 'error'   },
}

// ── Cycle de vie (3 niveaux) ─────────────────────────────────────────────────
// Les 6 statuts fins sont regroupés en 3 cycles présentés à l'utilisateur :
//   Émises    (créées/émises, pas encore liées à un producteur)
//   Activées  (liées à un producteur : carte active + wallet)
//   Révoquées
// Les statuts fins restent en interne (mock réaliste + horodatages de la fiche).
export type Cycle = 'emission' | 'activation' | 'revocation'

export const CYCLE_META: Record<Cycle, { label: string; color: BadgeColor; description: string }> = {
  emission:   { label: 'Émises',    color: 'gray',    description: 'Créées et émises, pas encore liées à un producteur.' },
  activation: { label: 'Activées',  color: 'success', description: 'Liées à un producteur : carte active.' },
  revocation: { label: 'Révoquées', color: 'error',   description: 'Révoquées (perte, vol ou détérioration).' },
}

export const CYCLE_ORDER: Cycle[] = ['emission', 'activation', 'revocation']

export function cycleOf(statut: CarteStatut): Cycle {
  if (statut === 'revoquee') return 'revocation'
  if (statut === 'activee' || statut === 'associee') return 'activation'
  return 'emission' // generee, imprimee, distribuee
}

export interface CarteINA {
  id:            string
  serial:        string          // serial pré-imprimé (per-carte ; change à la réémission)
  lotId:         string
  statut:        CarteStatut
  producteurId?: string          // renseigné dès l'association
  activatedAt?:  string          // ISO
  revokedAt?:    string          // ISO
}

// ── Lot INA ──────────────────────────────────────────────────────────────────
export interface LotINA {
  id:        string
  reference: string     // ex : KLK-L001
  prefixe:   string      // préfixe des serials
  quantite:  number
  createdAt: string      // ISO
}

// ── Transaction (INA) ─────────────────────────────────────────────────────────
// ⚠️ Une « transaction » INA n'est PAS financière : c'est un ÉVÉNEMENT LOGISTIQUE /
// FACTUEL rattaché au Numéro INA (le credential scanné sur le terrain) — ex.
// « remis 12 sacs à un agent ». Aucun montant, aucun flux d'argent. Le libellé UI
// reste « Transactions » (choix utilisateur) mais le contenu est factuel.
//
// Pas de catégorie ni de type : sur le terrain (mobile), l'agent ne choisit pas dans
// une liste — il saisit librement une explication de ce qu'il a constaté, et la
// quantité éventuelle vit dans ce texte. Le web n'est qu'un journal en lecture.
export interface TransactionINA {
  id:           string
  producteurId: string
  numeroIna:    string
  carteSerial:  string          // credential_id — piste d'audit (carte scannée)
  explication:  string          // texte libre saisi par l'agent au scan
  agent:        string          // qui a reçu / opéré (ex. « Magasinier coopérative »)
  date:         string          // ISO
  localite:     string          // lieu de l'événement
}

// ── Identité INA (producteur enrôlé dans INA) ─────────────────────────────────
// Le statut « active / révoquée » et la carte active sont dérivés des cartes.
// Carte associée à l'INA — Oui / Non (uniquement pour les producteurs à INA
// activé). Le « — » (pas de statut INA) est géré dans la vue, pas ici.
export type CarteAssociee = 'oui' | 'non'

export const CARTE_ASSOCIEE_META: Record<CarteAssociee, { label: string; color: BadgeColor }> = {
  'oui': { label: 'Oui', color: 'success' },
  'non': { label: 'Non', color: 'warning' },
}

export interface IdentiteINA {
  producteurId:  string
  numeroIna:     string       // = Producteur.ina (Numéro INA stable, logique)
  prenom:        string
  nom:           string
  telephone:     string
  cooperative:   string
  localite:      string
  enrolledAt:    string       // ISO
  carteAssociee: CarteAssociee   // carte associée à l'INA
}

export function formatDateFr(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Jour + mois court (« 05 juil. ») — utilisé dans le registre groupé par mois.
export function formatDayShort(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

// En-tête de groupe mensuel (« Juillet 2026 »).
export function formatMonthYear(iso: string): string {
  const s = new Date(iso).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}
