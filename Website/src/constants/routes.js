export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',
  dashboard: '/dashboard',
  dashboardTalent: '/dashboard/talent',
  dashboardEmployer: '/dashboard/employer',
  saved: '/saved',
  profile: '/profile',
  settings: '/settings',
  admin: '/admin',
  search: '/search',
  jobs: '/jobs',
  applications: '/applications',
  applicationsEmployer: '/employer/applications',
  applicationDetail: '/applications/:applicationId',
  applicationReview: '/employer/applications/:applicationId',
  portfolio: '/portfolio',
  portfolioProject: '/portfolio/:projectId',
  messages: '/messages',
  projects: '/projects',
  projectDetail: '/projects/:projectId',
  workspaces: '/workspaces',
  workspaceDetail: '/workspaces/:workspaceId',
  network: '/network',
  analytics: '/analytics',
  company: '/company',
  teams: '/teams',
  teamDetail: '/teams/:teamId',
  notifications: '/notifications',
  help: '/help',
}

export const PUBLIC_ROUTES = [
  ROUTES.home,
  ROUTES.login,
  ROUTES.register,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
  ROUTES.verifyEmail,
]

export const ROLE_DASHBOARDS = {
  talent: ROUTES.dashboardTalent,
  employer: ROUTES.dashboardEmployer,
  admin: ROUTES.dashboardAdmin,
  moderator: ROUTES.dashboard,
  partner: ROUTES.dashboard,
}

export function getDefaultDashboard(role) {
  return ROLE_DASHBOARDS[role] || ROUTES.dashboardTalent
}
