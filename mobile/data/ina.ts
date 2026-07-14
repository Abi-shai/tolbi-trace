/** ID · INA (Identité Numérique Agricole) module data. */
import type { BadgeColor } from '../components/ds/Badge'

export const INA_STATS = { members: 128, withIna: 114, withoutIna: 14, coverage: 89 }

export interface InaCandidate { init: string; name: string; village: string }
export const INA_CANDS: InaCandidate[] = [
  { init: 'FF', name: 'Fatou Fall', village: 'Ndoffane · Arachide · 1,2 ha' },
  { init: 'OS', name: 'Ousmane Sow', village: 'Keur Madior · Maïs · 0,9 ha' },
  { init: 'AD', name: 'Aïssatou Dia', village: 'Nioro · Arachide · 2,1 ha' },
]

/** OTP the producer dictates to consent to the INA emission. */
export const INA_OTP = '4831'
/** Number assigned to the newly emitted card. */
export const INA_NEW_NUMBER = 'INA-SN-04262'

export interface InaRecent { num: string; who: string; status: string; statusColor: BadgeColor }
export const INA_RECENT: InaRecent[] = [
  { num: 'INA-SN-04217', who: 'Ibrahima Diop · aujourd’hui', status: 'Synchronisée', statusColor: 'success' },
  { num: 'INA-SN-04251', who: 'Fatou Fall · aujourd’hui', status: 'À synchroniser', statusColor: 'warning' },
  { num: 'INA-SN-04203', who: 'Moussa Sarr · hier', status: 'Synchronisée', statusColor: 'success' },
]

/* ── Scan : résolution contre le registre local ─────────────────────
 * Le scan lit le QR de la carte, puis résout le numéro contre la copie
 * locale du registre KYF (offline-first). L'état du réseau ne change que
 * le message du cas « inconnu ». */

export type InaScan =
  | { kind: 'member'; num: string; init: string; name: string; village: string; org: string; pending: boolean }
  | { kind: 'other-org'; num: string; init: string; name: string; org: string; region: string }
  | { kind: 'unknown'; num: string }
  | { kind: 'not-ina'; raw: string }

/** Membres de mon organisation présents dans le registre local. */
const INA_MEMBERS = [
  { num: 'INA-SN-04217', init: 'ID', name: 'Ibrahima Diop', village: 'Ndiaganiao', org: 'Coop. Kaolack', pending: false },
  { num: 'INA-SN-04251', init: 'FF', name: 'Fatou Fall', village: 'Ndoffane', org: 'Coop. Kaolack', pending: true },
  { num: 'INA-SN-04203', init: 'MS', name: 'Moussa Sarr', village: 'Keur Madior', org: 'Coop. Kaolack', pending: false },
]

/** INA valides au registre mais rattachées à une autre organisation. */
const INA_OTHER_ORG = [
  { num: 'INA-SN-03102', init: 'AN', name: 'Awa Ndiaye', org: 'Union Ndiambour', region: 'Louga' },
]

const INA_FORMAT = /INA-[A-Z]{2}-\d{5}/

export function resolveIna(payload: string): InaScan {
  const match = payload.toUpperCase().match(INA_FORMAT)
  if (!match) return { kind: 'not-ina', raw: payload }
  const num = match[0]
  const member = INA_MEMBERS.find((m) => m.num === num)
  if (member) return { kind: 'member', ...member }
  const other = INA_OTHER_ORG.find((o) => o.num === num)
  if (other) return { kind: 'other-org', ...other }
  return { kind: 'unknown', num }
}

/** Scans simulés pour la démo (les QR du prototype ne sont pas encodés). */
export const INA_DEMO_SCANS = [
  { label: 'Membre', payload: 'INA-SN-04217' },
  { label: 'À synchroniser', payload: 'INA-SN-04251' },
  { label: 'Autre organisation', payload: 'INA-SN-03102' },
  { label: 'Inconnue', payload: 'INA-SN-09999' },
  { label: 'QR étranger', payload: 'https://exemple.sn/promo' },
]
