import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardStats } from '../services/adminService.js'
import StatCard from '../components/StatCard.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const PIE_COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']

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

export default function OverviewPage() {
  const [stats, setStats] = useState(null)
  const [signups, setSignups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then(res => {
        setStats(res.data?.overview || res.data || res)
        setSignups(res.data?.recentSignups || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const chartData = stats ? [
    { name: 'Users', value: stats.totalUsers || 0 },
    { name: 'Talent', value: stats.totalTalent || 0 },
    { name: 'Employers', value: stats.totalEmployer || 0 },
    { name: 'Jobs', value: stats.totalJobs || 0 },
    { name: 'Orgs', value: stats.totalOrgs || 0 },
  ] : []

  const pieData = stats ? [
    { name: 'Talent', value: stats.totalTalent || 0 },
    { name: 'Employer', value: stats.totalEmployer || 0 },
    { name: 'Admin', value: stats.totalAdmin || 0 },
  ].filter(d => d.value > 0) : []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">Platform summary at a glance</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="rounded-2xl border-2 border-slate-200 bg-white p-5 animate-pulse">
              <div className="h-8 w-20 rounded bg-slate-200 mb-2" />
              <div className="h-3 w-32 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard label="Total Users" value={stats?.totalUsers?.toLocaleString()} change={8} color="purple" icon="👥" />
            <StatCard label="Talent" value={stats?.totalTalent?.toLocaleString()} change={5} color="blue" icon="💼" />
            <StatCard label="Employers" value={stats?.totalEmployer?.toLocaleString()} change={12} color="emerald" icon="🏢" />
            <StatCard label="Jobs" value={`${stats?.activeJobs || 0}/${stats?.totalJobs || 0}`} change={3} color="amber" icon="📋" />
            <StatCard label="Organizations" value={stats?.totalOrgs?.toLocaleString()} change={7} color="cyan" icon="🏛️" />
            <StatCard label="Pending Verifications" value={stats?.pendingOrgs || 0} color="amber" icon="⏳" />
            <StatCard label="Pending Reviews" value={stats?.pendingReviews || 0} color="red" icon="⭐" />
            <StatCard label="Flagged Reviews" value={stats?.flaggedReviews || 0} color="red" icon="🚩" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <Card title="Platform Distribution">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '2px solid #0f172a' }} />
                    <Bar dataKey="value" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="User Role Distribution">
              {pieData.length > 0 ? (
                <div className="h-64 flex items-center">
                  <div className="flex-1 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-10">No data available</p>
              )}
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Recent Signups" action={<Link to="/users" className="font-bold text-slate-500 hover:text-slate-900">View all</Link>}>
              <div className="space-y-2">
                {signups.length > 0 ? signups.slice(0, 6).map((u, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border-2 border-slate-200 px-4 py-2.5">
                    <div>
                      <p className="text-sm font-bold">{u.name}</p>
                      <p className="text-xs capitalize text-slate-500">{u.role} · {u.email}</p>
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${u.emailVerified ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-amber-300 bg-amber-50 text-amber-700'}`}>
                      {u.emailVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                )) : (
                  <div className="py-6 text-center">
                    <p className="text-sm text-slate-400">No recent signups</p>
                    <Link to="/users" className="text-xs text-purple-600 font-bold mt-1 inline-block">Browse all users →</Link>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Platform Health">
              <div className="space-y-4">
                {[
                  { label: 'Total Users', value: stats?.totalUsers?.toLocaleString() || '0' },
                  { label: 'Active Jobs', value: stats?.activeJobs || '0' },
                  { label: 'Organizations', value: stats?.totalOrgs || '0' },
                  { label: 'Pending Reviews', value: stats?.pendingReviews || '0' },
                  { label: 'Revenue', value: `$${(stats?.revenue || 0).toLocaleString()}` },
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                    <span className="text-sm text-slate-600">{m.label}</span>
                    <span className="text-sm font-bold text-slate-900">{m.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
