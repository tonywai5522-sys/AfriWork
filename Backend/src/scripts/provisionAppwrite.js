import 'dotenv/config'
import { Client, Databases, Permission, Role, ID } from 'node-appwrite'
import { appwriteDatabaseConfig, appwriteCollectionDefinitions } from '../config/appwriteCollections.js'

const endpoint = process.env.APPWRITE_ENDPOINT
const projectId = process.env.APPWRITE_PROJECT_ID
const apiKey = process.env.APPWRITE_API_KEY
const configuredDatabaseId = process.env.APPWRITE_DATABASE_ID

if (!endpoint || !projectId || !apiKey) {
  console.error('Missing Appwrite environment variables. Set APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, and APPWRITE_API_KEY.')
  process.exit(1)
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey)

const databases = new Databases(client)

function createAttributeHandler(databaseId, collectionId, attribute) {
  const common = {
    key: attribute.key,
    required: attribute.required ?? false,
    xdefault: attribute.required ? undefined : (attribute.default ?? undefined),
    array: attribute.array ?? false,
  }

  switch (attribute.type) {
    case 'string':
      return databases.createStringAttribute(databaseId, collectionId, attribute.key, attribute.size ?? 255, common.required, common.xdefault, common.array)
    case 'integer':
      return databases.createIntegerAttribute(databaseId, collectionId, attribute.key, common.required, attribute.min ?? null, attribute.max ?? null, common.xdefault, common.array)
    case 'double':
      return databases.createFloatAttribute(databaseId, collectionId, attribute.key, common.required, attribute.min ?? null, attribute.max ?? null, common.xdefault, common.array)
    case 'boolean':
      return databases.createBooleanAttribute(databaseId, collectionId, attribute.key, common.required, common.xdefault, common.array)
    case 'datetime':
      return databases.createDatetimeAttribute(databaseId, collectionId, attribute.key, common.required, common.xdefault, common.array)
    case 'email':
      return databases.createEmailAttribute(databaseId, collectionId, attribute.key, common.required, common.xdefault, common.array)
    case 'url':
      return databases.createUrlAttribute(databaseId, collectionId, attribute.key, common.required, common.xdefault, common.array)
    case 'enum':
      return databases.createEnumAttribute(databaseId, collectionId, attribute.key, attribute.elements ?? [], common.required, common.xdefault, common.array)
    default:
      return databases.createStringAttribute(databaseId, collectionId, attribute.key, attribute.size ?? 255, common.required, common.xdefault, common.array)
  }
}

async function ensureDatabase() {
  const dbId = configuredDatabaseId || appwriteDatabaseConfig.id
  const dbName = appwriteDatabaseConfig.name

  // If we have a configured database ID, try to get it first
  if (dbId) {
    try {
      const existing = await databases.get(dbId)
      console.log(`Using existing database: ${existing.name} (${existing.$id})`)
      return existing
    } catch (error) {
      if (error?.code !== 404) {
        throw error
      }
      console.log(`Database ${dbId} not found. Will attempt to create it.`)
    }
  }

  // Try to find an existing database by name
  try {
    const allDatabases = await databases.list()
    const existing = allDatabases.databases.find((db) => db.name === dbName)
    if (existing) {
      console.log(`Found existing database by name "${dbName}" (${existing.$id})`)
      return existing
    }
  } catch (e) {
    console.log(`Could not list databases: ${e.message}`)
  }

  // Create the database
  try {
    const newDb = await databases.create(
      dbId || ID.unique(),
      dbName,
      true
    )
    console.log(`Created new database: ${newDb.name} (${newDb.$id})`)
    if (!configuredDatabaseId) {
      console.log(`\n⚠️  Set APPWRITE_DATABASE_ID=${newDb.$id} in your .env file to persist this database ID.`)
    }
    return newDb
  } catch (createError) {
    if (createError?.code === 409 || createError?.message?.includes('already exists')) {
      // Race condition: another process created it between our check and create
      const existing = await databases.get(createError.$id || dbId)
      return existing
    }
    if (createError?.code === 403 || createError?.message?.includes('maximum number of databases')) {
      const allDatabases = await databases.list()
      const existing = allDatabases.databases.find((db) => db.name === dbName)
      if (existing) {
        return existing
      }
      throw new Error('Appwrite plan limit prevents creating a new database. Please delete an existing database or upgrade your plan.')
    }
    throw createError
  }
}

async function ensureCollection(databaseId, collection) {
  const existingCollection = await databases.getCollection(databaseId, collection.key).catch((error) => {
    if (error?.code === 404) {
      return null
    }
    throw error
  })

  if (existingCollection) {
    console.log(`  Collection already exists: ${collection.name} (${collection.key})`)
    return existingCollection
  }

  try {
    const createdCollection = await databases.createCollection(databaseId, collection.key, collection.name, [
      Permission.read(Role.any()),
      Permission.write(Role.users()),
    ], true, true)

    console.log(`  Created collection: ${collection.name} (${createdCollection.$id})`)

    for (const attribute of collection.attributes) {
      await createAttributeHandler(databaseId, createdCollection.$id, attribute).catch((error) => {
        if (error?.code === 409 || error?.message?.includes('already exists')) {
          return null
        }
        if (error?.code === 400 || error?.message?.includes('maximum number or size of attributes')) {
          console.warn(`    Skipping attribute ${attribute.key} for ${collection.name}: plan limit reached.`)
          return null
        }
        throw error
      })
    }

    for (const index of collection.indexes || []) {
      await databases.createIndex(databaseId, createdCollection.$id, index.key, index.type, index.attributes, index.orders || []).catch((error) => {
        if (error?.code === 409 || error?.message?.includes('already exists')) {
          return null
        }
        if (error?.code === 400 || error?.message?.includes('maximum number')) {
          console.warn(`    Skipping index ${index.key} for ${collection.name}: plan limit reached.`)
          return null
        }
        throw error
      })
    }

    return createdCollection
  } catch (error) {
    if (error?.code === 409 || error?.message?.includes('already exists')) {
      return await databases.getCollection(databaseId, collection.key)
    }
    throw error
  }
}

async function main() {
  console.log(`Provisioning Appwrite database "${appwriteDatabaseConfig.name}"...`)
  const database = await ensureDatabase()

  console.log(`Using database ID: ${database.$id}`)

  for (const collection of appwriteCollectionDefinitions) {
    console.log(`\nProcessing collection: ${collection.name}`)
    await ensureCollection(database.$id, collection)
  }

  console.log('\n✅ Provisioning complete.')
}

main().catch((error) => {
  console.error('\n❌ Provisioning failed:', error)
  process.exit(1)
})
