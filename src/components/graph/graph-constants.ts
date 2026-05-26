import type { NodeType } from '@/data/graph'

export const NODE_COLORS: Record<NodeType, string> = {
  cooperative: '#7c3aed',
  step:        '#056033',
  agent:       '#475467',
  producer:    '#2563eb',
  bag:         '#ea580c',
}

export const STATUS_BORDER: Record<string, string> = {
  done:        '#17b26a',
  in_progress: '#f79009',
  pending:     '#98a2b3',
  blocked:     '#f04438',
}
