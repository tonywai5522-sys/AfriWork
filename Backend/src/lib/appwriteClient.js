import { Client, Account, Databases, Users, ID } from 'node-appwrite'
import { appConfig } from '../config/appConfig.js'

let appwriteClientInstance = null
let appwriteAccountInstance = null
let appwriteDatabasesInstance = null
let appwriteUsersInstance = null

function getAppwriteConfig() {
  const { endpoint, projectId, apiKey } = appConfig.appwrite

  if (!endpoint || !projectId) {
    throw new Error(
      'Appwrite configuration incomplete. Set APPWRITE_ENDPOINT and APPWRITE_PROJECT_ID in your .env file.'
    )
  }

  return { endpoint, projectId, apiKey }
}

export function getClient() {
  if (appwriteClientInstance) return appwriteClientInstance

  const { endpoint, projectId, apiKey } = getAppwriteConfig()

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)

  if (apiKey) {
    client.setKey(apiKey)
  }

  appwriteClientInstance = client
  return client
}

export function getAccount() {
  if (appwriteAccountInstance) return appwriteAccountInstance
  appwriteAccountInstance = new Account(getClient())
  return appwriteAccountInstance
}

/**
 * Returns an Account instance using a PUBLIC client (no API key).
 * Used for login operations (createEmailPasswordSession) because
 * the server API key typically lacks the "account" scope.
 */
export function getPublicAccount() {
  const { endpoint, projectId } = getAppwriteConfig()
  const publicClient = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
  return new Account(publicClient)
}

export function getDatabases() {
  if (appwriteDatabasesInstance) return appwriteDatabasesInstance
  appwriteDatabasesInstance = new Databases(getClient())
  return appwriteDatabasesInstance
}

export function getUsers() {
  if (appwriteUsersInstance) return appwriteUsersInstance
  appwriteUsersInstance = new Users(getClient())
  return appwriteUsersInstance
}

export function getAccountWithSession(sessionSecret) {
  if (!sessionSecret) {
    throw new Error('Session secret is required')
  }

  const { endpoint, projectId } = getAppwriteConfig()

  const tempClient = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setSession(sessionSecret)

  return new Account(tempClient)
}

export function resetClients() {
  appwriteClientInstance = null
  appwriteAccountInstance = null
  appwriteDatabasesInstance = null
  appwriteUsersInstance = null
}

export { ID }
