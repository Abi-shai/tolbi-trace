export interface AnomalyResult {
  bagId: string
  category: string
  categoryLabel: string
  note: string
}

let pending: AnomalyResult | null = null

export function setPendingAnomaly(data: AnomalyResult): void {
  pending = data
}

export function consumePendingAnomaly(): AnomalyResult | null {
  const data = pending
  pending = null
  return data
}
