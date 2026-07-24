import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout.jsx'
import { ProtectedRoute, PublicOnlyRoute } from '../components/auth/ProtectedRoute.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { ROUTES, getDefaultDashboard } from '../constants/routes.js'

const HomePage = lazy(() => import('../pages/HomePage.jsx'))
const LoginPage = lazy(() => import('../pages/auth/LoginPage.jsx'))
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage.jsx'))
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage.jsx'))
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage.jsx'))
const VerifyEmailPage = lazy(() => import('../pages/auth/VerifyEmailPage.jsx'))
const DashboardPage = lazy(() => import('../pages/auth/DashboardPage.jsx'))
const EditProfilePage = lazy(() => import('../pages/profile/EditProfilePage.jsx'))
const TalentDashboard = lazy(() => import('../pages/dashboard/TalentDashboard.jsx'))
const EmployerDashboard = lazy(() => import('../pages/dashboard/EmployerDashboard.jsx'))
const DiscoverTalents = lazy(() => import('../pages/talent/DiscoverTalents.jsx'))
const CompanyProfilePage = lazy(() => import('../pages/employer/CompanyProfilePage.jsx'))
const MyTeams = lazy(() => import('../pages/teams/MyTeams.jsx'))
const TeamDetail = lazy(() => import('../pages/teams/TeamDetail.jsx'))
const WorkspacesList = lazy(() => import('../pages/workspaces/WorkspacesList.jsx'))
const WorkspaceDetail = lazy(() => import('../pages/workspaces/WorkspaceDetail.jsx'))
const SearchResults = lazy(() => import('../pages/search/SearchResults.jsx'))
const BrowseJobs = lazy(() => import('../pages/jobs/BrowseJobs.jsx'))
const MyApplications = lazy(() => import('../pages/applications/MyApplications.jsx'))
const EmployerApplications = lazy(() => import('../pages/applications/EmployerApplications.jsx'))
const ApplicationReview = lazy(() => import('../pages/applications/ApplicationReview.jsx'))
const MyPortfolio = lazy(() => import('../pages/portfolio/MyPortfolio.jsx'))
const ProjectDetail = lazy(() => import('../pages/portfolio/ProjectDetail.jsx'))
const MessagesPage = lazy(() => import('../pages/chat/MessagesPage.jsx'))
const NotificationsPage = lazy(() => import('../pages/notifications/NotificationsPage.jsx'))
const CourseListing = lazy(() => import('../pages/learning/CourseListing.jsx'))
const CourseDetail = lazy(() => import('../pages/learning/CourseDetail.jsx'))
const LessonView = lazy(() => import('../pages/learning/LessonView.jsx'))
const MyLearning = lazy(() => import('../pages/learning/MyLearning.jsx'))
const SavedItemsPage = lazy(() => import('../pages/saved/SavedItemsPage.jsx'))

function LoadingFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-aw-200 border-t-aw-900" />
        <p className="text-sm text-aw-400">Loading...</p>
      </div>
    </div>
  )
}

function RoleRedirect() {
  const { user } = useAuth()
  const location = useLocation()
  const target = getDefaultDashboard(user?.role)
  return <Navigate to={target} state={{ from: location }} replace />
}

export default function AppRouter() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <MainLayout>
        <LoadingFallback />
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route path={ROUTES.login} element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path={ROUTES.register} element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
          <Route path={ROUTES.forgotPassword} element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
          <Route path={ROUTES.resetPassword} element={<ResetPasswordPage />} />
          <Route path={ROUTES.verifyEmail} element={<VerifyEmailPage />} />
          <Route path="/auth" element={<Navigate to={ROUTES.login} replace />} />
          <Route path={ROUTES.dashboard} element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />
          <Route path={ROUTES.dashboardTalent} element={<ProtectedRoute><TalentDashboard /></ProtectedRoute>} />
          <Route path={ROUTES.dashboardEmployer} element={<ProtectedRoute requiredRoles={['employer', 'admin']}><EmployerDashboard /></ProtectedRoute>} />
          <Route path={ROUTES.profile} element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
          <Route path={ROUTES.network} element={<ProtectedRoute><DiscoverTalents /></ProtectedRoute>} />
          <Route path={ROUTES.jobs} element={<ProtectedRoute><BrowseJobs /></ProtectedRoute>} />
          <Route path={ROUTES.applications} element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
          <Route path={ROUTES.applicationDetail} element={<ProtectedRoute><ApplicationReview /></ProtectedRoute>} />
          <Route path={ROUTES.applicationsEmployer} element={<ProtectedRoute requiredRoles={['employer', 'admin']}><EmployerApplications /></ProtectedRoute>} />
          <Route path={ROUTES.applicationReview} element={<ProtectedRoute requiredRoles={['employer', 'admin']}><ApplicationReview /></ProtectedRoute>} />
          <Route path={ROUTES.portfolio} element={<ProtectedRoute><MyPortfolio /></ProtectedRoute>} />
          <Route path={ROUTES.portfolioProject} element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
          <Route path={ROUTES.company} element={<ProtectedRoute requiredRoles={['employer', 'admin']}><CompanyProfilePage /></ProtectedRoute>} />
          <Route path={ROUTES.teams} element={<ProtectedRoute><MyTeams /></ProtectedRoute>} />
          <Route path={ROUTES.teamDetail} element={<ProtectedRoute><TeamDetail /></ProtectedRoute>} />
          <Route path={ROUTES.projects} element={<ProtectedRoute><WorkspacesList /></ProtectedRoute>} />
          <Route path={ROUTES.projectDetail} element={<ProtectedRoute><WorkspaceDetail /></ProtectedRoute>} />
          <Route path={ROUTES.messages} element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path={`${ROUTES.messages}/:conversationId`} element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path={ROUTES.notifications} element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/learning" element={<ProtectedRoute><CourseListing /></ProtectedRoute>} />
          <Route path="/learning/my" element={<ProtectedRoute><MyLearning /></ProtectedRoute>} />
          <Route path="/learning/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
          <Route path="/learning/:courseId/lessons/:lessonId" element={<ProtectedRoute><LessonView /></ProtectedRoute>} />
          <Route path={ROUTES.saved} element={<ProtectedRoute><SavedItemsPage /></ProtectedRoute>} />
          <Route path={ROUTES.search} element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
        </Routes>
      </Suspense>
    </MainLayout>
  )
}
