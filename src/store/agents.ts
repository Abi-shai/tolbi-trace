import { create } from 'zustand'
import type { Agent } from '@/types/agent'
import { agents as initialAgents } from '@/data/agents'

let _counter = 0

interface AgentsState {
  agents: Agent[]
  initialized: boolean
  init: () => void
  addAgent: (workflowId: string, name: string, phone?: string) => Agent
  removeAgent: (id: string) => void
}

export const useAgentsStore = create<AgentsState>((set, get) => ({
  agents: [],
  initialized: false,

  init: () => {
    if (!get().initialized) {
      set({ agents: initialAgents, initialized: true })
    }
  },

  addAgent: (workflowId, name, phone) => {
    const agent: Agent = {
      id: `ag-new-${++_counter}`,
      name,
      workflowId,
      ...(phone ? { phone } : {}),
    }
    set((s) => ({ agents: [...s.agents, agent] }))
    return agent
  },

  removeAgent: (id) =>
    set((s) => ({ agents: s.agents.filter((a) => a.id !== id) })),
}))
