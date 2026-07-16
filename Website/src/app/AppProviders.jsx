import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AppProviders({ children }) {
  const [user, setUser] = useState(null)

  const value = useMemo(() => ({ user, setUser }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  return useContext(AuthContext)
}
