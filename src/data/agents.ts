import type { Agent } from '@/types/agent'

export const agents: Agent[] = [
  { id: 'ag-001', name: 'Mamadou Diallo',  role: 'Magasinier coopérative',    phone: '+221 77 123 45 67', workflowId: 'wf-001' },
  { id: 'ag-002', name: 'Fatou Sow',       role: 'Responsable qualité',       phone: '+221 70 234 56 78', workflowId: 'wf-001' },
  { id: 'ag-003', name: 'Ibrahim Bâ',      role: 'Transporteur',              phone: '+221 76 345 67 89', workflowId: 'wf-001' },
  { id: 'ag-004', name: 'Ousmane Ndiaye',  role: 'Magasinier agroindustriel', phone: '+221 78 456 78 90', workflowId: 'wf-001' },
]
