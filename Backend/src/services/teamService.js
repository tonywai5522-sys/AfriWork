import { ID, Query } from 'node-appwrite'
import { getDatabases } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { Team, TeamMember } from '../models/Team.js'
import { logger } from '../utils/logger.js'

const DB_ID = appConfig.appwrite.databaseId
const TEAMS_COLLECTION = process.env.APPWRITE_TEAMS_COLLECTION_ID || 'teams'

export async function getTeamById(teamId) {
  const databases = getDatabases()
  try {
    const doc = await databases.getDocument(DB_ID, TEAMS_COLLECTION, teamId)
    return new Team(doc)
  } catch { return null }
}

export async function createTeam(userId, data) {
  const databases = getDatabases()
  const teamData = {
    name: data.name,
    description: data.description || '',
    projectId: data.projectId || '',
    ownerId: userId,
    organizationId: data.organizationId || '',
    status: 'active',
    members: [
      new TeamMember({
        userId,
        role: 'admin',
        name: data.ownerName || '',
        email: data.ownerEmail || '',
        status: 'active',
        joinedAt: new Date().toISOString(),
      }).toJSON(),
    ],
    metadata: data.metadata || {},
  }

  const doc = await databases.createDocument(DB_ID, TEAMS_COLLECTION, ID.unique(), teamData)
  logger.info(`Team created`, { teamId: doc.$id, name: data.name, ownerId: userId })
  return new Team(doc)
}

export async function updateTeam(teamId, data) {
  const databases = getDatabases()
  const updates = {}
  const allowedFields = ['name', 'description', 'projectId', 'organizationId', 'status', 'permissions', 'metadata']
  for (const field of allowedFields) {
    if (data[field] !== undefined) updates[field] = data[field]
  }
  const doc = await databases.updateDocument(DB_ID, TEAMS_COLLECTION, teamId, updates)
  logger.info(`Team updated`, { teamId })
  return new Team(doc)
}

export async function deleteTeam(teamId) {
  const databases = getDatabases()
  await databases.deleteDocument(DB_ID, TEAMS_COLLECTION, teamId)
  logger.info(`Team deleted`, { teamId })
  return { deleted: true }
}

export async function getUserTeams(userId) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, TEAMS_COLLECTION, [
      Query.orderDesc('$createdAt'),
      Query.limit(50),
    ])
    // Filter teams where user is owner or member
    const teams = docs.documents
      .map(d => new Team(d))
      .filter(t => t.isOwner(userId) || t.getMember(userId))
    return teams
  } catch {
    return []
  }
}

export async function listTeams(options = {}) {
  const { page = 1, limit = 20, organizationId } = options
  const databases = getDatabases()
  const queries = [Query.limit(limit), Query.offset((page - 1) * limit), Query.orderDesc('$createdAt')]
  if (organizationId) queries.push(Query.equal('organizationId', [organizationId]))

  const docs = await databases.listDocuments(DB_ID, TEAMS_COLLECTION, queries)
  return {
    teams: docs.documents.map(d => new Team(d)),
    total: docs.total,
    page, limit,
  }
}

export async function addTeamMember(teamId, memberData) {
  const databases = getDatabases()
  const team = await getTeamById(teamId)
  if (!team) throw new Error('Team not found')

  const members = [...team.members]
  const exists = members.find(m => m.userId === memberData.userId || m.email === memberData.email)
  if (exists) throw new Error('Member already in this team')

  const newMember = new TeamMember({
    ...memberData,
    teamId,
    invitedAt: new Date().toISOString(),
    status: 'pending',
  })

  members.push(newMember.toJSON())
  await databases.updateDocument(DB_ID, TEAMS_COLLECTION, teamId, { members })
  logger.info(`Team member invited`, { teamId, email: memberData.email, role: memberData.role })
  return newMember
}

export async function updateTeamMember(teamId, memberId, updates) {
  const databases = getDatabases()
  const team = await getTeamById(teamId)
  if (!team) throw new Error('Team not found')

  const members = team.members.map(m =>
    m.id === memberId ? { ...m, ...updates } : m
  )
  await databases.updateDocument(DB_ID, TEAMS_COLLECTION, teamId, { members })
  return { updated: true }
}

export async function removeTeamMember(teamId, memberId) {
  const databases = getDatabases()
  const team = await getTeamById(teamId)
  if (!team) throw new Error('Team not found')

  const members = team.members.filter(m => m.id !== memberId)
  await databases.updateDocument(DB_ID, TEAMS_COLLECTION, teamId, { members })
  logger.info(`Team member removed`, { teamId, memberId })
  return { removed: true }
}

export async function acceptInvitation(teamId, userId) {
  const databases = getDatabases()
  const team = await getTeamById(teamId)
  if (!team) throw new Error('Team not found')

  const members = team.members.map(m =>
    m.userId === userId || m.email === userId
      ? { ...m, status: 'active', userId, joinedAt: new Date().toISOString() }
      : m
  )

  await databases.updateDocument(DB_ID, TEAMS_COLLECTION, teamId, { members })
  logger.info(`Team invitation accepted`, { teamId, userId })
  return { accepted: true }
}
