export interface ColumnMapping {
  yourColumn: string | null  // null = colonne manquante dans le fichier
  tolbiColumn: string
  isNewEntry?: boolean       // colonne supplémentaire non reconnue par Tolbi
}

export interface MatchingResult {
  totalMatched:   number
  totalExpected:  number
  surfaceHa:      number
  columns:        ColumnMapping[]
}

export interface CellData {
  value:      string
  hasError?:  boolean   // fond rose + triangle rouge
  hasWarning?: boolean  // triangle orange + "Champ vide" italic
  corrected?: boolean   // erreur corrigée en ligne (TOQ-577/578) → check vert
}

export interface DataRow {
  index:      number
  geoCells:   CellData[]
  excelCells: CellData[]
}

export interface RowMatchingResult {
  totalMatched:  number
  totalExpected: number
  surfaceHa:     number
  errorCount:    number
  warningCount:  number
  geoColumns:    string[]
  excelColumns:  string[]
  rows:          DataRow[]
}

export interface ProducteursState {
  matchingResult?:    MatchingResult
  rowMatchingResult?: RowMatchingResult
  processingError?:   boolean
  fileUploadError?:   boolean
}

export interface DataOsState {
  projets: import('~/types/dataos').Projet[]
}

export interface ScenarioState {
  producteurs?: ProducteursState
  dataos?:      DataOsState
}

export interface Scenario {
  id:           string
  label:        string
  description?: string
  group:        string
  folder?:      string
  scope?:       string
  state:        ScenarioState
}
