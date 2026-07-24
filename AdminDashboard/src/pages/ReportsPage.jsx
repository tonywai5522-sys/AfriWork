import { useState, useEffect } from 'react'
import { getReports, getDashboardStats } from '../services/adminService.js'
import StatCard from '../components/StatCard.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'

export default function ReportsPage() {
  const [reports, setReports] = useState(null)
  const [stats, setStats] = useState(null)
  const [period, setPeriod] = useState('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const to = new Date().toISOString()
        let from
        switch (period) {
          case '7d': from = new Date(Date.now() - 7 * 86400000).toISOString(); break
          case '30d': from = new Date(Date.now() - 30 * 86400000).toISOString(); break
          case '90d': from = new Date(Date.now() - 90 * 86400000).toISOString(); break
          case '1y': from = new Date(Date.now() - 365 * 86400000).toISOString(); break
          default: from = new Date(Date.now() - 30 * 86400000).toISOString()
        }
        const [reportsRes, statsRes] = await Promise.all([
          getReports(from, to),
          getDashboardStats(),
        ])
        setReports(reportsRes.data)
        setStats(statsRes.data?.overview || statsRes.data)
      } catch (e) { /* */ }
      setLoading(false)
    }
    load()
  }, [period])

  const chartData = [
    { name: 'New Users', value: reports?.metrics?.newUsers || 0 },
    { name: 'New Jobs', value: reports?.metrics?.newJobs || 0 },
    { name: 'Applications', value: reports?.metrics?.newApplications || 0 },
    { name: 'Organizations', value: reports?.metrics?.newOrgs || 0 },
  ]

  const growthData = [
    { month: 'Jan', users: 120, jobs: 45, apps: 80 },
    { month: 'Feb', users: 145, jobs: 52, apps: 95 },
    { month: 'Mar', users: 180, jobs: 60, apps: 110 },
    { month: 'Apr', users: 165, jobs: 48, apps: 90 },
    { month: 'May', users: 200, jobs: 72, apps: 130 },
    { month: 'Jun', users: 220, jobs: 85, apps: 150 },
  ]

  if (loading) {
    return (
      <div>
        <div className="mb-6 h-8 w-48 rounded bg-slate-200 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl border-2 border-slate-200 bg-white animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">
            {reports?.period ? `${new Date(reports.period.from).toLocaleDateString()} — ${new Date(reports.period.to).toLocaleDateString()}` : 'Platform metrics'}
          </p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-xl border-2 px-4 py-2 text-xs font-bold transition-colors ${period === p ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="New Users (Period)" value={reports?.metrics?.newUsers || 0} change={12} color="purple" />
        <StatCard label="New Jobs" value={reports?.metrics?.newJobs || 0} change={8} color="blue" />
        <StatCard label="New Applications" value={reports?.metrics?.newApplications || 0} change={15} color="emerald" />
        <StatCard label="New Organizations" value={reports?.metrics?.newOrgs || 0} change={5} color="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <div className="rounded-2xl border-2 border-slate-900 bg-white p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <h3 className="text-sm font-bold mb-4">Period Metrics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '2px solid #0f172a', fontSize: 12 }} />
                <Bar dataKey="value" fill="#7c3aed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-slate-900 bg-white p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <h3 className="text-sm font-bold mb-4">Growth Trends (6 months)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '2px solid #0f172a', fontSize: 12 }} />
                <Area type="monotone" dataKey="users" stackId="1" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} />
                <Area type="monotone" dataKey="jobs" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                <Area type="monotone" dataKey="apps" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-slate-900 bg-white p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <h3 className="text-sm font-bold mb-4">Platform Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats?.totalUsers?.toLocaleString() || '0' },
            { label: 'Total Talent', value: stats?.totalTalent?.toLocaleString() || '0' },
            { label: 'Total Employers', value: stats?.totalEmployer?.toLocaleString() || '0' },
            { label: 'Total Jobs', value: stats?.totalJobs?.toLocaleString() || '0' },
            { label: 'Active Jobs', value: stats?.activeJobs || '0' },
            { label: 'Organizations', value: stats?.totalOrgs || '0' },
            { label: 'Pending Reviews', value: stats?.pendingReviews || '0' },
            { label: 'Revenue', value: `$${(stats?.revenue || 0).toLocaleString()}` },
          ].map((item, i) => (
            <div key={i} className="rounded-xl border-2 border-slate-200 p-3 text-center">
              <p className="text-lg font-black">{item.value}</p>
              <p className="text-[10px] font-medium text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
