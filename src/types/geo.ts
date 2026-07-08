// Domaine « Correction cartographique » (Phase 2 de l'import producteurs).
//
// Le fichier géographique d'un import arrive comme une capture terrain BRUTE
// (waypoints / tracés) — pas comme des polygones propres déjà rattachés à un
// producteur (hybride Modèle 2, cf. ADR-0011). La carte-atelier a donc deux jobs
// sur cette matière : la NETTOYER (sommets aberrants, géométrie invalide) et la
// RATTACHER à la bonne Parcelle / au bon Producteur (l'IA suggère, l'humain confirme).
//
// ⚠️ Terminologie (CONTEXT.md) : une Parcelle est un polygone (anneau de sommets),
// jamais un « champ » — « champ » est déjà un champ de formulaire ailleurs dans le code.

// Coordonnée géographique, ordre GeoJSON : [longitude, latitude].
export type LngLat = [number, number]

// Un sommet d'un tracé de parcelle, issu d'un relevé GPS terrain.
// `aberrant` = point manifestement hors de la parcelle (pic / spike) à déplacer ou supprimer.
export interface Sommet {
  id:        string
  coord:     LngLat
  aberrant?: boolean
}

// La nature de l'anomalie qui met une géométrie « à corriger ». Elle détermine
// l'action attendue dans la carte-atelier (nettoyer vs. rattacher).
export type TypeAnomalie =
  | 'sommet-aberrant'     // un ou plusieurs sommets sortent de la parcelle → déplacer / supprimer
  | 'geometrie-invalide'  // anneau non fermé / auto-intersection → corriger le tracé
  | 'geometrie-manquante' // aucune parcelle rattachée au producteur → importer un tracé / dessiner
  | 'trace-orphelin'      // relevé non rattaché à un producteur → lier à la parcelle (IA suggère)

// Une parcelle telle que capturée : un anneau de sommets (non fermé — on ferme au
// rendu) + sa surface calculée. `valide` = l'anneau se referme et ne s'auto-intersecte pas.
export interface Parcelle {
  id:        string
  sommets:   Sommet[]
  surfaceHa: number
  valide:    boolean
}

// Un producteur du fichier géo, avec ses parcelles capturées. `rowIndex` corrèle
// avec `DataRow.index` de la table géo du Bilan ; `waypoint` = son CODE_WAYPT.
export interface ProducteurGeo {
  id:        string
  rowIndex:  number
  waypoint:  string
  nom:       string
  prenom:    string
  localite:  string
  parcelles: Parcelle[]
}

// Suggestion de rattachement produite par l'IA — PROPOSÉE, jamais écrite en silence
// (le socle ID ne tolère pas un lien producteur↔parcelle faux passé inaperçu).
// On surface un « rationale spatial » vérifiable, pas un % de confiance opaque.
export interface SuggestionRattachement {
  cibleProducteurId: string
  cibleProducteur:   string   // « Aminata Ba » — pour l'affichage du rattachement proposé
  rationale:         string   // « Le tracé jouxte la parcelle d'Aminata Ba, à 30 m au sud. »
  distanceM?:        number   // contexte chiffré du rationale
  sure:              boolean  // éligible au lot « confirmer les N suggestions sûres »
}

// Un item de la liste-queue « à corriger » de la carte-atelier. Porte son motif en
// clair (anatomie Quoi · Conséquence, cf. voice-and-tone) et, selon l'anomalie, soit
// un producteur+parcelle à nettoyer, soit un tracé orphelin à rattacher.
export interface ItemCorrection {
  id:         string
  anomalie:   TypeAnomalie
  motif:      { quoi: string; consequence: string }
  producteur?: ProducteurGeo            // sommet-aberrant / geometrie-invalide / geometrie-manquante
  orphelin?: {                          // trace-orphelin
    sommets:     Sommet[]
    suggestion?: SuggestionRattachement
  }
  corrige?:   boolean                   // basculé quand l'opérateur a traité l'item
}

// L'ensemble carte-atelier attaché à un import : le point de vue de départ, les
// parcelles valides affichées en sourdine pour le contexte spatial, et la liste-queue
// des items à corriger.
export interface AtelierGeo {
  centre:    LngLat
  zoom:      number
  contexte:  ProducteurGeo[]   // parcelles déjà valides — repères, non éditables ici
  aCorriger: ItemCorrection[]  // la liste-queue
}
