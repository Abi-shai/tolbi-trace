export interface Fournisseur {
  id:            string
  prenom:        string
  nom:           string
  codeParcelles: string
  ina:           string
  telephone:     string
  cooperative:   string
}

export interface FournisseursListeStats {
  count:     number
  parcelles: number
  surfaceHa: number
}
