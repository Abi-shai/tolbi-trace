import { createContext, useCallback, useContext, useState, ReactNode } from 'react'

interface ConnectivityState {
  online: boolean
  setOnline: (online: boolean) => void
  pendingSync: number
  syncFeedback: number | null
  clearSyncFeedback: () => void
}

const ConnectivityContext = createContext<ConnectivityState>({
  online: true,
  setOnline: () => {},
  pendingSync: 0,
  syncFeedback: null,
  clearSyncFeedback: () => {},
})

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const [online, setOnlineRaw] = useState(true)
  const [pendingSync, setPendingSync] = useState(0)
  const [syncFeedback, setSyncFeedback] = useState<number | null>(null)

  const setOnline = useCallback((newOnline: boolean) => {
    setOnlineRaw((prev) => {
      if (!prev && newOnline && pendingSync > 0) {
        // Offline → online transition with pending validations
        setSyncFeedback(pendingSync)
        setPendingSync(0)
      }
      if (prev && !newOnline) {
        // Online → offline: mock 3 pending validations queued
        setPendingSync(3)
      }
      return newOnline
    })
  }, [pendingSync])

  const clearSyncFeedback = useCallback(() => setSyncFeedback(null), [])

  return (
    <ConnectivityContext.Provider
      value={{ online, setOnline, pendingSync, syncFeedback, clearSyncFeedback }}
    >
      {children}
    </ConnectivityContext.Provider>
  )
}

export const useConnectivity = () => useContext(ConnectivityContext)
