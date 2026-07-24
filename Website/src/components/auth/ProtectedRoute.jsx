import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { ROUTES, PUBLIC_ROUTES } from '../../constants/routes.js'

export function ProtectedRoute({ children, requiredRoles }) {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="text-sm text-slate-500">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location.pathname }} replace />
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = user?.role || 'talent'
    if (!requiredRoles.includes(userRole)) {
      return <Navigate to={ROUTES.home} replace />
    }
  }

  return children
}

export function PublicOnlyRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="text-sm text-slate-500">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    const from = location.state?.from || ROUTES.dashboard
    return <Navigate to={from} replace />
  }

  return children
}
