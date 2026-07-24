import 'dotenv/config'

export const appConfig = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  appwrite: {
    endpoint: process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
    projectId: process.env.APPWRITE_PROJECT_ID || '',
    apiKey: process.env.APPWRITE_API_KEY || '',
    databaseId: process.env.APPWRITE_DATABASE_ID || '',
    usersCollectionId: process.env.APPWRITE_USERS_COLLECTION_ID || 'users',
    sessionsCollectionId: process.env.APPWRITE_SESSIONS_COLLECTION_ID || 'sessions',
    recoveryRedirectUrl: process.env.APPWRITE_RECOVERY_REDIRECT_URL || 'http://localhost:5173/reset-password',
    verificationRedirectUrl: process.env.APPWRITE_VERIFICATION_REDIRECT_URL || 'http://localhost:5173/verify-email',
  },

  rateLimit: { 
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 20,
  },

  roles: {
    all: ['talent', 'employer', 'admin', 'moderator', 'partner'],
    defaults: {
      register: 'talent',
    },
    hierarchy: {
      talent: 1,
      partner: 2,
      moderator: 3,
      employer: 4,
      admin: 5,
    },
  },

  isProduction() {
    return this.nodeEnv === 'production'
  },

  isDevelopment() {
    return this.nodeEnv === 'development'
  },
}
