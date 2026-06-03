import { defineStore } from 'pinia'
import type { Scenario, FournisseursState } from '~/types/scenario'
import { SCENARIOS } from '~/scenarios'

export const useScenarioStore = defineStore('__ux', {
  state: () => ({
    activeId:  null as string | null,
    panelOpen: false,
    enabled:   false,
  }),

  getters: {
    active: (state): Scenario | null =>
      SCENARIOS.find(s => s.id === state.activeId) ?? null,

    fournisseurs(): FournisseursState | null {
      return this.active?.state.fournisseurs ?? null
    },

    groups(): Map<string, Scenario[]> {
      const map = new Map<string, Scenario[]>()
      for (const s of SCENARIOS) {
        if (!map.has(s.group)) map.set(s.group, [])
        map.get(s.group)!.push(s)
      }
      return map
    },
  },

  actions: {
    enable()              { this.enabled = true },
    togglePanel()         { this.panelOpen = !this.panelOpen },
    activate(id: string)  { this.activeId = id; this.panelOpen = false },
    reset()               { this.activeId = null },
  },
})
