import { defineStore } from 'pinia'
import { producteursMock, producteurStats } from '~/data/producteurs'
import type { Producteur, ProducteursListeStats } from '~/types/producteur'

// Liste KYF (TOLBI ID) réactive : lue par la vue Producteurs, alimentée par la
// synchronisation des données collectées dans Data OS (TOQ-559).
export const useProducteursStore = defineStore('producteurs', {
  state: () => ({
    producteurs: [] as Producteur[],
    stats:       { count: 0, parcelles: 0, surfaceHa: 0 } as ProducteursListeStats,
    initialized: false,
  }),

  actions: {
    init() {
      if (this.initialized) return
      this.producteurs = producteursMock.map((p) => ({ ...p }))
      this.stats       = { ...producteurStats }
      this.initialized = true
    },

    // Ajoute des producteurs (synchronisés depuis la collecte) en tête de liste.
    addMany(list: Producteur[]) {
      this.init()
      this.producteurs.unshift(...list.map((p) => ({ ...p })))
      this.stats.count     += list.length
      this.stats.parcelles += list.length
    },
  },
})
