import { defineStore } from 'pinia'
import type { Agent } from '~/types/agent'
import { agents as initialAgents } from '~/data/agents'

let _counter = 0

interface AgentInput {
  name: string
  role?: string
  phone?: string
}

export const useAgentsStore = defineStore('agents', {
  state: () => ({
    agents: [] as Agent[],
    /** PINs déjà attribués (actifs ou révoqués) — réservés à vie pour préserver la provenance. */
    reservedPins: [] as string[],
    initialized: false,
  }),

  actions: {
    init() {
      if (!this.initialized) {
        this.agents = [...initialAgents]
        this.reservedPins = initialAgents.map((a) => a.pin)
        this.initialized = true
      }
    },

    /** Génère un PIN à 4 chiffres unique à l'échelle du tenant. Les PINs morts restent réservés. */
    generatePin(): string {
      let pin: string
      do {
        pin = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
      } while (this.reservedPins.includes(pin))
      this.reservedPins.push(pin)
      return pin
    },

    addAgent(workflowId: string, input: AgentInput): Agent {
      const agent: Agent = {
        id: `ag-new-${++_counter}`,
        name: input.name,
        workflowId,
        pin: this.generatePin(),
        statut: 'actif',
        ...(input.role ? { role: input.role } : {}),
        ...(input.phone ? { phone: input.phone } : {}),
      }
      this.agents.push(agent)
      return agent
    },

    updateAgent(id: string, input: AgentInput) {
      const agent = this.agents.find((a) => a.id === id)
      if (!agent) return
      agent.name = input.name
      agent.role = input.role || undefined
      agent.phone = input.phone || undefined
    },

    /** Révoque l'ancien PIN et en attribue un nouveau, immédiatement. L'ancien reste réservé. */
    regeneratePin(id: string): string | undefined {
      const agent = this.agents.find((a) => a.id === id)
      if (!agent) return
      agent.pin = this.generatePin()
      return agent.pin
    },

    deactivateAgent(id: string) {
      const agent = this.agents.find((a) => a.id === id)
      if (agent) agent.statut = 'inactif'
    },

    /** Réactive l'agent et lui attribue un nouveau code (l'ancien reste mort). Renvoie le nouveau PIN. */
    reactivateAgent(id: string): string | undefined {
      const agent = this.agents.find((a) => a.id === id)
      if (!agent) return
      agent.statut = 'actif'
      agent.pin = this.generatePin()
      return agent.pin
    },
  },
})
