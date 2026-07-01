import { defineStore } from 'pinia'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastOptions {
  title: string
  description?: string
  actions?: ToastAction[]
  /** Durée d'affichage en ms (0 = persistant jusqu'à fermeture manuelle). */
  duration?: number
}

export interface Toast {
  id: number
  title: string
  description?: string
  actions?: ToastAction[]
}

let seq = 0
// Timers hors du state (non sérialisables).
const timers = new Map<number, ReturnType<typeof setTimeout>>()

export const useToastStore = defineStore('toast', {
  state: () => ({
    items: [] as Toast[],
  }),

  actions: {
    show(opts: ToastOptions) {
      const id = ++seq
      this.items.push({ id, title: opts.title, description: opts.description, actions: opts.actions })
      const duration = opts.duration ?? 4000
      if (duration > 0) timers.set(id, setTimeout(() => this.dismiss(id), duration))
      return id
    },

    dismiss(id: number) {
      const t = timers.get(id)
      if (t) { clearTimeout(t); timers.delete(id) }
      this.items = this.items.filter((x) => x.id !== id)
    },
  },
})
