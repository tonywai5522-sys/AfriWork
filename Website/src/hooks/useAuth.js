import { useAuthContext } from '../app/AppProviders.jsx'

export function useAuth() {
  return useAuthContext()
}
