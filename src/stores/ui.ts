import { defineStore } from 'pinia'

// Timer hors du state (non sérialisable) — survit au démontage du composant
// qui déclenche la transition.
let transitionTimer: ReturnType<typeof setTimeout> | undefined

export const useUIStore = defineStore('ui', {
  state: () => ({
    sidebarCollapsed:  false,
    moduleTransition:  false,
  }),

  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    // Affiche l'overlay plein écran pendant `ms`, puis le retire automatiquement.
    // Utilisé pour masquer un changement d'architecture (ex: aperçu template →
    // éditeur de formulaire) où sidebar et top-bar changent de structure.
    beginTransition(ms = 1400) {
      this.moduleTransition = true
      if (transitionTimer) clearTimeout(transitionTimer)
      transitionTimer = setTimeout(() => { this.moduleTransition = false }, ms)
    },
  },

  persist: { pick: ['sidebarCollapsed'] },
})
