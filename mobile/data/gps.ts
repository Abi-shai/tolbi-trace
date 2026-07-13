/** GPS field-map data — ported from App Terrain.dc.html FM_* tables.
 *  CSS gradients converted to RN LinearGradient colour stops. */

export interface FieldLayer {
  label: string
  colors: string[] // LinearGradient stops (105deg-ish, applied left→right)
  legend:
    | { type: 'ramp'; title: string; grad: string[]; min: string; max: string; unit: string }
    | { type: 'cat'; title: string; items: { c: string; l: string }[] }
  read: { icon: string; title: string; sub: string; unit: string } // reading-card frame
}

export interface FieldSource { key: string; layers: FieldLayer[] }

export const FIELD_SOURCES: Record<string, FieldSource> = {
  yield: {
    key: 'yield',
    layers: [
      { label: 'Rendement', colors: ['#0B7A42', '#7CC08F', '#B9DCA9', '#3FA96B', '#0E6B3B'],
        legend: { type: 'ramp', title: 'Rendement estimé', grad: ['#B9DCA9', '#7CC08F', '#2E9B5F', '#0B7A42'], min: '0,4', max: '1,8', unit: 't/ha' },
        read: { icon: 'sprout', title: 'Rendement · parcelle', sub: 'GPS ±15 m', unit: 't/ha' } },
      { label: 'Phénologie', colors: ['#FAC720', '#8FBF7F', '#3FA96B', '#FAC720', '#2E9B5F'],
        legend: { type: 'cat', title: 'Stade phénologique', items: [{ c: '#FAC720', l: 'Levée' }, { c: '#8FBF7F', l: 'Croissance' }, { c: '#3FA96B', l: 'Floraison' }, { c: '#0E6B3B', l: 'Maturation' }] },
        read: { icon: 'activity', title: 'Stade · parcelle', sub: 'GPS ±15 m', unit: '' } },
      { label: 'Humidité', colors: ['#0B4A8F', '#175CD3', '#2E90FA', '#84CAFF', '#0B4A8F'],
        legend: { type: 'ramp', title: 'Humidité du sol', grad: ['#B2DDFF', '#84CAFF', '#2E90FA', '#0B4A8F'], min: '10 %', max: '45 %', unit: 'humidité' },
        read: { icon: 'droplets', title: 'Humidité · parcelle', sub: 'GPS ±15 m', unit: '%' } },
      { label: 'Type de sol', colors: ['#B98A4A', '#D9C089', '#8A6A3B', '#C9A96A', '#7A5A2E'],
        legend: { type: 'cat', title: 'Type de sol', items: [{ c: '#D9C089', l: 'Sableux (Dior)' }, { c: '#C9A96A', l: 'Sablo-limoneux' }, { c: '#8A6A3B', l: 'Argilo-sableux' }] },
        read: { icon: 'layers', title: 'Sol · parcelle', sub: 'GPS ±15 m', unit: '' } },
    ],
  },
  parc: {
    key: 'parc',
    layers: [
      { label: 'Parcelles', colors: ['#D8E4C6', '#C9DBB2', '#DCE4CB', '#CBD8B8', '#D6E2C4'],
        legend: { type: 'cat', title: 'Parcelles', items: [{ c: '#066938', l: 'Parcelle suivie' }, { c: '#C9DBB2', l: 'Hors périmètre' }] },
        read: { icon: 'map', title: 'Parcelle', sub: 'GPS ±15 m', unit: 'ha' } },
      { label: 'Satellite', colors: ['#41552F', '#5A6E3F', '#77874C', '#4E6234', '#8A8A57'],
        legend: { type: 'cat', title: 'Vue satellite', items: [{ c: '#FFFFFF', l: 'Limite de parcelle' }, { c: '#5A6E3F', l: 'Végétation' }] },
        read: { icon: 'map', title: 'Parcelle', sub: 'GPS ±15 m', unit: 'ha' } },
    ],
  },
}

/** Waypoints along the GPS trace — value/badge shown in the reading card. */
export interface Waypoint {
  x: number; y: number // percentage position on the map
  name: string | null; dist?: string; dAlert?: string
  yv?: string; yb?: string; dv?: string; db?: string; pv?: string; pb?: string
}
export const WPS: Waypoint[] = [
  { x: 18, y: 76, name: null, dist: 'Parcelle I. Diop à 210 m au N-E' },
  { x: 28, y: 62, name: null, dist: 'Parcelle I. Diop à 120 m au N-E' },
  { x: 36, y: 47, name: 'Ibrahima Diop · Keur Madior', yv: '1,32', yb: 'Floraison', dv: '36,2', db: 'Canopée 8,4 m', pv: '2,4', pb: 'Arachide' },
  { x: 48, y: 38, name: 'Ibrahima Diop · Keur Madior', yv: '1,45', yb: 'Floraison', dv: '41,8', db: 'Canopée 9,1 m', pv: '2,4', pb: 'Arachide' },
  { x: 60, y: 34, name: null, dist: 'Parcelle A. Ndiaye à 80 m à l’E', dAlert: 'Foyer de déforestation à 90 m à l’E' },
  { x: 70, y: 28, name: 'Awa Ndiaye · Keur Madior', yv: '1,18', yb: 'Croissance', dv: '28,6', db: 'Canopée 6,2 m', pv: '1,8', pb: 'Arachide' },
]
