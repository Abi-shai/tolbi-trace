import { defineStore } from 'pinia'
import { lotsMock, cartesMock, identitesMock, transactionsMock, INA_DOUBLONS } from '~/data/ina'
import type { CarteINA, LotINA, IdentiteINA, TransactionINA, Wallet } from '~/types/ina'

// Store INA (cf. CONTEXT.md + ADR-0013). Source de vérité côté web pour les lots,
// cartes, identités et transactions INA. Le wallet et les KPIs sont dérivés.
// Périmètre S2 : émission + observation (le wallet/les transactions sont en
// lecture seule côté web ; leur création est mobile).
export const useInaStore = defineStore('ina', {
  state: () => ({
    lots:         [] as LotINA[],
    cartes:       [] as CarteINA[],
    identites:    [] as IdentiteINA[],
    transactions: [] as TransactionINA[],
    doublons:     0,
    initialized:  false,
    _seq:         0,
  }),

  getters: {
    // KPIs du tableau de bord (cartes émises / distribuées / activées + taux).
    kpis(state) {
      const emises      = state.cartes.length
      const distribuees = state.cartes.filter((c) => ['distribuee', 'associee', 'activee', 'revoquee'].includes(c.statut)).length
      const activees    = state.cartes.filter((c) => c.statut === 'activee').length
      const taux        = distribuees ? Math.round((activees / distribuees) * 100) : 0
      return { emises, distribuees, activees, taux, transactions: state.transactions.length, doublons: state.doublons }
    },

    carteActiveFor: (state) => (producteurId: string): CarteINA | null =>
      state.cartes.find((c) => c.producteurId === producteurId && c.statut === 'activee') ?? null,

    cartesFor: (state) => (producteurId: string): CarteINA[] =>
      state.cartes.filter((c) => c.producteurId === producteurId),

    transactionsFor: (state) => (producteurId: string): TransactionINA[] =>
      state.transactions.filter((t) => t.producteurId === producteurId),

    identiteFor: (state) => (producteurId: string): IdentiteINA | null =>
      state.identites.find((i) => i.producteurId === producteurId) ?? null,

    // Statut d'une identité : active si une carte activée existe, sinon révoquée
    // (carte perdue non encore réémise).
    statutFor: (state) => (producteurId: string): 'active' | 'revoquee' =>
      state.cartes.some((c) => c.producteurId === producteurId && c.statut === 'activee') ? 'active' : 'revoquee',

    // Wallet dérivé des transactions (entrées − sorties).
    walletFor: (state) => (producteurId: string): Wallet => {
      const txs     = state.transactions.filter((t) => t.producteurId === producteurId)
      const entrees = txs.filter((t) => t.sens === 'entree').reduce((a, t) => a + t.montant, 0)
      const sorties = txs.filter((t) => t.sens === 'sortie').reduce((a, t) => a + t.montant, 0)
      return { entrees, sorties, solde: entrees - sorties }
    },

    // Répartition des cartes par statut (pour la vue Cartes).
    cartesParStatut(state): Record<string, number> {
      return state.cartes.reduce((acc, c) => {
        acc[c.statut] = (acc[c.statut] ?? 0) + 1
        return acc
      }, {} as Record<string, number>)
    },
  },

  actions: {
    init() {
      if (this.initialized) return
      this.lots         = structuredClone(lotsMock)
      this.cartes       = structuredClone(cartesMock)
      this.identites    = structuredClone(identitesMock)
      this.transactions = structuredClone(transactionsMock)
      this.doublons     = INA_DOUBLONS
      this.initialized  = true
    },

    // Émission (US 1.1) — génère un lot + ses cartes vierges au statut « générée ».
    // Côté proto, l'opérateur est le Propriétaire/Admin de l'org (option B, ADR-0013).
    genererLot(payload: { prefixe: string; quantite: number; reference?: string }): LotINA {
      this.init()
      this._seq += 1
      const id  = `lot-${this._seq}`
      const ref = payload.reference?.trim() || `${payload.prefixe}-L${String(this.lots.length + 1).padStart(3, '0')}`
      const lot: LotINA = {
        id,
        reference: ref,
        prefixe:   payload.prefixe,
        quantite:  payload.quantite,
        createdAt: new Date().toISOString(),
      }
      const start = this.cartes.length + 1
      for (let i = 0; i < payload.quantite; i++) {
        this.cartes.push({
          id:     `${id}-c${i}`,
          serial: `${payload.prefixe}-C${String(start + i).padStart(4, '0')}`,
          lotId:  id,
          statut: 'generee',
        })
      }
      this.lots.unshift(lot)
      return lot
    },

    // Révocation + réémission (US 4.1) — révoque la carte active (perte/vol),
    // alloue une carte fraîche du stock (ou en crée une), et l'active pour le même
    // producteur. Le Numéro INA ne change pas ; les transactions passées gardent
    // le serial de l'ancienne carte (piste d'audit).
    revoquerReemettre(producteurId: string): string {
      this.init()
      const active = this.cartes.find((c) => c.producteurId === producteurId && c.statut === 'activee')
      if (active) {
        active.statut    = 'revoquee'
        active.revokedAt = new Date().toISOString()
      }
      let fresh = this.cartes.find((c) => !c.producteurId && ['distribuee', 'imprimee', 'generee'].includes(c.statut))
      if (!fresh) {
        this._seq += 1
        fresh = {
          id:     `reissue-${this._seq}`,
          serial: `KLK-C${String(9000 + this._seq).padStart(4, '0')}`,
          lotId:  this.lots[0]?.id ?? 'lot-klk-001',
          statut: 'generee',
        }
        this.cartes.push(fresh)
      }
      fresh.producteurId = producteurId
      fresh.statut       = 'activee'
      fresh.activatedAt  = new Date().toISOString()
      return fresh.serial
    },
  },
})
