import { defineStore } from 'pinia'
import type { WorkflowStep, Question, QuestionType, ValidationType } from '~/types/workflow-step'

let _questionCounter = 0
let _stepCounter = 0

function newQuestion(type: QuestionType): Question {
  return { id: `q-new-${++_questionCounter}`, type, label: '' }
}

export const useWorkflowBuilderStore = defineStore('workflowBuilder', {
  state: () => ({
    steps: [] as WorkflowStep[],
    selectedStepId: null as string | null,
    settingsPanelOpen: false,
    sharePanelOpen: false,
    workflowName: '',
    workflowDescription: '',
    hasUnsavedChanges: false,
  }),

  actions: {
    initSteps(steps: WorkflowStep[]) {
      this.steps = [...steps]
      this.selectedStepId = null
      this.hasUnsavedChanges = false
    },

    initWorkflowMeta(name: string, description: string) {
      this.workflowName = name
      this.workflowDescription = description
    },

    selectStep(id: string | null) {
      this.selectedStepId = id
      this.settingsPanelOpen = false
      this.sharePanelOpen = false
    },

    addStep() {
      const maxOrder = this.steps.length > 0
        ? Math.max(...this.steps.map((st) => st.order))
        : 0
      const id = `step-new-${++_stepCounter}`
      const newStep: WorkflowStep = {
        id,
        order: maxOrder + 1,
        name: 'Nouvelle étape',
        agentRole: '',
        validationType: 'form',
        questions: [],
      }
      this.steps.push(newStep)
      this.selectedStepId = id
      this.settingsPanelOpen = false
      this.hasUnsavedChanges = true
    },

    insertStep(afterId: string) {
      const afterStep = this.steps.find((st) => st.id === afterId)
      if (!afterStep) return
      const insertAt = afterStep.order + 1
      const id = `step-new-${++_stepCounter}`
      const newStep: WorkflowStep = {
        id,
        order: insertAt,
        name: 'Nouvelle étape',
        agentRole: '',
        validationType: 'form',
        questions: [],
      }
      this.steps = this.steps.map((st) =>
        st.order >= insertAt ? { ...st, order: st.order + 1 } : st,
      )
      this.steps.push(newStep)
      this.selectedStepId = id
      this.settingsPanelOpen = false
      this.hasUnsavedChanges = true
    },

    removeStep(id: string) {
      this.steps = this.steps
        .filter((st) => st.id !== id)
        .sort((a, b) => a.order - b.order)
        .map((st, i) => ({ ...st, order: i + 1 }))
      this.selectedStepId = null
      this.hasUnsavedChanges = true
    },

    reorderSteps(orderedIds: string[]) {
      this.steps = this.steps.map((step) => ({
        ...step,
        order: orderedIds.indexOf(step.id) + 1,
      }))
      this.hasUnsavedChanges = true
    },

    updateStep(id: string, patch: Partial<Pick<WorkflowStep, 'name' | 'agentRole' | 'agentId' | 'description' | 'validationType'>>) {
      const step = this.steps.find((s) => s.id === id)
      if (step) Object.assign(step, patch)
      this.hasUnsavedChanges = true
    },

    addQuestion(stepId: string, type: QuestionType) {
      const step = this.steps.find((s) => s.id === stepId)
      if (step) step.questions.push(newQuestion(type))
      this.hasUnsavedChanges = true
    },

    removeQuestion(stepId: string, questionId: string) {
      const step = this.steps.find((s) => s.id === stepId)
      if (step) step.questions = step.questions.filter((q) => q.id !== questionId)
      this.hasUnsavedChanges = true
    },

    updateQuestion(stepId: string, questionId: string, patch: Partial<Pick<Question, 'type' | 'label'>>) {
      const step = this.steps.find((s) => s.id === stepId)
      if (!step) return
      const q = step.questions.find((q) => q.id === questionId)
      if (q) Object.assign(q, patch)
      this.hasUnsavedChanges = true
    },

    openSettings() {
      this.settingsPanelOpen = true
      this.selectedStepId = null
      this.sharePanelOpen = false
    },

    closeSettings() {
      this.settingsPanelOpen = false
    },

    openSharePanel() {
      this.sharePanelOpen = true
      this.settingsPanelOpen = false
      this.selectedStepId = null
    },

    closeSharePanel() {
      this.sharePanelOpen = false
    },

    updateWorkflowMeta(name: string, description: string) {
      this.workflowName = name
      this.workflowDescription = description
      this.hasUnsavedChanges = true
    },

    markSaved() {
      this.hasUnsavedChanges = false
    },
  },
})
