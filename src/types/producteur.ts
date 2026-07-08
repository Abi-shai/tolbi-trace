export interface Producteur {
  id:            string
  prenom:        string
  nom:           string
  codeParcelles: string
  ina:           string
  telephone:     string
  cooperative:   string
  // Phase 3 — bucket « à corriger » persistant après finalisation. Un producteur
  // mis de côté à l'import vit dans la liste avec statut 'a-corriger' + son motif,
  // jusqu'à correction (carte-atelier pour la géo, inline pour un attribut) → 'base'.
  statut?:         'base' | 'a-corriger'
  origine?:        string                       // « Géo · sommet », « Excel · téléphone »
  motif?:          { quoi: string; cons: string }
  correctionKind?: 'geo' | 'attribut'           // route l'action Corriger (carte vs inline)
}

export interface ProducteursListeStats {
  count:     number
  parcelles: number
  surfaceHa: number
}
