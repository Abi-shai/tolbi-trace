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
