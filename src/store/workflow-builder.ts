import { create } from 'zustand'
import type { WorkflowStep, Question, QuestionType, ValidationType } from '@/types/workflow-step'

let _questionCounter = 0
let _stepCounter = 0

function newQuestion(type: QuestionType): Question {
  return { id: `q-new-${++_questionCounter}`, type, label: '' }
}

interface WorkflowBuilderState {
  steps: WorkflowStep[]
  selectedStepId: string | null
  settingsPanelOpen: boolean
  sharePanelOpen: boolean
  workflowName: string
  workflowDescription: string
  hasUnsavedChanges: boolean

  initSteps:           (steps: WorkflowStep[]) => void
  initWorkflowMeta:    (name: string, description: string) => void
  selectStep:          (id: string | null) => void
  addStep:             () => void
  insertStep:          (afterId: string) => void
  removeStep:          (id: string) => void
  reorderSteps:        (orderedIds: string[]) => void
  updateStep:          (id: string, patch: Partial<Pick<WorkflowStep, 'name' | 'agentRole' | 'agentId' | 'description' | 'validationType'>>) => void
  addQuestion:         (stepId: string, type: QuestionType) => void
  removeQuestion:      (stepId: string, questionId: string) => void
  updateQuestion:      (stepId: string, questionId: string, patch: Partial<Pick<Question, 'type' | 'label'>>) => void
  openSettings:        () => void
  closeSettings:       () => void
  openSharePanel:      () => void
  closeSharePanel:     () => void
  updateWorkflowMeta:  (name: string, description: string) => void
  markSaved:           () => void
}

export const useWorkflowBuilderStore = create<WorkflowBuilderState>((set) => ({
  steps: [],
  selectedStepId: null,
  settingsPanelOpen: false,
  sharePanelOpen: false,
  workflowName: '',
  workflowDescription: '',
  hasUnsavedChanges: false,

  initSteps: (steps) => set({ steps, selectedStepId: null, hasUnsavedChanges: false }),

  initWorkflowMeta: (name, description) =>
    set({ workflowName: name, workflowDescription: description }),

  selectStep: (id) => set({ selectedStepId: id, settingsPanelOpen: false, sharePanelOpen: false }),

  addStep: () =>
    set((s) => {
      const maxOrder = s.steps.length > 0 ? Math.max(...s.steps.map((st) => st.order)) : 0
      const id = `step-new-${++_stepCounter}`
      const newStep: WorkflowStep = {
        id,
        order: maxOrder + 1,
        name: 'Nouvelle étape',
        agentRole: '',
        validationType: 'form',
        questions: [],
      }
      return { steps: [...s.steps, newStep], selectedStepId: id, settingsPanelOpen: false, hasUnsavedChanges: true }
    }),

  insertStep: (afterId) =>
    set((s) => {
      const afterStep = s.steps.find((st) => st.id === afterId)
      if (!afterStep) return {}
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
      const shifted = s.steps.map((st) =>
        st.order >= insertAt ? { ...st, order: st.order + 1 } : st,
      )
      return { steps: [...shifted, newStep], selectedStepId: id, settingsPanelOpen: false, hasUnsavedChanges: true }
    }),

  removeStep: (id) =>
    set((s) => {
      const remaining = [...s.steps.filter((st) => st.id !== id)]
        .sort((a, b) => a.order - b.order)
        .map((st, i) => ({ ...st, order: i + 1 }))
      return { steps: remaining, selectedStepId: null, hasUnsavedChanges: true }
    }),

  reorderSteps: (orderedIds) =>
    set((s) => ({
      steps: s.steps.map((step) => ({
        ...step,
        order: orderedIds.indexOf(step.id) + 1,
      })),
      hasUnsavedChanges: true,
    })),

  updateStep: (id, patch) =>
    set((s) => ({
      steps: s.steps.map((step) => (step.id === id ? { ...step, ...patch } : step)),
      hasUnsavedChanges: true,
    })),

  addQuestion: (stepId, type) =>
    set((s) => ({
      steps: s.steps.map((step) =>
        step.id === stepId
          ? { ...step, questions: [...step.questions, newQuestion(type)] }
          : step,
      ),
      hasUnsavedChanges: true,
    })),

  removeQuestion: (stepId, questionId) =>
    set((s) => ({
      steps: s.steps.map((step) =>
        step.id === stepId
          ? { ...step, questions: step.questions.filter((q) => q.id !== questionId) }
          : step,
      ),
      hasUnsavedChanges: true,
    })),

  updateQuestion: (stepId, questionId, patch) =>
    set((s) => ({
      steps: s.steps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              questions: step.questions.map((q) =>
                q.id === questionId ? { ...q, ...patch } : q,
              ),
            }
          : step,
      ),
      hasUnsavedChanges: true,
    })),

  openSettings: () => set({ settingsPanelOpen: true, selectedStepId: null, sharePanelOpen: false }),

  closeSettings: () => set({ settingsPanelOpen: false }),

  openSharePanel: () => set({ sharePanelOpen: true, settingsPanelOpen: false, selectedStepId: null }),

  closeSharePanel: () => set({ sharePanelOpen: false }),

  updateWorkflowMeta: (name, description) =>
    set({ workflowName: name, workflowDescription: description, hasUnsavedChanges: true }),

  markSaved: () => set({ hasUnsavedChanges: false }),
}))
