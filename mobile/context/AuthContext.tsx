import { createContext, useCallback, useContext, useState, ReactNode } from 'react'

const DEMO_PHONE = '77 123 45 67'
const DEMO_PIN   = '1234'

interface AuthState {
  isLoggedIn: boolean
  login: (phone: string, pin: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthState>({
  isLoggedIn: false,
  login: () => false,
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const login = useCallback((phone: string, pin: string): boolean => {
    const ok = phone.replace(/\s/g, '') === DEMO_PHONE.replace(/\s/g, '') && pin === DEMO_PIN
    if (ok) setIsLoggedIn(true)
    return ok
  }, [])

  const logout = useCallback(() => setIsLoggedIn(false), [])

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
