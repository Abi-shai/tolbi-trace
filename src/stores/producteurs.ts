import { defineStore } from 'pinia'
import { producteursMock, producteursACorriger, producteurStats } from '~/data/producteurs'
import type { Producteur, ProducteursListeStats } from '~/types/producteur'

// Liste KYF (TOLBI ID) réactive : lue par la vue Producteurs, alimentée par la
// synchronisation des données collectées dans Data OS (TOQ-559). Porte aussi le
// bucket « à corriger » (Phase 3) : producteurs mis de côté à l'import, filtrables.
export const useProducteursStore = defineStore('producteurs', {
  state: () => ({
    producteurs: [] as Producteur[],
    stats:       { count: 0, parcelles: 0, surfaceHa: 0 } as ProducteursListeStats,
    initialized: false,
  }),

  getters: {
    // La base créée vs. les producteurs mis de côté à corriger.
    base:      (s): Producteur[] => s.producteurs.filter((p) => p.statut !== 'a-corriger'),
    aCorriger: (s): Producteur[] => s.producteurs.filter((p) => p.statut === 'a-corriger'),
  },

  actions: {
    init() {
      if (this.initialized) return
      this.producteurs = [
        ...producteursMock.map((p) => ({ ...p, statut: 'base' as const })),
        ...producteursACorriger.map((p) => ({ ...p })),
      ]
      this.stats       = { ...producteurStats }
      this.initialized = true
    },

    // Ajoute des producteurs (synchronisés depuis la collecte) en tête de liste.
    addMany(list: Producteur[]) {
      this.init()
      this.producteurs.unshift(...list.map((p) => ({ ...p, statut: 'base' as const })))
      this.stats.count     += list.length
      this.stats.parcelles += list.length
    },

    // Édition inline d'un champ producteur depuis la liste ID (clic sur la cellule).
    updateProducteur(id: string, patch: Partial<Producteur>) {
      const p = this.producteurs.find((x) => x.id === id)
      if (p) Object.assign(p, patch)
    },

    // Phase 3 — une fois corrigé (carte-atelier ou inline), le producteur mis de
    // côté rejoint la base : il quitte le bucket « à corriger » et compte dans les
    // statistiques.
    promote(id: string) {
      const p = this.producteurs.find((x) => x.id === id)
      if (p && p.statut === 'a-corriger') {
        p.statut = 'base'
        p.motif = undefined
        p.origine = undefined
        p.correctionKind = undefined
        this.stats.count     += 1
        this.stats.parcelles += 1
      }
    },
  },
})
