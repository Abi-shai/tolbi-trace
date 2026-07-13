import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react'

export type Role = 'agent' | 'producer'
export type Lang = 'fr' | 'en' | 'wo'

interface AppState {
  /* session */
  authed: boolean
  role: Role | null
  login: (role: Role) => void
  logout: () => void

  /* onboarding */
  hasOnboarded: boolean
  setHasOnboarded: (v: boolean) => void

  /* activation agent — le code personnel existe-t-il déjà sur cet appareil ? */
  agentActivated: boolean
  setAgentActivated: (v: boolean) => void
  agentCode: string | null
  setAgentCode: (c: string | null) => void

  /* language */
  lang: Lang
  setLang: (l: Lang) => void

  /* connectivity + offline sync queue (mirrors the prototype) */
  online: boolean
  toggleOffline: () => void
  pendingSync: number
  syncFeedback: number | null
  clearSyncFeedback: () => void
  doSync: () => void
}

const Ctx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [role, setRole] = useState<Role | null>(null)
  const [hasOnboarded, setHasOnboarded] = useState(false)
  const [agentActivated, setAgentActivated] = useState(false)
  const [agentCode, setAgentCode] = useState<string | null>(null)
  const [lang, setLang] = useState<Lang>('fr')
  const [online, setOnline] = useState(true)
  const [pendingSync, setPendingSync] = useState(0)
  const [syncFeedback, setSyncFeedback] = useState<number | null>(null)

  const login = useCallback((r: Role) => {
    setRole(r)
    setAuthed(true)
    setHasOnboarded(true)
  }, [])

  const logout = useCallback(() => {
    setAuthed(false)
    setRole(null)
  }, [])

  const toggleOffline = useCallback(() => {
    setOnline((prev) => {
      const next = !prev
      if (prev && !next) {
        // going offline → queue 3 mock pending validations
        setPendingSync(3)
      } else if (!prev && next) {
        // coming back online → flush the queue with feedback
        setPendingSync((p) => {
          if (p > 0) setSyncFeedback(p)
          return 0
        })
      }
      return next
    })
  }, [])

  const doSync = useCallback(() => {
    if (!online) return
    setPendingSync((p) => {
      if (p > 0) setSyncFeedback(p)
      return 0
    })
  }, [online])

  const clearSyncFeedback = useCallback(() => setSyncFeedback(null), [])

  const value = useMemo<AppState>(
    () => ({
      authed, role, login, logout,
      hasOnboarded, setHasOnboarded,
      agentActivated, setAgentActivated,
      agentCode, setAgentCode,
      lang, setLang,
      online, toggleOffline, pendingSync, syncFeedback, clearSyncFeedback, doSync,
    }),
    [authed, role, login, logout, hasOnboarded, agentActivated, agentCode, lang, online, pendingSync, syncFeedback, toggleOffline, doSync, clearSyncFeedback],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp must be used within AppProvider')
  return v
}
