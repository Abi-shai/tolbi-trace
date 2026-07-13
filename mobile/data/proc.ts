/** Procurement (supply chain) data — ported from App Terrain.dc.html. */
import type { BadgeColor } from '../components/ds/Badge'

export interface ProcProcess {
  name: string; sub: string; badge: string; badgeC: BadgeColor
  count: string; pct: number; cta: string; primary: boolean
}
export const PROC_PROCESSES: ProcProcess[] = [
  { name: 'Supply chain Maïs', sub: 'AgriMaïs SA · lot LOT-MZ-0142 · 512 sacs', badge: 'Étape 4/6', badgeC: 'blue',
    count: '4 / 6 étapes validées', pct: 67, cta: 'Scanner à la réception', primary: true },
  { name: 'Collecte arachide Ndiaganiao', sub: 'Coop. Kaolack · groupage village', badge: 'Étape 2/5', badgeC: 'brand',
    count: '2 / 5 étapes validées', pct: 40, cta: 'Voir la chaîne', primary: false },
]

/** Supply-chain nodes (shown when opening a process). st = done | active | todo */
export interface ProcNode { name: string; meta: string; st: 'done' | 'active' | 'todo'; tag: string; tagC: BadgeColor }
export const PROC_NODES: ProcNode[] = [
  { name: 'Producteur · champ', meta: 'Récolte pesée · 6 producteurs · 640 sacs', st: 'done', tag: 'Validé', tagC: 'success' },
  { name: 'Collecte village', meta: 'Point de groupage Ndiaganiao · 640 sacs', st: 'done', tag: 'Validé', tagC: 'success' },
  { name: 'Transport', meta: 'Camion SN-4821-KL · en route · 512 sacs', st: 'done', tag: 'Validé', tagC: 'success' },
  { name: 'Réception magasin', meta: 'Votre étape · 18 / 512 sacs scannés', st: 'active', tag: 'En cours', tagC: 'brand' },
  { name: 'Pesée & qualité', meta: 'Contrôle humidité · en attente', st: 'todo', tag: 'À venir', tagC: 'gray' },
  { name: 'Provendier', meta: 'Livraison finale AgriMaïs · en attente', st: 'todo', tag: 'À venir', tagC: 'gray' },
]

export interface ProcEvent { icon: string; iconBg: string; iconC: string; title: string; sub: string; time: string }
export const PROC_EVENTS: ProcEvent[] = [
  { icon: 'check-circle', iconBg: '#DCFAE6', iconC: '#079455', title: '18 sacs reçus au magasin', sub: 'Réception · Amadou Ba', time: '14:36' },
  { icon: 'grid', iconBg: '#B2D1C1', iconC: '#044B28', title: 'Lot LOT-MZ-0142 transporté', sub: 'Transport · camion SN-4821-KL', time: '11:20' },
  { icon: 'alert-triangle', iconBg: '#FEF0C7', iconC: '#DC6803', title: 'Écart de 12 sacs signalé', sub: 'Transport → Réception · à vérifier', time: '11:18' },
  { icon: 'download', iconBg: '#F2F4F7', iconC: '#475467', title: '640 sacs groupés au village', sub: 'Collecte · Khady Ndour', time: '08:05' },
]
