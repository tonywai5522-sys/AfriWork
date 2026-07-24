import { useState, useEffect } from 'react'
import {
  getPlatformAnalytics, getUserGrowthAnalytics, getJobAnalytics,
  getProjectAnalytics, getEmployerAnalytics, getApplicationAnalytics,
  getReviewAnalytics, getTimeSeriesTrends,
} from '../services/adminService.js'
import StatCard from '../components/StatCard.jsx'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Legend,
} from 'recharts'

const PIE_COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']
const PERIODS = [
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '90d', label: '90 Days' },
  { id: '1y', label: '1 Year' },
]

function Card({ title, children, action }) {
  return (
    <div className="rounded-2xl border-2 border-slate-900 bg-white p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold">{title}</h3>
        {action && <div className="text-xs">{action}</div>}
      </div>
      {children}
    </div>
  )
}

function ChartLoading() {
  return <div className="h-64 rounded-xl bg-slate-100 animate-pulse" />
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d')
  const [kpi, setKpi] = useState(null)
  const [userGrowth, setUserGrowth] = useState(null)
  const [jobs, setJobs] = useState(null)
  const [projects, setProjects] = useState(null)
  const [employers, setEmployers] = useState(null)
  const [applications, setApplications] = useState(null)
  const [reviews, setReviews] = useState(null)
  const [trends, setTrends] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [kpiRes, userRes, jobsRes, projRes, empRes, appRes, revRes, trendRes] = await Promise.all([
          getPlatformAnalytics({ period }),
          getUserGrowthAnalytics({ period }),
          getJobAnalytics({ period }),
          getProjectAnalytics({ period }),
          getEmployerAnalytics({ period }),
          getApplicationAnalytics({ period }),
          getReviewAnalytics({ period }),
          getTimeSeriesTrends({ period, interval: 'day' }),
        ])
        setKpi(kpiRes.data)
        setUserGrowth(userRes.data)
        setJobs(jobsRes.data)
        setProjects(projRes.data)
        setEmployers(empRes.data)
        setApplications(appRes.data)
        setReviews(revRes.data)
        setTrends(trendRes.data)
      } catch (e) { /* */ }
      setLoading(false)
    }
    load()
  }, [period])

  const overview = kpi?.overview
  const growth = kpi?.growth
  const userDist = kpi?.distribution

  // Time series chart data
  const trendChartData = trends?.users?.slice(-14).map((d, i) => ({
    date: d.date?.slice(5),
    users: d.count,
    jobs: trends.jobs?.[i]?.count || 0,
    applications: trends.applications?.[i]?.count || 0,
    projects: trends.projects?.[i]?.count || 0,
  })) || []

  // Job distribution data
  const jobTypeData = jobs?.distribution?.byJobType || []
  const jobExpData = jobs?.distribution?.byExperienceLevel || []
  const jobCategoryData = jobs?.distribution?.byCategory || []
  const jobLocationData = jobs?.distribution?.byLocation || []

  // Rating distribution
  const ratingData = reviews?.ratingDistribution
    ? Object.entries(reviews.ratingDistribution).map(([rating, count]) => ({ rating: `${rating}★`, count }))
    : []

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Platform Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">Comprehensive KPIs, metrics, and trends</p>
        </div>
        <div className="flex gap-2">
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`rounded-xl border-2 px-4 py-2 text-xs font-bold transition-colors ${period === p.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-28 rounded-2xl border-2 border-slate-200 bg-white animate-pulse" />)}
          </div>
          <ChartLoading />
          <ChartLoading />
        </div>
      ) : (
        <>
          {/* ── KPI Overview ── */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard label="Total Users" value={overview?.totalUsers?.toLocaleString()} change={growth?.userGrowthPercent} color="purple" icon="👥" subtitle="vs prev period" />
            <StatCard label="Talent Pool" value={overview?.talentCount?.toLocaleString()} color="blue" icon="💼" />
            <StatCard label="Employers" value={overview?.employerCount?.toLocaleString()} color="emerald" icon="🏢" />
            <StatCard label="Active Jobs" value={overview?.activeJobs} color="amber" icon="📋" />
            <StatCard label="Total Projects" value={overview?.totalProjects} color="cyan" icon="📁" />
            <StatCard label="Applications" value={overview?.totalApplications} color="pink" icon="📝" />
            <StatCard label="Pending Verifications" value={overview?.pendingOrgs} color="amber" icon="⏳" />
            <StatCard label="Flagged Reviews" value={overview?.flaggedReviews} color="red" icon="🚩" />
          </div>

          {/* ── Growth Metrics Section ── */}
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <Card title="User Growth Trend" action={<span className="text-[10px] text-slate-400">{growth?.period?.from?.slice(0, 10)} — {growth?.period?.to?.slice(0, 10)}</span>}>
              {userGrowth?.weekly?.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowth.weekly.map(w => ({ ...w, week: w.date?.slice(5) }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '2px solid #0f172a', fontSize: 12 }} />
                      <Area type="monotone" dataKey="newUsers" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} name="New Users" />
                      <Area type="monotone" dataKey="totalUsers" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} name="Total Users" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : <ChartLoading />}
            </Card>

            <Card title="User Role Distribution">
              {kpi?.overview ? (
                <div className="h-64 flex items-center">
                  <div className="flex-1 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={[
                          { name: 'Talent', value: overview.talentCount },
                          { name: 'Employer', value: overview.employerCount },
                          { name: 'Admin', value: overview.adminCount },
                        ].filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {PIE_COLORS.slice(0, 3).map((c, i) => <Cell key={i} fill={c} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : <p className="text-sm text-slate-400 text-center py-10">No data</p>}
            </Card>
          </div>

          {/* ── Time Series Trends ── */}
          <Card title="Daily Activity Trends" className="mb-8">
            {trendChartData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '2px solid #0f172a', fontSize: 12 }} />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#7c3aed" strokeWidth={2} dot={false} name="New Users" />
                    <Line type="monotone" dataKey="jobs" stroke="#3b82f6" strokeWidth={2} dot={false} name="Jobs" />
                    <Line type="monotone" dataKey="applications" stroke="#10b981" strokeWidth={2} dot={false} name="Applications" />
                    <Line type="monotone" dataKey="projects" stroke="#f59e0b" strokeWidth={2} dot={false} name="Projects" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : <ChartLoading />}
          </Card>

          {/* ── Job Analytics ── */}
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <Card title="Job Distribution by Type">
              {jobTypeData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={jobTypeData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '2px solid #0f172a' }} />
                      <Bar dataKey="count" fill="#7c3aed" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="text-sm text-slate-400 text-center py-10">No job data</p>}
            </Card>

            <Card title="Jobs by Experience Level">
              {jobExpData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={jobExpData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {jobExpData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="text-sm text-slate-400 text-center py-10">No data</p>}
            </Card>

            <Card title="Top Job Categories">
              {jobCategoryData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={jobCategoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '2px solid #0f172a' }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="text-sm text-slate-400 text-center py-10">No data</p>}
            </Card>

            <Card title="Job Stats Summary">
              <div className="space-y-4">
                {[
                  { label: 'Total Jobs', value: jobs?.totals?.totalJobs },
                  { label: 'Active Jobs', value: jobs?.totals?.activeJobs },
                  { label: 'Closed Jobs', value: jobs?.totals?.closedJobs },
                  { label: 'Featured Jobs', value: jobs?.totals?.featuredJobs },
                  { label: 'Total Applications', value: jobs?.totals?.totalApplications },
                  { label: 'Avg Salary (Min)', value: `$${jobs?.averageSalary?.min?.toLocaleString()}` },
                  { label: 'Avg Salary (Max)', value: `$${jobs?.averageSalary?.max?.toLocaleString()}` },
                  { label: 'Fill Rate', value: `${jobs?.fillRate || 0}%` },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                    <span className="text-sm text-slate-600">{item.label}</span>
                    <span className="text-sm font-bold">{item.value?.toLocaleString() || '0'}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ── Project Analytics ── */}
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <Card title="Project Status Distribution">
              {projects?.totals ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[
                        { name: 'Draft', value: projects.totals.draft },
                        { name: 'Active', value: projects.totals.active },
                        { name: 'Paused', value: projects.totals.paused },
                        { name: 'Completed', value: projects.totals.completed },
                        { name: 'Cancelled', value: projects.totals.cancelled },
                      ].filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {PIE_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="text-sm text-slate-400 text-center py-10">No data</p>}
            </Card>

            <Card title="Project Metrics">
              <div className="space-y-4">
                {[
                  { label: 'Total Projects', value: projects?.totals?.total },
                  { label: 'Active Projects', value: projects?.totals?.active },
                  { label: 'Completed', value: projects?.totals?.completed },
                  { label: 'Completion Rate', value: `${projects?.completionRate || 0}%` },
                  { label: 'Avg Progress', value: `${projects?.avgProgress || 0}%` },
                  { label: 'Avg Budget', value: projects?.avgBudget ? `$${projects.avgBudget.toLocaleString()}` : '—' },
                  { label: 'Private', value: projects?.visibility?.private || 0 },
                  { label: 'Public', value: projects?.visibility?.public || 0 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                    <span className="text-sm text-slate-600">{item.label}</span>
                    <span className="text-sm font-bold">{item.value?.toLocaleString() || '0'}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ── Employer Analytics ── */}
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <Card title="Employer & Organization Metrics">
              <div className="space-y-4">
                {[
                  { label: 'Total Employers', value: employers?.totals?.totalEmployers },
                  { label: 'Organizations', value: employers?.totals?.withOrgs },
                  { label: 'Verified Orgs', value: employers?.totals?.verifiedOrgs },
                  { label: 'Pending Verifications', value: employers?.totals?.pendingOrgs },
                  { label: 'Total Jobs Posted', value: employers?.activity?.totalJobsPosted },
                  { label: 'Orgs with Active Jobs', value: employers?.activity?.orgsWithActiveJobs },
                  { label: 'Avg Jobs/Org', value: employers?.activity?.avgJobsPerOrg },
                  { label: 'Fill Rate', value: `${employers?.activity?.fillRate || 0}%` },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                    <span className="text-sm text-slate-600">{item.label}</span>
                    <span className="text-sm font-bold">{item.value?.toLocaleString() || '0'}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Top Industries">
              {employers?.distribution?.byIndustry?.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={employers.distribution.byIndustry.slice(0, 8)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={100} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '2px solid #0f172a' }} />
                      <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="text-sm text-slate-400 text-center py-10">No industry data</p>}
            </Card>
          </div>

          {/* ── Application & Review Analytics ── */}
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <Card title="Application Pipeline">
              <div className="space-y-4">
                {[
                  { label: 'Total Applications', value: applications?.totals?.total },
                  { label: 'Pending', value: applications?.totals?.pending },
                  { label: 'Reviewed', value: applications?.totals?.reviewed },
                  { label: 'Accepted', value: applications?.totals?.accepted },
                  { label: 'Rejected', value: applications?.totals?.rejected },
                  { label: 'Withdrawn', value: applications?.totals?.withdrawn },
                  { label: 'Acceptance Rate', value: `${applications?.rates?.acceptanceRate || 0}%` },
                  { label: 'Review Conversion', value: `${applications?.rates?.conversionRate || 0}%` },
                  { label: 'Avg Proposed Rate', value: applications?.rates?.avgProposedRate ? `$${applications.rates.avgProposedRate}` : '—' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                    <span className="text-sm text-slate-600">{item.label}</span>
                    <span className="text-sm font-bold">{item.value || '0'}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Review Analytics">
              <div className="space-y-4">
                {[
                  { label: 'Total Reviews', value: reviews?.totals?.total },
                  { label: 'Approved', value: reviews?.totals?.approved },
                  { label: 'Pending', value: reviews?.totals?.pending },
                  { label: 'Flagged', value: reviews?.totals?.flagged },
                  { label: 'Removed', value: reviews?.totals?.removed },
                  { label: 'Avg Rating', value: reviews?.averageRating ? `${reviews.averageRating} / 5` : '—' },
                  { label: 'Moderation Rate', value: `${reviews?.moderationRate || 0}%` },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                    <span className="text-sm text-slate-600">{item.label}</span>
                    <span className="text-sm font-bold">{item.value || '0'}</span>
                  </div>
                ))}

                {ratingData.length > 0 && (
                  <div className="mt-4 h-48">
                    <p className="text-xs font-bold text-slate-500 mb-2">Rating Distribution</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ratingData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="rating" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: '2px solid #0f172a' }} />
                        <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* ── Distribution Summary ── */}
          <Card title="Job Distribution Summary">
            {userDist?.jobTypes && Object.keys(userDist.jobTypes).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(userDist.jobTypes).map(([type, count]) => (
                  <div key={type} className="rounded-xl border-2 border-slate-200 p-3 text-center">
                    <p className="text-lg font-black">{count}</p>
                    <p className="text-[10px] font-medium text-slate-500 capitalize">{type.replace(/_/g, ' ')}</p>
                  </div>
                ))}
                <div className="rounded-xl border-2 border-slate-200 p-3 text-center col-span-full">
                  <p className="text-lg font-black">{growth?.newUsers || 0}</p>
                  <p className="text-[10px] font-medium text-slate-500">New Users (This Period)</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No distribution data available</p>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
