import { defineStore } from 'pinia'
import type { Scenario, ProducteursState } from '~/types/scenario'
import { SCENARIOS } from '~/scenarios'

export const useScenarioStore = defineStore('__ux', {
  state: () => ({
    activeId:     null as string | null,
    panelOpen:    false,
    enabled:      false,
    activeScopes: [] as string[],
  }),

  getters: {
    active: (state): Scenario | null =>
      SCENARIOS.find(s => s.id === state.activeId) ?? null,

    producteurs(): ProducteursState | null {
      return this.active?.state.producteurs ?? null
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
    registerScope(scope: string)   { if (!this.activeScopes.includes(scope)) { this.activeScopes.push(scope); this.panelOpen = true } },
    unregisterScope(scope: string) { this.activeScopes = this.activeScopes.filter(s => s !== scope) },
  },
})
