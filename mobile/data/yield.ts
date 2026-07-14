/** Yield module data — ported from App Terrain.dc.html `data-dc-script`. */
import type { BadgeColor } from '../components/ds/Badge'

export interface YieldProject {
  name: string; ha: string; period: string; culture: string
  rdt: string; nprod: number; badge: string; badgeC: BadgeColor
}
export const YIELD_PROJECTS: YieldProject[] = [
  { name: 'Arachide · Hivernale 2026', ha: '4 200 ha', period: '01 juin – 30 nov. 2026', culture: 'Arachide', rdt: '1,24', nprod: 128, badge: 'Floraison', badgeC: 'success' },
  { name: 'Maïs · Nioro 2026', ha: '2 600 ha', period: '15 juin – 15 déc. 2026', culture: 'Maïs', rdt: '1,08', nprod: 74, badge: 'Maturation', badgeC: 'warning' },
]

export interface YieldProducer {
  init: string; name: string; meta: string
  rdt: string; prod: string; conf: string; delta: string; up: boolean
  stade: string; village: string
  soil: string; hum: number; stress: boolean; alertTxt?: string; advice: string
}
export const YIELD_PRODUCERS: YieldProducer[] = [
  { init: 'ID', name: 'Ibrahima Diop', meta: 'Arachide · 2,4 ha · Ndiaganiao', rdt: '1,32', prod: '3,2', conf: '88 %', delta: '+9 %', up: true, stade: 'Floraison', village: 'Ndiaganiao',
    soil: 'Sablo-limoneux', hum: 34, stress: false, advice: 'Sol correctement humide et pic de pluie en S31 : conditions favorables. Conseillez l’apport d’engrais de couverture avant la S31.' },
  { init: 'AN', name: 'Awa Ndiaye', meta: 'Arachide · 1,8 ha · Keur Madior', rdt: '1,27', prod: '2,3', conf: '86 %', delta: '+6 %', up: true, stade: 'Floraison', village: 'Keur Madior',
    soil: 'Sableux (Dior)', hum: 29, stress: true, alertTxt: 'humidité sous 25 % probable dans 6 jours si la pluie de S30 est faible.',
    advice: 'Sol sableux drainant : conseillez un sarclo-binage pour limiter l’évaporation et surveillez la parcelle après le 14 juillet.' },
  { init: 'MS', name: 'Moussa Sarr', meta: 'Maïs · 3,1 ha · Nioro', rdt: '1,08', prod: '3,3', conf: '84 %', delta: '-4 %', up: false, stade: 'Maturation', village: 'Nioro',
    soil: 'Argilo-sableux', hum: 22, stress: true, alertTxt: 'stress hydrique en cours (22 %) au stade maturation — impact rendement estimé -4 %.',
    advice: 'Maturation avancée sous stress : conseillez d’anticiper la récolte sur les zones les plus sèches dès la S30.' },
  { init: 'FF', name: 'Fatou Fall', meta: 'Arachide · 1,2 ha · Ndoffane', rdt: '1,21', prod: '1,5', conf: '87 %', delta: '+3 %', up: true, stade: 'Croissance', village: 'Ndoffane',
    soil: 'Sablo-limoneux', hum: 38, stress: false, advice: 'Bonne réserve en eau pour la croissance. Conseillez le démariage avant la pluie de S31.' },
]

/** Fertilisation raisonnée — index-aligned with YIELD_PRODUCERS. */
export interface Fert {
  diag: { k: string; v: string; tag: string; tagC: BadgeColor }[]
  zones: [string, string][] // [fillColor, label kg/ha]
  npk: string; uree: string; mo: string; note: string
}
export const FERTS: Fert[] = [
  { diag: [
      { k: 'Type de sol', v: 'Sable limoneux (LS) · 100 %', tag: 'Sensible au lessivage', tagC: 'warning' },
      { k: 'Azote (N)', v: '0,039 % · faible sur 98 % de la parcelle', tag: 'Faible', tagC: 'error' },
      { k: 'Matière organique', v: '0,50–1,00 % · 100 % de la parcelle', tag: 'Faible', tagC: 'error' } ],
    zones: [['#0B6237', '174'], ['#3FA96B', '138'], ['#9BCB8B', '96']],
    npk: '14', uree: '8', mo: '14,4',
    note: 'Crédit azote de 25 kg N/ha déduit (précédent arachide). Urée fractionnée en 3 apports recouverts par binage ; sol sableux : éviter les apports massifs uniques, préférer des passages rapprochés après pluie utile.' },
  { diag: [
      { k: 'Type de sol', v: 'Sableux (Dior) · 100 %', tag: 'Sensible au lessivage', tagC: 'warning' },
      { k: 'Azote (N)', v: '0,046 % · faible sur 84 % de la parcelle', tag: 'Faible', tagC: 'error' },
      { k: 'Matière organique', v: '0,50–1,00 % · 91 % de la parcelle', tag: 'Faible', tagC: 'error' } ],
    zones: [['#0B6237', '168'], ['#3FA96B', '132'], ['#9BCB8B', '90']],
    npk: '11', uree: '6', mo: '10,8',
    note: 'NPK 15-15-15 en une seule fois au semis, placé à 5-10 cm de profondeur. Fumure organique enfouie avant labour ou localisée le long de la ligne de semis.' },
  { diag: [
      { k: 'Type de sol', v: 'Sablo-limoneux · 100 %', tag: 'Rétention moyenne', tagC: 'gray' },
      { k: 'Azote (N)', v: '0,058 % · moyen sur 62 % de la parcelle', tag: 'Moyen', tagC: 'warning' },
      { k: 'Matière organique', v: '1,00–1,50 % · 74 % de la parcelle', tag: 'Moyen', tagC: 'warning' } ],
    zones: [['#3FA96B', '142'], ['#0B6237', '178'], ['#9BCB8B', '88']],
    npk: '19', uree: '13', mo: '9,3',
    note: 'Maïs hybride : urée fractionnée en 3 apports, buttage cloisonné pour retenir l’eau de pluie. Zinc foliaire au stade 4-6 feuilles si symptômes de carence.' },
  { diag: [
      { k: 'Type de sol', v: 'Sableux (Dior) · 100 %', tag: 'Sensible au lessivage', tagC: 'warning' },
      { k: 'Azote (N)', v: '0,042 % · faible sur 95 % de la parcelle', tag: 'Faible', tagC: 'error' },
      { k: 'Matière organique', v: '0,50–1,00 % · 100 % de la parcelle', tag: 'Faible', tagC: 'error' } ],
    zones: [['#0B6237', '171'], ['#0B6237', '171'], ['#3FA96B', '129']],
    npk: '7', uree: '4', mo: '7,2',
    note: 'Crédit azote de 25 kg N/ha déduit (précédent arachide). Si la matière organique complète ne peut pas être mobilisée, un repli de 2-3 t/ha le long de la ligne de semis reste très bénéfique.' },
]

export const METEO = [
  { d: 'Me 8', t: 31, r: 2.4, w: 14 }, { d: 'Je 9', t: 32, r: 0, w: 12 }, { d: 'Ve 10', t: 33, r: 0, w: 16 },
  { d: 'Sa 11', t: 30, r: 8.2, w: 18 }, { d: 'Di 12', t: 29, r: 12.6, w: 22 }, { d: 'Lu 13', t: 29, r: 4.1, w: 15 },
  { d: 'Ma 14', t: 31, r: 0, w: 11 }, { d: 'Me 15', t: 32, r: 0, w: 10 }, { d: 'Je 16', t: 30, r: 15.8, w: 20 },
  { d: 'Ve 17', t: 28, r: 9.4, w: 17 }, { d: 'Sa 18', t: 29, r: 1.2, w: 12 }, { d: 'Di 19', t: 31, r: 0, w: 13 },
  { d: 'Lu 20', t: 32, r: 0, w: 14 }, { d: 'Ma 21', t: 30, r: 6.5, w: 16 },
]

export const RAIN_WEEKS = [
  { w: 'S29', mm: 27 }, { w: 'S30', mm: 14 }, { w: 'S31', mm: 52 },
  { w: 'S32', mm: 38 }, { w: 'S33', mm: 21 }, { w: 'S34', mm: 9 },
]

export const SAT_DAYS = [2, 8, 14, 20, 26]

/** Collecte calendar — [collectable, déjà collecté] tonnes per week S29… */
export const COLLECTE_BARS: [number, number][] = [[8, 26], [14, 20], [30, 12], [52, 6], [74, 0], [60, 0], [38, 0], [18, 0]]

export const PHENO_NAMES = ['Semis', 'Levée', 'Croissance', 'Floraison', 'Maturation']
export const PHENO_CURRENT = 3
