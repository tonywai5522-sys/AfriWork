import { appwriteCollectionDefinitions, appwriteDatabaseConfig } from '../config/appwriteCollections.js'

export function createAppwriteClient() {
  return {
    status: 'not-configured',
    message: 'Appwrite client placeholder',
    database: appwriteDatabaseConfig,
    collections: appwriteCollectionDefinitions,
  }
}

export { appwriteCollectionDefinitions, appwriteDatabaseConfig }
