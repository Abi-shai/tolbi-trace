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

// Étapes affichées dans la progression d'un lot (l'état terminal « révoquée » à part).
export const CARTE_STATUT_FLOW: CarteStatut[] = ['generee', 'imprimee', 'distribuee', 'activee']

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
export type TransactionCategorie =
  | 'financement' | 'ressources' | 'prestations' | 'transport' | 'revente'

// La catégorie est une classification, pas une alerte : texte neutre, aucune
// couleur. Le seul signal coloré d'une ligne est le montant (entrée = success).
export const TRANSACTION_CATEGORIE_META: Record<TransactionCategorie, { label: string }> = {
  financement: { label: 'Financement'          },
  ressources:  { label: 'Ressources agricoles' },
  prestations: { label: 'Prestations'          },
  transport:   { label: 'Transport'            },
  revente:     { label: 'Revente'              },
}

export type TransactionSens = 'entree' | 'sortie'

export interface TransactionINA {
  id:           string
  producteurId: string
  numeroIna:    string
  carteSerial:  string      // credential_id — piste d'audit
  contrepartie: string
  categorie:    TransactionCategorie
  sens:         TransactionSens
  montant:      number       // FCFA
  date:         string       // ISO
  localite:     string       // géolocalisation (libellé)
}

// ── Identité INA (producteur enrôlé dans INA) ─────────────────────────────────
// Le statut « active / révoquée » et la carte active sont dérivés des cartes ;
// le wallet est dérivé des transactions (cf. store).
export interface IdentiteINA {
  producteurId: string
  numeroIna:    string       // = Producteur.ina (Numéro INA stable, logique)
  prenom:       string
  nom:          string
  telephone:    string
  cooperative:  string
  localite:     string
  enrolledAt:   string       // ISO
}

export interface Wallet {
  solde:   number
  entrees: number
  sorties: number
}

export function formatFcfa(n: number): string {
  return `${n.toLocaleString('fr-FR')} FCFA`
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
