export interface ColumnMapping {
  yourColumn: string | null  // null = colonne manquante dans le fichier
  tolbiColumn: string
}

export interface MatchingResult {
  totalMatched:   number
  totalExpected:  number
  surfaceHa:      number
  columns:        ColumnMapping[]
}

export interface FournisseursState {
  matchingResult?: MatchingResult
}

export interface ScenarioState {
  fournisseurs?: FournisseursState
}

export interface Scenario {
  id:           string
  label:        string
  description?: string
  group:        string
  state:        ScenarioState
}
