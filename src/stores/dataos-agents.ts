import { defineStore } from 'pinia'
import type { DataosAgent } from '~/types/dataos-agent'
import { dataosAgentsSeed } from '~/data/dataos-agents'

let _counter = 0

interface DataosAgentInput {
  name: string
  phone?: string
}

export const useDataosAgentsStore = defineStore('dataos-agents', {
  state: () => ({
    agents: [] as DataosAgent[],
    /** PINs déjà attribués (actifs ou révoqués) — réservés à vie pour préserver la provenance. */
    reservedPins: [] as string[],
    /** Formulaires déjà semés avec le roster de démo (pour ne le faire qu'une fois). */
    seededForms: [] as string[],
  }),

  getters: {
    agentsFor: (state) => (formulaireId: string) =>
      state.agents.filter((a) => a.formulaireId === formulaireId),
  },

  actions: {
    /** Génère un PIN à 4 chiffres unique à l'échelle du tenant. Les PINs morts restent réservés. */
    generatePin(): string {
      let pin: string
      do {
        pin = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
      } while (this.reservedPins.includes(pin))
      this.reservedPins.push(pin)
      return pin
    },

    /**
     * Sème le roster de démo pour un Formulaire donné, une seule fois.
     * Le premier formulaire garde les PINs fixes de la démo (4821…) ; sur les
     * formulaires suivants, un PIN déjà réservé est régénéré pour préserver
     * l'unicité tenant-wide.
     */
    ensureSeed(formulaireId: string) {
      if (this.seededForms.includes(formulaireId)) return
      this.seededForms.push(formulaireId)
      for (const seed of dataosAgentsSeed) {
        const pin = this.reservedPins.includes(seed.pin) ? this.generatePin() : seed.pin
        if (!this.reservedPins.includes(pin)) this.reservedPins.push(pin)
        this.agents.push({
          id: `dos-ag-${++_counter}`,
          formulaireId,
          name: seed.name,
          pin,
          statut: seed.statut,
          ...(seed.phone ? { phone: seed.phone } : {}),
          ...(seed.lastActivity ? { lastActivity: seed.lastActivity } : {}),
        })
      }
    },

    addAgent(formulaireId: string, input: DataosAgentInput): DataosAgent {
      const agent: DataosAgent = {
        id: `dos-ag-${++_counter}`,
        name: input.name,
        formulaireId,
        pin: this.generatePin(),
        statut: 'actif',
        ...(input.phone ? { phone: input.phone } : {}),
      }
      this.agents.push(agent)
      return agent
    },

    updateAgent(id: string, input: DataosAgentInput) {
      const agent = this.agents.find((a) => a.id === id)
      if (!agent) return
      agent.name = input.name
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

    /**
     * Suppression définitive de l'agent. Réintroduit après supersession de
     * l'ADR-0005 par l'ADR-0007 (le hard delete est de nouveau autorisé).
     * Le PIN reste réservé à vie (jamais réattribué) — politique d'unicité
     * tenant-wide inchangée.
     */
    removeAgent(id: string) {
      this.agents = this.agents.filter((a) => a.id !== id)
    },
  },
})
