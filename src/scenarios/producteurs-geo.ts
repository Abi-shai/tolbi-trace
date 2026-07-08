import type { AtelierGeo, LngLat, Parcelle, ProducteurGeo, Sommet } from '~/types/geo'

// ── Mock carte-atelier (Correction cartographique, Phase 2) ────────────────────
//
// Coordonnées réelles autour de Tivaouane (région de Thiès, Sénégal) — cohérentes
// avec les relevés déjà présents dans les scénarios d'import (~ -16.9, 14.7).
// À cette latitude, 0,001° ≈ 108 m en longitude / 111 m en latitude : une parcelle
// de ~1,3 ha fait donc ~0,0011° de côté.

const CENTRE: LngLat = [-16.9000, 14.7000]

// Jitter déterministe dérivé d'une graine + index (pas de Math.random → diff stable,
// rendu reproductible). Retourne une valeur dans [-0.5, 0.5].
function jitter(seed: number, i: number): number {
  const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453
  return x - Math.floor(x) - 0.5
}

// Quadrilatère légèrement irrégulier (allure « relevé terrain », pas carré parfait)
// autour d'un centre, de côté `sizeDeg`, perturbé par la graine.
function quad(center: LngLat, sizeDeg: number, seed: number): LngLat[] {
  const [lng, lat] = center
  const h = sizeDeg / 2
  const base: LngLat[] = [
    [lng - h, lat - h], [lng + h, lat - h],
    [lng + h, lat + h], [lng - h, lat + h],
  ]
  return base.map(([x, y], k) => [
    x + jitter(seed, k * 2)     * sizeDeg * 0.28,
    y + jitter(seed, k * 2 + 1) * sizeDeg * 0.28,
  ])
}

let sid = 0
function sommets(coords: LngLat[], aberrantIdx = -1): Sommet[] {
  return coords.map((coord, i) => ({
    id:       `s-${sid++}`,
    coord,
    ...(i === aberrantIdx ? { aberrant: true } : {}),
  }))
}

// Une parcelle valide de contexte : quad propre, surface ~1,2–1,6 ha.
function parcelle(id: string, center: LngLat, seed: number, surfaceHa: number, valide = true): Parcelle {
  return { id, sommets: sommets(quad(center, 0.0012, seed)), surfaceHa, valide }
}

// Décalage d'un centre (en degrés) — pour disposer les parcelles en petit parcellaire.
function offset(base: LngLat, dLng: number, dLat: number): LngLat {
  return [base[0] + dLng, base[1] + dLat]
}

// ── Parcelles de contexte (déjà valides, affichées en sourdine) ────────────────
const contexte: ProducteurGeo[] = [
  { id: 'pg-042', rowIndex: 0, waypoint: 'ZN1_WP042', nom: 'Diop',    prenom: 'Moussa',  localite: 'Tivaouane',
    parcelles: [parcelle('pc-042', offset(CENTRE, -0.0026, 0.0022), 42, 1.5)] },
  { id: 'pg-043', rowIndex: 1, waypoint: 'ZN1_WP043', nom: 'Ndiaye',  prenom: 'Fatou',   localite: 'Tivaouane',
    parcelles: [parcelle('pc-043', offset(CENTRE,  0.0004, 0.0024), 43, 1.2)] },
  { id: 'pg-044', rowIndex: 2, waypoint: 'ZN1_WP044', nom: 'Cissé',   prenom: 'Babacar', localite: 'Tivaouane',
    parcelles: [parcelle('pc-044', offset(CENTRE,  0.0030, 0.0016), 44, 1.6)] },
  { id: 'pg-048', rowIndex: 6, waypoint: 'ZN1_WP048', nom: 'Ba',      prenom: 'Aminata', localite: 'Tivaouane',
    parcelles: [parcelle('pc-048', offset(CENTRE,  0.0032, -0.0020), 48, 1.3)] },
]

// ── Items à corriger (les 4 archétypes d'anomalie) ─────────────────────────────

// 1) Sommet aberrant : la parcelle d'Ibrahim Diallo a un point qui part au loin (pic).
const aberrantCoords = quad(offset(CENTRE, -0.0022, -0.0018), 0.0012, 45)
aberrantCoords[2] = [aberrantCoords[2][0] + 0.0045, aberrantCoords[2][1] + 0.0038] // pic hors parcelle
const diallo: ProducteurGeo = {
  id: 'pg-045', rowIndex: 3, waypoint: 'ZN1_WP045', nom: 'Diallo', prenom: 'Ibrahim', localite: 'Tivaouane',
  parcelles: [{ id: 'pc-045', sommets: sommets(aberrantCoords, 2), surfaceHa: 12.7, valide: true }],
}

// 2) Géométrie invalide : le tracé de Jean Kouassi ne se referme pas (anneau ouvert).
const kouassi: ProducteurGeo = {
  id: 'pg-046', rowIndex: 4, waypoint: 'ZN1_WP046', nom: 'Kouassi', prenom: 'Jean', localite: 'Tivaouane',
  parcelles: [{
    id: 'pc-046',
    sommets: sommets(quad(offset(CENTRE, 0.0006, -0.0026), 0.0013, 46).slice(0, 3)), // 3 sommets, non refermé
    surfaceHa: 0,
    valide: false,
  }],
}

// 3) Géométrie manquante : Mohamed Sene existe dans le fichier, aucune parcelle.
const sene: ProducteurGeo = {
  id: 'pg-047', rowIndex: 5, waypoint: 'ZN1_WP047', nom: 'Sene', prenom: 'Mohamed', localite: 'Tivaouane',
  parcelles: [],
}

// 4) Tracé orphelin : un relevé au sud de la parcelle d'Aminata Ba, rattaché à personne.
//    L'IA propose de le rattacher à Aminata Ba (rationale spatial vérifiable).
const orphelinCoords = quad(offset(CENTRE, 0.0034, -0.0038), 0.0011, 99)

export const atelierGeoDemo: AtelierGeo = {
  centre: CENTRE,
  zoom:   15,
  contexte,
  aCorriger: [
    {
      id: 'ic-1',
      anomalie: 'sommet-aberrant',
      motif: { quoi: 'Sommet aberrant.', consequence: 'Un point du tracé sort de la parcelle et gonfle la surface à 12,7 ha.' },
      producteur: diallo,
    },
    {
      id: 'ic-2',
      anomalie: 'geometrie-invalide',
      motif: { quoi: 'Contour non refermé.', consequence: 'La parcelle ne peut pas être calculée tant que le tracé reste ouvert.' },
      producteur: kouassi,
    },
    {
      id: 'ic-3',
      anomalie: 'geometrie-manquante',
      motif: { quoi: 'Géométrie manquante.', consequence: 'Aucune parcelle rattachée à ce producteur.' },
      producteur: sene,
    },
    {
      id: 'ic-4',
      anomalie: 'trace-orphelin',
      motif: { quoi: 'Tracé non rattaché.', consequence: "Ce relevé n'est associé à aucun producteur." },
      orphelin: {
        sommets: sommets(orphelinCoords),
        suggestion: {
          cibleProducteurId: 'pg-048',
          cibleProducteur:   'Aminata Ba',
          rationale:         "Le tracé jouxte la parcelle d'Aminata Ba (WP048), à 30 m au sud.",
          distanceM:         30,
          sure:              true,
        },
      },
    },
  ],
}
