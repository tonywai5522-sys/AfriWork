import { Query } from 'node-appwrite'
import { getUsers, getDatabases } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { Profile } from '../models/Profile.js'
import * as recentSearchService from './recentSearchService.js'

const DB_ID = appConfig.appwrite.databaseId
const PROJECTS_COLL = process.env.APPWRITE_PROJECTS_COLLECTION_ID || 'projects'
const ORGANIZATIONS_COLL = process.env.APPWRITE_ORGANIZATIONS_COLLECTION_ID || 'organizations'
const TEAMS_COLL = process.env.APPWRITE_TEAMS_COLLECTION_ID || 'teams'
const SKILLS_COLL = process.env.APPWRITE_SKILLS_COLLECTION_ID || 'skills'
const PROFILES_COLL = process.env.APPWRITE_PROFILES_COLLECTION_ID || 'profiles'

const ALLOWED_TYPES = ['all', 'users', 'jobs', 'projects', 'organizations', 'teams', 'skills']

export async function globalSearch({ query, type = 'all', filters = {}, page = 1, limit = 10, sortBy = 'relevance', userId }) {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1)
  const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10))
  const searchTerm = (query || '').trim()

  if (!ALLOWED_TYPES.includes(type)) type = 'all'

  let results = []
  let facets = { types: {}, statuses: {} }

  if (type === 'all' || type === 'users') {
    const { users: userResults } = await searchUsers(searchTerm, filters, type === 'all' ? 5 : parsedLimit, parsedPage)
    results.push(...userResults)
    facets.types.users = userResults.length
  }

  if (type === 'all' || type === 'jobs') {
    const { jobs: jobResults } = await searchJobs(searchTerm, filters, type === 'all' ? 5 : parsedLimit, parsedPage)
    results.push(...jobResults)
    // Track status counts from job results
    jobResults.forEach(j => {
      if (j.metadata?.status) {
        facets.statuses[j.metadata.status] = (facets.statuses[j.metadata.status] || 0) + 1
      }
    })
    facets.types.jobs = jobResults.length
  }

  if (type === 'all' || type === 'projects') {
    const { projects: projectResults } = await searchProjects(searchTerm, filters, type === 'all' ? 5 : parsedLimit, parsedPage)
    results.push(...projectResults)
    projectResults.forEach(p => {
      if (p.metadata?.status) {
        facets.statuses[p.metadata.status] = (facets.statuses[p.metadata.status] || 0) + 1
      }
    })
    facets.types.projects = projectResults.length
  }

  if (type === 'all' || type === 'organizations') {
    const { orgs } = await searchOrganizations(searchTerm, filters, type === 'all' ? 5 : parsedLimit, parsedPage)
    results.push(...orgs)
    facets.types.organizations = orgs.length
  }

  if (type === 'all' || type === 'teams') {
    const { teams } = await searchTeams(searchTerm, filters, type === 'all' ? 5 : parsedLimit, parsedPage)
    results.push(...teams)
    facets.types.teams = teams.length
  }

  if (type === 'all' || type === 'skills') {
    const { skills } = await searchSkills(searchTerm, filters, type === 'all' ? 5 : parsedLimit, parsedPage)
    results.push(...skills)
    facets.types.skills = skills.length
  }

  // Sort
  if (sortBy === 'newest') {
    results.sort((a, b) => new Date(b.metadata?.createdAt || 0) - new Date(a.metadata?.createdAt || 0))
  } else if (sortBy === 'oldest') {
    results.sort((a, b) => new Date(a.metadata?.createdAt || 0) - new Date(b.metadata?.createdAt || 0))
  } else if (sortBy === 'name') {
    results.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  }
  // 'relevance' = keep as-is (API returns most relevant first)

  const total = results.length
  const startIdx = (parsedPage - 1) * parsedLimit
  const paginated = results.slice(startIdx, startIdx + parsedLimit)

  // Save to recent searches
  if (searchTerm && userId) {
    try {
      await recentSearchService.saveRecentSearch(userId, searchTerm, type, total)
    } catch { /* best effort */ }
  }

  return { results: paginated, total, page: parsedPage, limit: parsedLimit, facets }
}

async function searchUsers(query, filters = {}, maxResults, page) {
  if (!query && Object.keys(filters).length === 0) return { users: [] }
  const users = getUsers()
  const queries = []

  if (query) queries.push(Query.search('name', query))
  queries.push(Query.limit(maxResults))

  let userResult
  try {
    userResult = await users.list(queries)
  } catch {
    return { users: [] }
  }

  const usersRes = await Promise.all((userResult.users || []).map(async (u) => {
    const profileData = await getProfileByUserId(u.$id)
    return {
      id: u.$id,
      type: 'users',
      title: u.name || u.email,
      description: profileData?.headline || profileData?.bio || '',
      image: profileData?.avatar || '',
      subtitle: u.email,
      url: `/profile`,
      metadata: {
        name: u.name || '',
        email: u.email,
        role: u.prefs?.role || 'talent',
        skills: profileData?.skills?.map(s => s.name) || [],
        location: profileData?.location || '',
        rating: profileData?.rating || 0,
        createdAt: u.registration,
      },
    }
  }))

  return { users: usersRes }
}

async function searchJobs(query, filters = {}, maxResults, page) {
  if (!query && Object.keys(filters).length === 0) return { jobs: [] }
  try {
    const { searchJobs: searchJobFn } = await import('./jobService.js')
    const result = await searchJobFn({
      query,
      status: filters.status,
      location: filters.location,
      experienceLevel: filters.experienceLevel,
      skills: filters.skills,
      budgetMin: filters.budgetMin,
      budgetMax: filters.budgetMax,
      page,
      limit: maxResults,
    })
    const jobs = (result?.data?.jobs || []).map(j => ({
      id: j.id,
      type: 'jobs',
      title: j.title,
      description: j.description || '',
      image: '',
      subtitle: j.organizationName || j.location || '',
      url: `/jobs/${j.id}`,
      metadata: {
        status: j.status,
        budget: j.budget,
        currency: j.currency,
        location: j.location,
        jobType: j.jobType,
        skills: j.skills || [],
        experienceLevel: j.experienceLevel,
        createdAt: j.createdAt,
      },
    }))
    return { jobs }
  } catch {
    return { jobs: [] }
  }
}

async function searchProjects(query, filters = {}, maxResults, page) {
  if (!query && Object.keys(filters).length === 0) return { projects: [] }
  const databases = getDatabases()
  try {
    const queries = []
    if (query) queries.push(Query.search('title', query))
    if (filters.status) queries.push(Query.equal('status', [filters.status]))
    queries.push(Query.limit(maxResults))
    const docs = await databases.listDocuments(DB_ID, PROJECTS_COLL, queries)
    const projects = docs.documents.map(d => ({
      id: d.$id,
      type: 'projects',
      title: d.title || '',
      description: d.description || '',
      image: '',
      subtitle: `Project`,
      url: `/projects/${d.$id}`,
      metadata: {
        status: d.status || 'planning',
        visibility: d.visibility || 'private',
        progress: d.progress || 0,
        createdAt: d.$createdAt || d.createdAt,
      },
    }))
    return { projects }
  } catch {
    return { projects: [] }
  }
}

async function searchOrganizations(query, filters = {}, maxResults, page) {
  if (!query && Object.keys(filters).length === 0) return { orgs: [] }
  const databases = getDatabases()
  try {
    const queries = []
    if (query) queries.push(Query.search('name', query))
    queries.push(Query.limit(maxResults))
    const docs = await databases.listDocuments(DB_ID, ORGANIZATIONS_COLL, queries)
    const orgs = docs.documents.map(d => ({
      id: d.$id,
      type: 'organizations',
      title: d.name || '',
      description: d.description || d.industry || '',
      image: d.logo || '',
      subtitle: d.industry || d.size || '',
      url: '/company',
      metadata: {
        industry: d.industry || '',
        size: d.size || '',
        location: d.location || '',
        website: d.website || '',
        createdAt: d.$createdAt || d.createdAt,
      },
    }))
    return { orgs }
  } catch {
    return { orgs: [] }
  }
}

async function searchTeams(query, filters = {}, maxResults, page) {
  if (!query && Object.keys(filters).length === 0) return { teams: [] }
  const databases = getDatabases()
  try {
    const queries = []
    if (query) queries.push(Query.search('name', query))
    queries.push(Query.limit(maxResults))
    const docs = await databases.listDocuments(DB_ID, TEAMS_COLL, queries)
    const teams = docs.documents.map(d => ({
      id: d.$id,
      type: 'teams',
      title: d.name || '',
      description: d.description || '',
      image: '',
      subtitle: `${(d.members?.length || 0)} members`,
      url: `/teams/${d.$id}`,
      metadata: {
        memberCount: d.members?.length || 0,
        status: d.status || 'active',
        createdAt: d.$createdAt || d.createdAt,
      },
    }))
    return { teams }
  } catch {
    return { teams: [] }
  }
}

async function searchSkills(query, filters = {}, maxResults, page) {
  if (!query && Object.keys(filters).length === 0) return { skills: [] }
  const databases = getDatabases()
  try {
    const queries = []
    if (query) queries.push(Query.search('name', query))
    queries.push(Query.limit(maxResults))
    const docs = await databases.listDocuments(DB_ID, SKILLS_COLL, queries)
    const skills = docs.documents.map(d => ({
      id: d.$id,
      type: 'skills',
      title: d.name || '',
      description: d.description || d.category || '',
      image: '',
      subtitle: d.category || 'Skill',
      url: `/network?skill=${d.name}`,
      metadata: {
        category: d.category || '',
        endorsements: d.endorsements || 0,
        createdAt: d.$createdAt || d.createdAt,
      },
    }))
    return { skills }
  } catch {
    return { skills: [] }
  }
}

async function getProfileByUserId(userId) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, PROFILES_COLL, [
      Query.equal('userId', [userId]),
      Query.limit(1),
    ])
    if (docs.documents.length > 0) {
      return new Profile(docs.documents[0])
    }
  } catch { /* no profile */ }
  return null
}
