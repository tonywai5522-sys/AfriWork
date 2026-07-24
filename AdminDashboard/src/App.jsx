import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AdminLayout from './layouts/AdminLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import OverviewPage from './pages/OverviewPage.jsx'
import UsersPage from './pages/UsersPage.jsx'
import EmployersPage from './pages/EmployersPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import VerificationsPage from './pages/VerificationsPage.jsx'
import ContentModerationPage from './pages/ContentModerationPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import ActivityLogPage from './pages/ActivityLogPage.jsx'
import AuditLogsPage from './pages/AuditLogsPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('admin_token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

function ProtectedLayout({ children }) {
  return (
    <PrivateRoute>
      <AdminLayout>{children}</AdminLayout>
    </PrivateRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            border: '2px solid #0f172a',
            background: '#fff',
            color: '#0f172a',
            fontSize: '13px',
            fontWeight: 700,
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedLayout><OverviewPage /></ProtectedLayout>} />
        <Route path="/users" element={<ProtectedLayout><UsersPage /></ProtectedLayout>} />
        <Route path="/employers" element={<ProtectedLayout><EmployersPage /></ProtectedLayout>} />
        <Route path="/projects" element={<ProtectedLayout><ProjectsPage /></ProtectedLayout>} />
        <Route path="/verifications" element={<ProtectedLayout><VerificationsPage /></ProtectedLayout>} />
        <Route path="/content" element={<ProtectedLayout><ContentModerationPage /></ProtectedLayout>} />
        <Route path="/reports" element={<ProtectedLayout><ReportsPage /></ProtectedLayout>} />
        <Route path="/activity" element={<ProtectedLayout><ActivityLogPage /></ProtectedLayout>} />
        <Route path="/audit-logs" element={<ProtectedLayout><AuditLogsPage /></ProtectedLayout>} />
        <Route path="/analytics" element={<ProtectedLayout><AnalyticsPage /></ProtectedLayout>} />
        <Route path="/settings" element={<ProtectedLayout><SettingsPage /></ProtectedLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
