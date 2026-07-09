import { defineStore } from 'pinia'
import { lotsMock, cartesMock, identitesMock, transactionsMock, INA_DOUBLONS } from '~/data/ina'
import { cycleOf, type CarteINA, type LotINA, type IdentiteINA, type TransactionINA, type Cycle, type CarteAssociee } from '~/types/ina'

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
    // KPIs du tableau de bord. Taux d'activation = cartes activées / cartes émises.
    kpis(state) {
      const emises   = state.cartes.length
      const activees = state.cartes.filter((c) => c.statut === 'activee').length
      const taux     = emises ? Math.round((activees / emises) * 100) : 0
      return { emises, activees, taux, transactions: state.transactions.length, doublons: state.doublons }
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

    // Répartition des cartes par statut fin (interne).
    cartesParStatut(state): Record<string, number> {
      return state.cartes.reduce((acc, c) => {
        acc[c.statut] = (acc[c.statut] ?? 0) + 1
        return acc
      }, {} as Record<string, number>)
    },

    // Répartition par cycle (3 niveaux) — vue Cartes + tableau de bord.
    cartesParCycle(state): Record<Cycle, number> {
      return state.cartes.reduce((acc, c) => {
        const cy = cycleOf(c.statut)
        acc[cy] += 1
        return acc
      }, { emission: 0, activation: 0, revocation: 0 } as Record<Cycle, number>)
    },

    // Cartes du stock non encore rattachées à un producteur — pool associable
    // lors de l'activation d'un statut INA. Triées par proximité terrain :
    // distribuée (déjà chez un agent) → imprimée → générée.
    cartesDisponibles(state): CarteINA[] {
      const rang: Record<string, number> = { distribuee: 0, imprimee: 1, generee: 2 }
      return state.cartes
        .filter((c) => !c.producteurId && ['distribuee', 'imprimee', 'generee'].includes(c.statut))
        .sort((a, b) => (rang[a.statut] ?? 9) - (rang[b.statut] ?? 9) || a.serial.localeCompare(b.serial))
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

    // Activation du statut INA (ADR-0013) — enrôle dans INA un producteur du
    // module ID : ouvre l'identité (le Numéro INA est logique, déjà porté par le
    // producteur), et rattache optionnellement une carte PRÉCISE du stock, qui passe
    // alors « activée ». On lie exactement le serial choisi par l'opérateur (la carte
    // physique qu'il a en main), pas une carte au hasard. Sans `carteId`, l'INA est
    // actif mais « sans carte » (associable plus tard). Idempotent par producteur.
    activerIna(payload: {
      producteurId:  string
      numeroIna:     string
      prenom:        string
      nom:           string
      telephone:     string
      cooperative:   string
      localite:      string
      carteId?:      string | null
    }): IdentiteINA {
      this.init()
      const existante = this.identites.find((i) => i.producteurId === payload.producteurId)
      if (existante) return existante

      let carteAssociee: CarteAssociee = 'non'
      if (payload.carteId) {
        const carte = this.cartes.find((c) => c.id === payload.carteId && !c.producteurId)
        if (carte) {
          carte.producteurId = payload.producteurId
          carte.statut       = 'activee'
          carte.activatedAt  = new Date().toISOString()
          carteAssociee      = 'oui'
        }
      }

      const identite: IdentiteINA = {
        producteurId:  payload.producteurId,
        numeroIna:     payload.numeroIna,
        prenom:        payload.prenom,
        nom:           payload.nom,
        telephone:     payload.telephone,
        cooperative:   payload.cooperative,
        localite:      payload.localite,
        enrolledAt:    new Date().toISOString(),
        carteAssociee,
      }
      this.identites.push(identite)
      return identite
    },

    // Association d'une carte PRÉCISE à une identité INA déjà active mais sans carte
    // (bouton « Associer une carte » de la liste / de la fiche). L'opérateur choisit
    // le serial exact de la carte physique remise ; on l'active pour le producteur et
    // on bascule `carteAssociee` à 'oui'. Retourne la carte, ou null si le carteId
    // est introuvable / déjà rattaché.
    associerCarte(producteurId: string, carteId: string): CarteINA | null {
      this.init()
      const identite = this.identites.find((i) => i.producteurId === producteurId)
      if (!identite) return null
      const carte = this.cartes.find((c) => c.id === carteId && !c.producteurId)
      if (!carte) return null
      carte.producteurId = producteurId
      carte.statut       = 'activee'
      carte.activatedAt  = new Date().toISOString()
      identite.carteAssociee = 'oui'
      return carte
    },
  },
})
