import { defineStore } from 'pinia'
import type { Agent } from '~/types/agent'
import { agents as initialAgents } from '~/data/agents'

let _counter = 0

export const useAgentsStore = defineStore('agents', {
  state: () => ({
    agents: [] as Agent[],
    initialized: false,
  }),

  actions: {
    init() {
      if (!this.initialized) {
        this.agents = [...initialAgents]
        this.initialized = true
      }
    },

    addAgent(workflowId: string, name: string, phone?: string): Agent {
      const agent: Agent = {
        id: `ag-new-${++_counter}`,
        name,
        workflowId,
        ...(phone ? { phone } : {}),
      }
      this.agents.push(agent)
      return agent
    },

    removeAgent(id: string) {
      this.agents = this.agents.filter((a) => a.id !== id)
    },
  },
})
