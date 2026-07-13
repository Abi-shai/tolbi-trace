/** dMRV module data — ported from App Terrain.dc.html `data-dc-script`. */
export interface DmrvMetric {
  name: string; sub: string; unit: string
  mon: string; base: string; delta: string; up: boolean
  bars: number[]; insight: string
}
export const DMRV: DmrvMetric[] = [
  { name: 'Stock carbone', sub: 'tCO2eq · dérivé biomasse', unit: 'tCO2eq', mon: '12 480', base: '9 850', delta: '+2,1 %', up: true,
    bars: [38, 42, 47, 52, 58, 64, 71, 78], insight: 'Séquestration en hausse régulière depuis la baseline 2020. Rythme conforme au plan de certification Verra.' },
  { name: 'Biomasse', sub: 'aérienne moyenne', unit: 't/ha', mon: '84,2', base: '61,0', delta: '+1,4 %', up: true,
    bars: [40, 44, 48, 51, 56, 60, 66, 70], insight: 'Croissance de la biomasse portée par les zones reboisées 2023-2024.' },
  { name: 'Couverture forestière', sub: '3 240 ha suivis', unit: '%', mon: '76', base: '71', delta: '+0,8 pt', up: true,
    bars: [56, 57, 58, 60, 61, 63, 64, 66], insight: 'Progression lente mais continue de la couverture sur le périmètre du projet.' },
  { name: 'Taux de déforestation', sub: 'annualisé', unit: '%', mon: '0,42', base: '1,10', delta: '-0,1 pt', up: false,
    bars: [72, 64, 55, 46, 38, 32, 27, 24], insight: 'Déforestation en net recul. Un foyer résiduel subsiste sur le secteur Est (alerte S28).' },
  { name: 'Hauteur canopée', sub: 'moyenne LiDAR/sat', unit: 'm', mon: '9,6', base: '7,8', delta: '+0,3 m', up: true,
    bars: [42, 45, 48, 50, 53, 56, 58, 61], insight: 'Hauteur de canopée cohérente avec la classe d’âge des plantations.' },
]

export interface DmrvProducer {
  init: string; name: string; meta: string; stock: string; cover: string
  vals: string[]; base: string[] // per-metric monitoring / baseline values, index-aligned with DMRV
}
export const D_PRODS: DmrvProducer[] = [
  { init: 'ID', name: 'Ibrahima Diop', meta: 'Ndiaganiao · 2 parcelles · 3,1 ha', stock: '3 240', cover: '78 %',
    vals: ['3 240', '86,1', '78', '0,31', '10,2'], base: ['2 560', '62,4', '72', '0,95', '8,1'] },
  { init: 'AN', name: 'Awa Ndiaye', meta: 'Keur Madior · 1 parcelle · 1,8 ha', stock: '2 105', cover: '74 %',
    vals: ['2 105', '81,7', '74', '0,45', '9,3'], base: ['1 690', '59,8', '69', '1,12', '7,6'] },
  { init: 'MS', name: 'Moussa Sarr', meta: 'Nioro · 1 parcelle · 3,1 ha', stock: '3 980', cover: '71 %',
    vals: ['3 980', '79,4', '71', '0,58', '8,9'], base: ['3 120', '58,2', '66', '1,26', '7,2'] },
]
