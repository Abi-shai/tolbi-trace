interface TaskMeta {
  validated?: number
  anomalies?: number
}

interface StepData {
  tasks: Record<string, boolean>
  meta: TaskMeta
}

const store: Record<string, StepData> = {}

export function markTaskDone(stepId: string, taskId: string, meta?: TaskMeta) {
  if (!store[stepId]) store[stepId] = { tasks: {}, meta: {} }
  store[stepId].tasks[taskId] = true
  if (meta) store[stepId].meta = { ...store[stepId].meta, ...meta }
}

export function isTaskDone(stepId: string, taskId: string): boolean {
  return store[stepId]?.tasks[taskId] ?? false
}

export function getStepMeta(stepId: string): TaskMeta {
  return store[stepId]?.meta ?? {}
}
