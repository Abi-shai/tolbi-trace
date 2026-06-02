import { createContext, useContext, useState } from 'react'

export const PERSONA_META = [
  { name: 'Mamadou Diallo', initials: 'MD', hint: 'Agent · Étape 2+' },
  { name: 'Ibrahim Sow',    initials: 'IS', hint: 'Agent · Étape 1'  },
]

interface ExplorationContextType {
  explorationEnabled: boolean
  setExplorationEnabled: (v: boolean) => void
  personaIndex: number
  cyclePersona: () => void
}

const ExplorationContext = createContext<ExplorationContextType>({
  explorationEnabled: false,
  setExplorationEnabled: () => {},
  personaIndex: 0,
  cyclePersona: () => {},
})

export function ExplorationProvider({ children }: { children: React.ReactNode }) {
  const [explorationEnabled, setExplorationEnabled] = useState(false)
  const [personaIndex, setPersonaIndex] = useState(0)

  const cyclePersona = () =>
    setPersonaIndex((i) => (i + 1) % PERSONA_META.length)

  return (
    <ExplorationContext.Provider value={{ explorationEnabled, setExplorationEnabled, personaIndex, cyclePersona }}>
      {children}
    </ExplorationContext.Provider>
  )
}

export function useExploration() {
  return useContext(ExplorationContext)
}
