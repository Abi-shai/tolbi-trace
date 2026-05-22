export type QuestionType = 'texte' | 'nombre' | 'date' | 'selection' | 'producteur' | 'qr_scan' | 'qr_batch'

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  qr_scan:    'Scan QR',
  qr_batch:   'Scan QR (rafale)',
  producteur: 'Producteur',
  texte:      'Texte libre',
  nombre:     'Nombre',
  date:       'Date',
  selection:  'Sélection',
}

export type ValidationType = 'form' | 'code'

export interface Question {
  id: string
  type: QuestionType
  label: string
}

export interface WorkflowStep {
  id: string
  order: number
  name: string
  description?: string
  agentRole: string
  agentId?: string
  validationType?: ValidationType
  questions: Question[]
}
