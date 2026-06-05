export interface Producteur {
  id:            string
  prenom:        string
  nom:           string
  codeParcelles: string
  ina:           string
  telephone:     string
  cooperative:   string
}

export interface ProducteursListeStats {
  count:     number
  parcelles: number
  surfaceHa: number
}
