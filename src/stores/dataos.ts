import { defineStore } from 'pinia'
import { useProducteursStore } from '~/stores/producteurs'
import { collecteProducteursMock } from '~/data/dataos'
import type {
  Projet, Formulaire, Invitation, MembreRole,
  Question, QuestionFieldType, FormulaireTemplate, QuestionSettingsPatch,
} from '~/types/dataos'

const today = () => new Date().toISOString().slice(0, 10)
const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

export const useDataOsStore = defineStore('dataos', {
  state: () => ({
    projets:     [] as Projet[],
    formulaires: [] as Formulaire[],
    invitations: [] as Invitation[],
    initialized: false,
    // Synchronisation des données collectées vers KYF (TOQ-559).
    kyfSynced:      false,
    syncShouldFail: false,
  }),

  getters: {
    projetById: (state) => (id: string) => state.projets.find((p) => p.id === id),
    formulaireById: (state) => (id: string) => state.formulaires.find((f) => f.id === id),
    formulairesFor: (state) => (projetId: string) =>
      state.formulaires.filter((f) => f.projetId === projetId),
    invitationsFor: (state) => (projetId: string) =>
      state.invitations.filter((i) => i.projetId === projetId),
    // Producteurs collectés en attente de synchronisation vers KYF.
    pendingKyfCount: (state) => (state.kyfSynced ? 0 : collecteProducteursMock.length),
  },

  actions: {
    // Par défaut, Data OS démarre vide (aucun projet) → état vide.
    // La liste de démo est chargée via un scénario UX (voir scenarios/dataos.ts).
    init() {
      if (this.initialized) return
      this.projets     = []
      this.initialized = true
    },

    setProjets(list: Projet[]) {
      this.projets = list.map((p) => ({ ...p }))
    },

    createProjet(name: string, description: string): Projet {
      const projet: Projet = {
        id:          `prj-${Date.now()}`,
        name,
        description: description || undefined,
        formulaires: 0,
        reponses:    0,
        agents:      0,
        createdAt:   today(),
        createdBy:   'Awa Thiam',
      }
      this.projets.unshift(projet)
      return projet
    },

    renameProjet(id: string, name: string, description: string) {
      const p = this.projets.find((p) => p.id === id)
      if (!p) return
      p.name        = name
      p.description = description || undefined
    },

    duplicateProjet(id: string) {
      const p = this.projets.find((p) => p.id === id)
      if (!p) return
      this.projets.unshift({
        ...p,
        id:        `prj-${Date.now()}`,
        name:      `${p.name} (copie)`,
        reponses:  0,
        createdAt: today(),
      })
    },

    removeProjet(id: string) {
      this.projets = this.projets.filter((p) => p.id !== id)
    },

    // ── Formulaires ────────────────────────────────────────────────
    createFormulaire(projetId: string, name: string, description: string, questions: Question[] = []): Formulaire {
      const formulaire: Formulaire = {
        id:          uid('frm'),
        projetId,
        name,
        description: description || undefined,
        status:      'brouillon',
        questions:   questions.map((q) => ({ ...q })),
        reponses:    0,
        createdAt:   today(),
        createdBy:   'Awa Thiam',
      }
      this.formulaires.unshift(formulaire)
      return formulaire
    },

    createFormulaireFromTemplate(projetId: string, template: FormulaireTemplate): Formulaire {
      const questions = template.questions.map((q) => ({ ...q, id: uid('q') }))
      return this.createFormulaire(projetId, template.name, template.description, questions)
    },

    renameFormulaire(id: string, name: string, description: string) {
      const f = this.formulaires.find((f) => f.id === id)
      if (!f) return
      f.name        = name
      f.description = description || undefined
    },

    duplicateFormulaire(id: string) {
      const f = this.formulaires.find((f) => f.id === id)
      if (!f) return
      this.formulaires.unshift({
        ...f,
        id:        `frm-${Date.now()}`,
        name:      `${f.name} (copie)`,
        status:    'brouillon',
        reponses:  0,
        createdAt: today(),
      })
    },

    removeFormulaire(id: string) {
      this.formulaires = this.formulaires.filter((f) => f.id !== id)
    },

    // ── Questions d'un formulaire ──────────────────────────────────
    addQuestion(formulaireId: string): Question | undefined {
      const f = this.formulaires.find((f) => f.id === formulaireId)
      if (!f) return
      // Type par défaut : texte.
      const question: Question = { id: uid('q'), fieldType: 'text', label: '' }
      f.questions.push(question)
      return question
    },

    // Insère une nouvelle question vierge juste après une question existante.
    addQuestionAfter(formulaireId: string, questionId: string): Question | undefined {
      const f = this.formulaires.find((f) => f.id === formulaireId)
      if (!f) return
      const idx = f.questions.findIndex((q) => q.id === questionId)
      if (idx === -1) return
      // Type par défaut : texte.
      const question: Question = { id: uid('q'), fieldType: 'text', label: '' }
      f.questions.splice(idx + 1, 0, question)
      return question
    },

    setQuestionField(formulaireId: string, questionId: string, fieldType: QuestionFieldType, label: string) {
      const q = this.formulaires.find((f) => f.id === formulaireId)?.questions.find((q) => q.id === questionId)
      if (!q) return
      q.fieldType = fieldType
      q.label     = label
    },

    // Met à jour les réglages d'une question depuis le panneau Paramètres.
    updateQuestionSettings(formulaireId: string, questionId: string, patch: QuestionSettingsPatch) {
      const q = this.formulaires.find((f) => f.id === formulaireId)?.questions.find((q) => q.id === questionId)
      if (!q) return
      if (patch.label !== undefined)            q.label            = patch.label
      if (patch.fieldType !== undefined)        q.fieldType        = patch.fieldType
      if (patch.required !== undefined)         q.required         = patch.required
      if (patch.hint !== undefined)             q.hint             = patch.hint
      if (patch.linkedQuestionId !== undefined) q.linkedQuestionId = patch.linkedQuestionId
      if (patch.producteurs !== undefined)      q.producteurs      = patch.producteurs
      if (patch.producteurSource !== undefined) q.producteurSource = patch.producteurSource
    },

    duplicateQuestion(formulaireId: string, questionId: string) {
      const f = this.formulaires.find((f) => f.id === formulaireId)
      if (!f) return
      const idx = f.questions.findIndex((q) => q.id === questionId)
      if (idx === -1) return
      f.questions.splice(idx + 1, 0, { ...f.questions[idx], id: uid('q') })
    },

    removeQuestion(formulaireId: string, questionId: string) {
      const f = this.formulaires.find((f) => f.id === formulaireId)
      if (!f) return
      f.questions = f.questions.filter((q) => q.id !== questionId)
    },

    reorderQuestions(formulaireId: string, from: number, to: number) {
      const f = this.formulaires.find((f) => f.id === formulaireId)
      if (!f) return
      const [moved] = f.questions.splice(from, 1)
      f.questions.splice(to, 0, moved)
    },

    // ── Synchronisation vers KYF (TOQ-559) ─────────────────────────
    // Pousse les producteurs collectés vers la liste KYF (TOLBI ID).
    syncToKyf(): { ok: boolean; count?: number; error?: string } {
      if (this.syncShouldFail) {
        return { ok: false, error: 'La connexion au service KYF a été interrompue. Réessaie dans un instant.' }
      }
      if (this.kyfSynced) {
        return { ok: false, error: 'Ces producteurs ont déjà été synchronisés vers KYF.' }
      }
      useProducteursStore().addMany(collecteProducteursMock)
      this.kyfSynced = true
      return { ok: true, count: collecteProducteursMock.length }
    },

    // ── Invitations ────────────────────────────────────────────────
    inviteUser(projetId: string, email: string, role: MembreRole): Invitation {
      const invitation: Invitation = {
        id:     `inv-${Date.now()}`,
        projetId,
        email,
        role,
        sentAt: today(),
      }
      this.invitations.push(invitation)
      return invitation
    },
  },
})
