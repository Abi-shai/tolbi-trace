export interface BagEventEntry {
  label: string
  value: string
}

export interface BagEvent {
  id: string
  stepOrder: number
  stepName: string
  agentName: string
  agentRole: string
  timestamp: string
  entries: BagEventEntry[]

}
