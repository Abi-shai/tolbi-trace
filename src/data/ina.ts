import type {
  LotINA, CarteINA, CarteStatut, IdentiteINA, TransactionINA,
  TransactionCategorie, TransactionSens,
} from '~/types/ina'

// Données mock INA — alignées sur le scénario de démo (product.md) :
// Coopérative Kaolack Maïs, campagne maïs, préfixe KLK.
// Les producteurId correspondent aux ids de src/data/producteurs.ts (1..10).

export const INA_DOUBLONS = 1

// ── Lot de démonstration ─────────────────────────────────────────────────────
export const lotsMock: LotINA[] = [
  { id: 'lot-klk-001', reference: 'KLK-L001', prefixe: 'KLK', quantite: 50, createdAt: '2026-06-01T09:00:00.000Z' },
]

// ── Cartes : 50 cartes réparties sur le cycle de vie ─────────────────────────
// p1..p7 activées ; p8 réémise (ancienne C0008 révoquée + nouvelle C0009 activée,
// même Numéro INA) ; puis stock distribué / imprimé / généré.
function carte(n: number, statut: CarteStatut, producteurId?: string): CarteINA {
  const base: CarteINA = {
    id:     `c-${n}`,
    serial: `KLK-C${String(n).padStart(4, '0')}`,
    lotId:  'lot-klk-001',
    statut,
    producteurId,
  }
  if (statut === 'activee')  base.activatedAt = '2026-06-15T10:00:00.000Z'
  if (statut === 'revoquee') { base.activatedAt = '2026-06-15T10:00:00.000Z'; base.revokedAt = '2026-06-28T14:00:00.000Z' }
  return base
}

export const cartesMock: CarteINA[] = [
  carte(1, 'activee', '1'),
  carte(2, 'activee', '2'),
  carte(3, 'activee', '3'),
  carte(4, 'activee', '4'),
  carte(5, 'activee', '5'),
  carte(6, 'activee', '6'),
  carte(7, 'activee', '7'),
  carte(8, 'revoquee', '8'),  // ancienne carte d'Ibrahima Cissé (perdue)
  carte(9, 'activee', '8'),   // réémission — même Numéro INA, nouveau serial
  ...[10, 11, 12, 13, 14, 15].map((n) => carte(n, 'distribuee')),     // 6 en stock agent
  ...Array.from({ length: 10 }, (_, i) => carte(16 + i, 'imprimee')), // 10 imprimées
  ...Array.from({ length: 25 }, (_, i) => carte(26 + i, 'generee')),  // 25 générées
]

// ── Identités INA (producteurs enrôlés) ──────────────────────────────────────
export const identitesMock: IdentiteINA[] = [
  { producteurId: '1', numeroIna: '20054112', prenom: 'Ousmane',  nom: 'Diop',     telephone: '773971370', cooperative: 'Kaolack Maïs', localite: 'Ndoffane',   enrolledAt: '2026-06-15T10:00:00.000Z' },
  { producteurId: '2', numeroIna: '20054113', prenom: 'Baye',     nom: 'Sow',      telephone: '774561230', cooperative: 'Kaolack Maïs', localite: 'Gandiaye',   enrolledAt: '2026-06-15T10:20:00.000Z' },
  { producteurId: '3', numeroIna: '20054114', prenom: 'Ameth',    nom: 'Thiam',    telephone: '771234560', cooperative: 'Kaolack Maïs', localite: 'Kaolack',    enrolledAt: '2026-06-16T09:10:00.000Z' },
  { producteurId: '4', numeroIna: '20054115', prenom: 'Pape',     nom: 'Ibrahima', telephone: '775432100', cooperative: 'Kaolack Maïs', localite: 'Nioro',      enrolledAt: '2026-06-16T11:00:00.000Z' },
  { producteurId: '5', numeroIna: '20054116', prenom: 'Samba',    nom: 'Diop',     telephone: '773876540', cooperative: 'Kaolack Maïs', localite: 'Guinguinéo', enrolledAt: '2026-06-17T08:40:00.000Z' },
  { producteurId: '6', numeroIna: '20054117', prenom: 'Fatou',    nom: 'Ndiaye',   telephone: '776543210', cooperative: 'Kaolack Maïs', localite: 'Kahone',     enrolledAt: '2026-06-17T15:30:00.000Z' },
  { producteurId: '7', numeroIna: '20054118', prenom: 'Mariama',  nom: 'Bâ',       telephone: '774321090', cooperative: 'Kaolack Maïs', localite: 'Latmingué',  enrolledAt: '2026-06-18T10:05:00.000Z' },
  { producteurId: '8', numeroIna: '20054119', prenom: 'Ibrahima', nom: 'Cissé',    telephone: '773219870', cooperative: 'Kaolack Maïs', localite: 'Sibassor',   enrolledAt: '2026-06-18T12:45:00.000Z' },
]

// ── Transactions — flux financiers de la campagne ────────────────────────────
// carteSerial = credential_id de la carte active du producteur (piste d'audit).
const SERIAL: Record<string, string> = {
  '1': 'KLK-C0001', '2': 'KLK-C0002', '3': 'KLK-C0003', '4': 'KLK-C0004',
  '5': 'KLK-C0005', '6': 'KLK-C0006', '7': 'KLK-C0007', '8': 'KLK-C0009',
}
const NUM: Record<string, string> = {
  '1': '20054112', '2': '20054113', '3': '20054114', '4': '20054115',
  '5': '20054116', '6': '20054117', '7': '20054118', '8': '20054119',
}
const LOC: Record<string, string> = {
  '1': 'Ndoffane', '2': 'Gandiaye', '3': 'Kaolack', '4': 'Nioro',
  '5': 'Guinguinéo', '6': 'Kahone', '7': 'Latmingué', '8': 'Sibassor',
}

let _txSeq = 0
function tx(
  pid: string, contrepartie: string, categorie: TransactionCategorie,
  sens: TransactionSens, montant: number, date: string,
): TransactionINA {
  _txSeq += 1
  return {
    id:           `tx-${_txSeq}`,
    producteurId: pid,
    numeroIna:    NUM[pid],
    carteSerial:  SERIAL[pid],
    contrepartie,
    categorie,
    sens,
    montant,
    date,
    localite:     LOC[pid],
  }
}

export const transactionsMock: TransactionINA[] = [
  // Ousmane Diop — campagne complète (déboursement → intrants → prestation → revente)
  tx('1', 'Banque Agricole du Sénégal', 'financement', 'entree', 150_000, '2026-06-20T09:00:00.000Z'),
  tx('1', 'Agrofourniture Kaolack',     'ressources',  'sortie',  45_000, '2026-06-22T11:30:00.000Z'),
  tx('1', 'ETA Diouf',                  'prestations', 'sortie',  20_000, '2026-06-25T08:15:00.000Z'),
  tx('1', 'Transport Ndiaye',           'transport',   'sortie',  12_000, '2026-07-01T16:00:00.000Z'),
  tx('1', 'AgroSénégal SA',             'revente',     'entree', 210_000, '2026-07-03T10:00:00.000Z'),
  // Baye Sow
  tx('2', 'Banque Agricole du Sénégal', 'financement', 'entree', 120_000, '2026-06-21T09:00:00.000Z'),
  tx('2', 'Agrofourniture Kaolack',     'ressources',  'sortie',  38_000, '2026-06-23T10:00:00.000Z'),
  tx('2', 'AgroSénégal SA',             'revente',     'entree', 175_000, '2026-07-04T10:00:00.000Z'),
  // Ameth Thiam
  tx('3', 'Banque Agricole du Sénégal', 'financement', 'entree', 100_000, '2026-06-22T09:00:00.000Z'),
  tx('3', 'Agrofourniture Kaolack',     'ressources',  'sortie',  30_000, '2026-06-24T10:00:00.000Z'),
  tx('3', 'ETA Diouf',                  'prestations', 'sortie',  18_000, '2026-06-27T09:00:00.000Z'),
  // Pape Ibrahima
  tx('4', 'Banque Agricole du Sénégal', 'financement', 'entree', 130_000, '2026-06-23T09:00:00.000Z'),
  tx('4', 'Transport Ndiaye',           'transport',   'sortie',  14_000, '2026-07-02T15:00:00.000Z'),
  // Samba Diop
  tx('5', 'Agrofourniture Kaolack',     'ressources',  'sortie',  42_000, '2026-06-26T10:00:00.000Z'),
  tx('5', 'AgroSénégal SA',             'revente',     'entree', 190_000, '2026-07-05T10:00:00.000Z'),
  // Ibrahima Cissé (carte réémise — flux sur la nouvelle carte C0009)
  tx('8', 'Banque Agricole du Sénégal', 'financement', 'entree', 110_000, '2026-06-30T09:00:00.000Z'),
  tx('8', 'Agrofourniture Kaolack',     'ressources',  'sortie',  36_000, '2026-07-02T10:00:00.000Z'),
]
