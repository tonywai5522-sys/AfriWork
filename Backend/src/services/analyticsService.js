import { Query } from 'node-appwrite'
import { getDatabases, getUsers } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { logger } from '../utils/logger.js'

const DB_ID = appConfig.appwrite.databaseId
const COLLECTIONS = {
  JOBS: process.env.APPWRITE_JOBS_COLLECTION_ID || 'jobs',
  APPLICATIONS: process.env.APPWRITE_APPLICATIONS_COLLECTION_ID || 'applications',
  PROJECTS: process.env.APPWRITE_PROJECTS_COLLECTION_ID || 'projects',
  ORGANIZATIONS: process.env.APPWRITE_ORGANIZATIONS_COLLECTION_ID || 'organizations',
  PROFILES: process.env.APPWRITE_PROFILES_COLLECTION_ID || 'profiles',
  REVIEWS: process.env.APPWRITE_REVIEWS_COLLECTION_ID || 'reviews',
  COURSES: process.env.APPWRITE_COURSES_COLLECTION_ID || 'courses',
  AUDIT_LOGS: process.env.APPWRITE_AUDIT_LOGS_COLLECTION_ID || 'audit_logs',
  PORTFOLIO: process.env.APPWRITE_PORTFOLIO_COLLECTION_ID || 'portfolio_projects',
}

// ─── KPI Aggregates ───────────────────────────────────

export async function getPlatformKPI(period = '30d') {
  const dbs = getDatabases()
  const users = getUsers()
  const { from, to } = getPeriodRange(period)
  const now = new Date()

  async function countDocuments(coll, queries = []) {
    try {
      const res = await dbs.listDocuments(DB_ID, coll, [...queries, Query.limit(1)])
      return res.total
    } catch { return 0 }
  }

  async function countUsers() {
    try {
      const res = await users.list([Query.limit(1)])
      return res.total
    } catch { return 0 }
  }

  const [
    totalUsers, totalJobs, totalApplications, totalProjects,
    totalOrgs, totalPortfolios, totalCourses,
    activeJobs, activeProjects,
    pendingOrgs, verifiedOrgs,
    pendingReviews, flaggedReviews,
  ] = await Promise.all([
    countUsers(),
    countDocuments(COLLECTIONS.JOBS),
    countDocuments(COLLECTIONS.APPLICATIONS),
    countDocuments(COLLECTIONS.PROJECTS),
    countDocuments(COLLECTIONS.ORGANIZATIONS),
    countDocuments(COLLECTIONS.PORTFOLIO),
    countDocuments(COLLECTIONS.COURSES),
    countDocuments(COLLECTIONS.JOBS, [Query.equal('status', ['active'])]),
    countDocuments(COLLECTIONS.PROJECTS, [Query.equal('status', ['active'])]),
    countDocuments(COLLECTIONS.ORGANIZATIONS, [Query.equal('verificationStatus', ['pending'])]),
    countDocuments(COLLECTIONS.ORGANIZATIONS, [Query.equal('verificationStatus', ['verified'])]),
    countDocuments(COLLECTIONS.REVIEWS, [Query.equal('status', ['pending'])]),
    countDocuments(COLLECTIONS.REVIEWS, [Query.equal('status', ['flagged'])]),
  ])

  // Period-over-period growth
  const prevFrom = new Date(from.getTime() - (to.getTime() - from.getTime()))
  const [currentNewUsers, previousNewUsers] = await Promise.all([
    countUsersInPeriod(from, to),
    countUsersInPeriod(prevFrom, from),
  ])

  const userGrowth = previousNewUsers > 0
    ? Math.round(((currentNewUsers - previousNewUsers) / previousNewUsers) * 100)
    : 0

  // Get role distribution
  let talentCount = 0, employerCount = 0, adminCount = 0
  try {
    const allUsers = await users.list([Query.limit(totalUsers)])
    for (const u of allUsers.users) {
      const role = u.prefs?.role || 'talent'
      if (role === 'talent') talentCount++
      else if (role === 'employer') employerCount++
      else if (role === 'admin') adminCount++
    }
  } catch {
    talentCount = Math.round(totalUsers * 0.65)
    employerCount = Math.round(totalUsers * 0.25)
    adminCount = Math.round(totalUsers * 0.02)
  }

  // Job type & experience distribution
  let jobTypeDist = {}, expLevelDist = {}
  try {
    const allJobs = await dbs.listDocuments(DB_ID, COLLECTIONS.JOBS, [Query.limit(100)])
    for (const j of allJobs.documents) {
      jobTypeDist[j.jobType || 'full_time'] = (jobTypeDist[j.jobType || 'full_time'] || 0) + 1
      expLevelDist[j.experienceLevel || 'mid'] = (expLevelDist[j.experienceLevel || 'mid'] || 0) + 1
    }
  } catch { /* */ }

  return {
    overview: {
      totalUsers, talentCount, employerCount, adminCount,
      totalJobs, activeJobs, totalApplications,
      totalProjects, activeProjects,
      totalOrgs, pendingOrgs, verifiedOrgs,
      totalPortfolios, totalCourses,
      pendingReviews, flaggedReviews,
    },
    growth: {
      period: { from: from.toISOString(), to: to.toISOString() },
      newUsers: currentNewUsers,
      previousNewUsers,
      userGrowthPercent: userGrowth,
    },
    distribution: {
      jobTypes: jobTypeDist,
      experienceLevels: expLevelDist,
    },
  }
}

// ─── User Growth Metrics ──────────────────────────────

export async function getUserGrowthMetrics(period = '90d') {
  const users = getUsers()
  const { from } = getPeriodRange(period)
  const now = new Date()

  // Generate daily signup data
  const dailyData = []
  const daysDiff = Math.ceil((now.getTime() - from.getTime()) / 86400000)

  try {
    const allUsers = await users.list([Query.limit(1)])
    const total = allUsers.total

    // Sample daily buckets by querying registration dates
    let cumulative = 0
    for (let i = 0; i < Math.min(daysDiff, 90); i++) {
      const dayStart = new Date(from.getTime() + i * 86400000)
      const dayEnd = new Date(dayStart.getTime() + 86400000)
      let count = 0
      try {
        const dayUsers = await users.list([
          Query.greaterThan('registration', dayStart.toISOString()),
          Query.lessThan('registration', dayEnd.toISOString()),
          Query.limit(1),
        ])
        count = dayUsers.total
      } catch { /* */ }
      cumulative += count
      dailyData.push({
        date: dayStart.toISOString().split('T')[0],
        newUsers: count,
        totalUsers: cumulative,
      })
    }
  } catch { /* */ }

  // Monthly aggregation
  const monthlyData = aggregateByMonth(dailyData)
  const weeklyData = aggregateByWeek(dailyData)

  return {
    daily: dailyData.slice(-30), // Last 30 days
    weekly: weeklyData.slice(-12), // Last 12 weeks
    monthly: monthlyData.slice(-6), // Last 6 months
    total: dailyData.length > 0 ? dailyData[dailyData.length - 1].totalUsers : 0,
  }
}

// ─── Job Analytics ────────────────────────────────────

export async function getJobAnalytics(period = '90d') {
  const dbs = getDatabases()
  const { from } = getPeriodRange(period)

  let totalJobs = 0, activeJobs = 0, closedJobs = 0, pausedJobs = 0
  let totalApplications = 0, featuredJobs = 0
  let byCategory = {}, byLocation = {}, byJobType = {}, byExpLevel = {}
  let avgSalaryMin = 0, avgSalaryMax = 0, jobCount = 0
  let dailyJobPosts = []

  try {
    const allJobs = await dbs.listDocuments(DB_ID, COLLECTIONS.JOBS, [Query.limit(1000)])
    totalJobs = allJobs.total

    for (const j of allJobs.documents) {
      if (j.status === 'active') activeJobs++
      if (j.status === 'closed') closedJobs++
      if (j.status === 'paused') pausedJobs++
      if (j.isFeatured) featuredJobs++

      byCategory[j.category || 'other'] = (byCategory[j.category || 'other'] || 0) + 1
      byLocation[j.location || 'remote'] = (byLocation[j.location || 'remote'] || 0) + 1
      byJobType[j.jobType || 'full_time'] = (byJobType[j.jobType || 'full_time'] || 0) + 1
      byExpLevel[j.experienceLevel || 'mid'] = (byExpLevel[j.experienceLevel || 'mid'] || 0) + 1

      if (j.salaryMin || j.salaryMax) {
        avgSalaryMin += j.salaryMin || 0
        avgSalaryMax += j.salaryMax || 0
        jobCount++
      }

      const createdDate = j.$createdAt?.split('T')[0]
      if (createdDate && new Date(createdDate) >= from) {
        const existing = dailyJobPosts.find(d => d.date === createdDate)
        if (existing) existing.count++
        else dailyJobPosts.push({ date: createdDate, count: 1 })
      }
    }

    if (jobCount > 0) {
      avgSalaryMin = Math.round(avgSalaryMin / jobCount)
      avgSalaryMax = Math.round(avgSalaryMax / jobCount)
    }

    // Application stats
    try {
      const apps = await dbs.listDocuments(DB_ID, COLLECTIONS.APPLICATIONS, [Query.limit(1)])
      totalApplications = apps.total
    } catch { /* */ }

  } catch (e) { logger.error('Job analytics query failed', { error: e.message }) }

  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([name, count]) => ({ name, count }))

  dailyJobPosts.sort((a, b) => a.date.localeCompare(b.date))

  return {
    totals: { totalJobs, activeJobs, closedJobs, pausedJobs, totalApplications, featuredJobs },
    averageSalary: { min: avgSalaryMin, max: avgSalaryMax, currency: 'USD' },
    distribution: {
      byCategory: topCategories,
      byJobType: Object.entries(byJobType).map(([name, count]) => ({ name, count })),
      byExperienceLevel: Object.entries(byExpLevel).map(([name, count]) => ({ name, count })),
      byLocation: Object.entries(byLocation).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count })),
    },
    trends: dailyJobPosts.slice(-30),
    fillRate: activeJobs > 0 ? Math.round((closedJobs / Math.max(totalJobs, 1)) * 100) : 0,
  }
}

// ─── Project Analytics ────────────────────────────────

export async function getProjectAnalytics(period = '90d') {
  const dbs = getDatabases()
  const { from } = getPeriodRange(period)

  let total = 0, draft = 0, active = 0, paused = 0, completed = 0, cancelled = 0
  let totalBudget = 0, budgetCount = 0
  let avgProgress = 0, progressCount = 0
  let byVisibility = { private: 0, team: 0, public: 0 }
  let dailyCreated = []

  try {
    const all = await dbs.listDocuments(DB_ID, COLLECTIONS.PROJECTS, [Query.limit(1000)])
    total = all.total

    for (const p of all.documents) {
      if (p.status === 'draft') draft++
      if (p.status === 'active') active++
      if (p.status === 'paused') paused++
      if (p.status === 'completed') completed++
      if (p.status === 'cancelled') cancelled++
      if (p.budget) { totalBudget += p.budget; budgetCount++ }
      if (p.progress) { avgProgress += p.progress; progressCount++ }
      if (p.visibility) byVisibility[p.visibility] = (byVisibility[p.visibility] || 0) + 1

      const date = p.$createdAt?.split('T')[0]
      if (date && new Date(date) >= from) {
        const existing = dailyCreated.find(d => d.date === date)
        if (existing) existing.count++
        else dailyCreated.push({ date, count: 1 })
      }
    }

    avgProgress = progressCount > 0 ? Math.round(avgProgress / progressCount) : 0
  } catch (e) { logger.error('Project analytics failed', { error: e.message }) }

  dailyCreated.sort((a, b) => a.date.localeCompare(b.date))

  return {
    totals: { total, draft, active, paused, completed, cancelled },
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    avgBudget: budgetCount > 0 ? Math.round(totalBudget / budgetCount) : 0,
    avgProgress,
    visibility: byVisibility,
    trends: dailyCreated.slice(-30),
  }
}

// ─── Employer Analytics ───────────────────────────────

export async function getEmployerAnalytics(period = '90d') {
  const dbs = getDatabases()
  const users = getUsers()
  const { from } = getPeriodRange(period)

  let totalEmployers = 0
  let withOrgs = 0, verified = 0, pending = 0
  let totalJobsPosted = 0, totalHires = 0
  let byIndustry = {}, bySize = {}
  let orgsWithJobs = new Set()

  try {
    // Count employers
    const allUsers = await users.list([Query.limit(1000)])
    totalEmployers = allUsers.users.filter(u => (u.prefs?.role || 'talent') === 'employer').length

    // Organizations
    const orgs = await dbs.listDocuments(DB_ID, COLLECTIONS.ORGANIZATIONS, [Query.limit(1000)])
    withOrgs = orgs.total

    for (const o of orgs.documents) {
      if (o.verificationStatus === 'verified') verified++
      if (o.verificationStatus === 'pending') pending++
      if (o.industry) byIndustry[o.industry] = (byIndustry[o.industry] || 0) + 1
      if (o.companySize) bySize[o.companySize] = (bySize[o.companySize] || 0) + 1
    }

    // Jobs posted by orgs
    const jobs = await dbs.listDocuments(DB_ID, COLLECTIONS.JOBS, [Query.equal('status', ['active', 'closed']), Query.limit(1000)])
    totalJobsPosted = jobs.total
    for (const j of jobs.documents) {
      if (j.companyId) orgsWithJobs.add(j.companyId)
    }
  } catch (e) { logger.error('Employer analytics failed', { error: e.message }) }

  const topIndustries = Object.entries(byIndustry)
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([name, count]) => ({ name, count }))

  return {
    totals: { totalEmployers, withOrgs, verifiedOrgs: verified, pendingOrgs: pending },
    activity: {
      totalJobsPosted,
      orgsWithActiveJobs: orgsWithJobs.size,
      avgJobsPerOrg: withOrgs > 0 ? Math.round((totalJobsPosted / withOrgs) * 10) / 10 : 0,
      fillRate: totalJobsPosted > 0 ? Math.round((totalHires / totalJobsPosted) * 100) : 0,
    },
    distribution: {
      byIndustry: topIndustries,
      bySize: Object.entries(bySize).map(([name, count]) => ({ name, count })),
    },
  }
}

// ─── Application Analytics ────────────────────────────

export async function getApplicationAnalytics(period = '90d') {
  const dbs = getDatabases()
  const { from } = getPeriodRange(period)

  let total = 0, pending = 0, reviewed = 0, accepted = 0, rejected = 0, withdrawn = 0
  let avgRate = 0, rateCount = 0
  let byJobId = {}, dailyApps = []

  try {
    const apps = await dbs.listDocuments(DB_ID, COLLECTIONS.APPLICATIONS, [Query.limit(1000)])
    total = apps.total

    for (const a of apps.documents) {
      if (a.status === 'pending') pending++
      if (a.status === 'reviewed') reviewed++
      if (a.status === 'accepted') accepted++
      if (a.status === 'rejected') rejected++
      if (a.status === 'withdrawn') withdrawn++
      if (a.proposedRate) { avgRate += a.proposedRate; rateCount++ }
      if (a.jobId) byJobId[a.jobId] = (byJobId[a.jobId] || 0) + 1

      const date = a.$createdAt?.split('T')[0]
      if (date && new Date(date) >= from) {
        const existing = dailyApps.find(d => d.date === date)
        if (existing) existing.count++
        else dailyApps.push({ date, count: 1 })
      }
    }

    avgRate = rateCount > 0 ? Math.round(avgRate / rateCount) : 0
  } catch (e) { logger.error('Application analytics failed', { error: e.message }) }

  dailyApps.sort((a, b) => a.date.localeCompare(b.date))

  const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0
  const conversionRate = reviewed > 0 ? Math.round((accepted / reviewed) * 100) : 0

  return {
    totals: { total, pending, reviewed, accepted, rejected, withdrawn },
    rates: { acceptanceRate, conversionRate, avgProposedRate: avgRate },
    trends: dailyApps.slice(-30),
  }
}

// ─── Review Analytics ─────────────────────────────────

export async function getReviewAnalytics(period = '90d') {
  const dbs = getDatabases()
  const { from } = getPeriodRange(period)

  let total = 0, pending = 0, approved = 0, flagged = 0, removed = 0
  let totalRating = 0, ratingCount = 0
  let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

  try {
    const reviews = await dbs.listDocuments(DB_ID, COLLECTIONS.REVIEWS, [Query.limit(1000)])
    total = reviews.total

    for (const r of reviews.documents) {
      if (r.status === 'pending') pending++
      if (r.status === 'approved') approved++
      if (r.status === 'flagged') flagged++
      if (r.status === 'removed') removed++
      if (r.rating) {
        totalRating += r.rating
        ratingCount++
        ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1
      }
    }
  } catch (e) { logger.error('Review analytics failed', { error: e.message }) }

  return {
    totals: { total, pending, approved, flagged, removed },
    averageRating: ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : 0,
    ratingDistribution,
    moderationRate: total > 0 ? Math.round(((flagged + removed) / total) * 100) : 0,
  }
}

// ─── Time-series Trends ───────────────────────────────

export async function getTimeSeriesTrends(period = '90d', interval = 'day') {
  const { from } = getPeriodRange(period)
  const dbs = getDatabases()

  const collections = [
    { name: 'users', coll: null, isUsers: true },
    { name: 'jobs', coll: COLLECTIONS.JOBS },
    { name: 'applications', coll: COLLECTIONS.APPLICATIONS },
    { name: 'projects', coll: COLLECTIONS.PROJECTS },
    { name: 'organizations', coll: COLLECTIONS.ORGANIZATIONS },
  ]

  const results = {}

  for (const { name, coll, isUsers } of collections) {
    const dataPoints = []
    const current = new Date(from)
    const now = new Date()

    while (current < now) {
      const next = interval === 'week'
        ? new Date(current.getTime() + 7 * 86400000)
        : new Date(current.getTime() + 86400000)

      let count = 0
      if (isUsers) {
        try {
          const users = getUsers()
          const res = await users.list([
            Query.greaterThan('registration', current.toISOString()),
            Query.lessThan('registration', next.toISOString()),
            Query.limit(1),
          ])
          count = res.total
        } catch { /* */ }
      } else {
        try {
          const res = await dbs.listDocuments(DB_ID, coll, [
            Query.greaterThan('$createdAt', current.toISOString()),
            Query.lessThan('$createdAt', next.toISOString()),
            Query.limit(1),
          ])
          count = res.total
        } catch { /* */ }
      }

      dataPoints.push({
        date: current.toISOString().split('T')[0],
        count,
      })
      current.setTime(next.getTime())
    }

    results[name] = dataPoints
  }

  return results
}

// ─── Dashboard Summary ────────────────────────────────

export async function getAnalyticsDashboard() {
  const [kpi, userGrowth, jobs, projects, employers, apps, reviews] = await Promise.all([
    getPlatformKPI('30d'),
    getUserGrowthMetrics('30d'),
    getJobAnalytics('30d'),
    getProjectAnalytics('30d'),
    getEmployerAnalytics('30d'),
    getApplicationAnalytics('30d'),
    getReviewAnalytics('30d'),
  ])

  return {
    kpi,
    userGrowth: { daily: userGrowth.daily.slice(-7) },
    jobs,
    projects,
    employers,
    applications: apps,
    reviews,
  }
}

// ─── Helpers ─────────────────────────────────────────

function getPeriodRange(period) {
  const now = new Date()
  let from

  switch (period) {
    case '7d': from = new Date(now.getTime() - 7 * 86400000); break
    case '30d': from = new Date(now.getTime() - 30 * 86400000); break
    case '90d': from = new Date(now.getTime() - 90 * 86400000); break
    case '1y': from = new Date(now.getTime() - 365 * 86400000); break
    default: from = new Date(now.getTime() - 30 * 86400000)
  }

  return { from, to: now }
}

async function countUsersInPeriod(from, to) {
  try {
    const users = getUsers()
    const res = await users.list([
      Query.greaterThan('registration', from.toISOString()),
      Query.lessThan('registration', to.toISOString()),
      Query.limit(1),
    ])
    return res.total
  } catch { return 0 }
}

function aggregateByMonth(dailyData) {
  const months = {}
  for (const d of dailyData) {
    const key = d.date.slice(0, 7)
    if (!months[key]) months[key] = { date: key, newUsers: 0, totalUsers: d.totalUsers }
    months[key].newUsers += d.newUsers
    months[key].totalUsers = d.totalUsers
  }
  return Object.values(months)
}

function aggregateByWeek(dailyData) {
  const weeks = {}
  for (const d of dailyData) {
    const date = new Date(d.date)
    const dayOfWeek = date.getDay()
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    const monday = new Date(date.setDate(diff))
    const key = monday.toISOString().split('T')[0]
    if (!weeks[key]) weeks[key] = { date: key, newUsers: 0, totalUsers: d.totalUsers }
    weeks[key].newUsers += d.newUsers
    weeks[key].totalUsers = d.totalUsers
  }
  return Object.values(weeks)
}
