import 'dotenv/config'
import { Client, Databases, Permission, Role } from 'node-appwrite'
import { appwriteDatabaseConfig, appwriteCollectionDefinitions } from '../config/appwriteCollections.js'

const endpoint = process.env.APPWRITE_ENDPOINT
const projectId = process.env.APPWRITE_PROJECT_ID
const apiKey = process.env.APPWRITE_API_KEY

if (!endpoint || !projectId || !apiKey) {
  console.error('Missing Appwrite environment variables. Set APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, and APPWRITE_API_KEY.')
  process.exit(1)
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey)

const databases = new Databases(client)

function mapAttribute(attribute) {
  const base = {
    key: attribute.key,
    type: attribute.type,
    required: attribute.required ?? false,
    default: attribute.default ?? null,
    array: attribute.array ?? false,
  }

  if (attribute.type === 'string') {
    return {
      ...base,
      size: attribute.size ?? 255,
      format: attribute.format ?? null,
    }
  }

  if (attribute.type === 'integer') {
    return {
      ...base,
      min: attribute.min ?? null,
      max: attribute.max ?? null,
    }
  }

  if (attribute.type === 'double') {
    return {
      ...base,
      min: attribute.min ?? null,
      max: attribute.max ?? null,
    }
  }

  if (attribute.type === 'enum') {
    return {
      ...base,
      elements: attribute.elements ?? [],
    }
  }

  if (attribute.type === 'datetime') {
    return base
  }

  if (attribute.type === 'boolean') {
    return base
  }

  return base
}

async function ensureDatabase() {
  try {
    return await databases.create(appwriteDatabaseConfig.id, appwriteDatabaseConfig.name, appwriteDatabaseConfig.description)
  } catch (error) {
    if (error?.code === 409 || error?.message?.includes('already exists')) {
      return await databases.get(appwriteDatabaseConfig.id)
    }

    throw error
  }
}

async function ensureCollection(databaseId, collection) {
  const attributes = collection.attributes.map(mapAttribute)

  try {
    return await databases.createCollection(databaseId, collection.key, collection.name, {
      documentSecurity: true,
      permissions: [
        Permission.read(Role.any()),
        Permission.write(Role.users()),
      ],
      attributes,
      indexes: collection.indexes || [],
    })
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
    console.log(`Creating or updating collection: ${collection.name}`)
    await ensureCollection(database.$id, collection)
  }

  console.log('Provisioning complete.')
}

main().catch((error) => {
  console.error('Provisioning failed:', error)
  process.exit(1)
})
