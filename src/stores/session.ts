import { defineStore } from 'pinia'
import { currentUser, defaultNotificationPreferences } from '~/data/account'
import { organisationsMock } from '~/data/organisations'
import type { User, NotificationPreferences, Langue } from '~/types/user'
import type { Organisation, OrganisationType, ModuleAccess, Membre, OrgAgent } from '~/types/organisation'

// Session applicative : le User connecté + ses organisations + l'org active.
// C'est la source de vérité de la navigation multi-org (switcher topbar) et des
// deux périmètres de Paramètres (Personnel = user, Organisation = org active).
export const useSessionStore = defineStore('session', {
  state: () => ({
    user:                    null as User | null,
    organisations:          [] as Organisation[],
    activeOrgId:             '' as string,
    notificationPreferences: { ...defaultNotificationPreferences } as NotificationPreferences,
    initialized:             false,
    _seq:                    100,
  }),

  getters: {
    activeOrg(state): Organisation | null {
      return state.organisations.find((o) => o.id === state.activeOrgId) ?? null
    },
    // Le User connecté est-il Propriétaire de l'org active ? Gouvernance (membres,
    // facturation, suppression) — cf. ADR-0010. Remplace l'ancien canManageOrg.
    isOwner(): boolean {
      return this.activeOrg?.isOwner ?? false
    },
    userInitials(state): string {
      const u = state.user
      if (!u) return ''
      return `${u.prenom.charAt(0)}${u.nom.charAt(0)}`.toUpperCase()
    },
    userFullName(state): string {
      return state.user ? `${state.user.prenom} ${state.user.nom}` : ''
    },
    creditsRemaining(): number {
      const p = this.activeOrg?.plan
      return p ? Math.max(0, p.creditsIncluded - p.creditsUsed) : 0
    },
  },

  actions: {
    init() {
      if (this.initialized) return
      this.user                    = { ...currentUser }
      this.organisations           = structuredClone(organisationsMock)
      this.activeOrgId             = this.organisations[0]?.id ?? ''
      this.notificationPreferences = { ...defaultNotificationPreferences }
      this.initialized             = true
    },

    _nextId(prefix: string): string {
      this._seq += 1
      return `${prefix}-${this._seq}`
    },

    // ── Compte (User) ────────────────────────────────────────────────────────
    updateAccount(patch: Partial<User>) {
      if (this.user) Object.assign(this.user, patch)
    },
    setLangue(langue: Langue) {
      if (this.user) this.user.langue = langue
    },
    updateNotificationPreferences(patch: Partial<NotificationPreferences>) {
      Object.assign(this.notificationPreferences, patch)
    },

    // ── Navigation multi-org ─────────────────────────────────────────────────
    switchOrg(id: string) {
      if (this.organisations.some((o) => o.id === id)) this.activeOrgId = id
    },
    createOrg(payload: { name: string; type: OrganisationType }): Organisation {
      const me = this.user
      const org: Organisation = {
        id:           this._nextId('org'),
        name:         payload.name,
        type:         payload.type,
        logoInitials: payload.name.slice(0, 2).toUpperCase(),
        logoColor:    '#1D9E75',
        isOwner:        true,
        enabledModules: ['id', 'dataos', 'source'],
        plan:           { name: 'Découverte', status: 'essai', trialDaysLeft: 14, creditsIncluded: 50, creditsUsed: 0 },
        membres: me
          ? [{ id: this._nextId('m'), prenom: me.prenom, nom: me.nom, email: me.email, telephone: me.telephone, access: {}, proprietaire: true, status: 'actif', isCurrentUser: true }]
          : [],
        agents:         [],
        paymentMethods: [],
        invoices:       [],
      }
      this.organisations.push(org)
      this.activeOrgId = org.id
      return org
    },
    // Quitter (je ne suis plus membre) ou supprimer (l'org disparaît) : côté mock,
    // les deux retirent l'org de ma liste et rebasculent sur une autre.
    leaveOrg(id: string) {
      this.organisations = this.organisations.filter((o) => o.id !== id)
      if (this.activeOrgId === id) this.activeOrgId = this.organisations[0]?.id ?? ''
    },
    deleteOrg(id: string) {
      this.leaveOrg(id)
    },
    updateActiveOrg(patch: Partial<Pick<Organisation, 'name' | 'type' | 'logoInitials' | 'logoColor'>>) {
      if (this.activeOrg) Object.assign(this.activeOrg, patch)
    },

    // ── Membres (org active) ─────────────────────────────────────────────────
    inviteMembre(payload: { prenom: string; nom: string; email: string; telephone?: string; access: ModuleAccess }) {
      const org = this.activeOrg
      if (!org) return
      org.membres.push({
        id:            this._nextId('m'),
        prenom:        payload.prenom,
        nom:           payload.nom,
        email:         payload.email,
        telephone:     payload.telephone,
        access:        { ...payload.access },
        proprietaire:  false,
        status:        'invite',
        isCurrentUser: false,
      })
    },
    // Édition d'un membre (nom, email, téléphone, accès par module).
    updateMembre(membreId: string, patch: Partial<Pick<Membre, 'prenom' | 'nom' | 'email' | 'telephone' | 'access'>>) {
      const m = this.activeOrg?.membres.find((x) => x.id === membreId)
      if (m) Object.assign(m, patch)
    },
    removeMembre(membreId: string) {
      const org = this.activeOrg
      if (!org) return
      org.membres = org.membres.filter((x) => x.id !== membreId)
    },

    // ── Agents (org active) — Sprint 18 ──────────────────────────────────────
    // On ajoute l'agent sans code : il configure son code à 4 chiffres lui-même à sa
    // première connexion sur l'app mobile (code personnel, jamais géré côté web).
    inviteAgent(payload: { prenom: string; nom: string; telephone: string }) {
      const org = this.activeOrg
      if (!org) return
      org.agents.push({
        id:        this._nextId('ag'),
        prenom:    payload.prenom,
        nom:       payload.nom,
        telephone: payload.telephone,
        statut:    'actif',
      })
    },
    updateAgent(agentId: string, patch: Partial<Pick<OrgAgent, 'prenom' | 'nom' | 'telephone' | 'statut'>>) {
      const a = this.activeOrg?.agents.find((x) => x.id === agentId)
      if (a) Object.assign(a, patch)
    },
    removeAgent(agentId: string) {
      const org = this.activeOrg
      if (!org) return
      org.agents = org.agents.filter((x) => x.id !== agentId)
    },

    // ── Paiement (org active) ────────────────────────────────────────────────
    addPaymentMethod(payload: { brand: 'visa' | 'mastercard'; last4: string; expMonth: number; expYear: number }) {
      const org = this.activeOrg
      if (!org) return
      const makeDefault = org.paymentMethods.length === 0
      org.paymentMethods.push({ id: this._nextId('pm'), ...payload, isDefault: makeDefault })
    },
    setDefaultPaymentMethod(pmId: string) {
      this.activeOrg?.paymentMethods.forEach((pm) => { pm.isDefault = pm.id === pmId })
    },
    removePaymentMethod(pmId: string) {
      const org = this.activeOrg
      if (!org) return
      org.paymentMethods = org.paymentMethods.filter((pm) => pm.id !== pmId)
    },
  },
})
