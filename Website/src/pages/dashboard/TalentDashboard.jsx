import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { ROUTES } from '../../constants/routes.js'
import DashboardLayout from '../../layouts/dashboard/DashboardLayout.jsx'
import StatCard, { StatCardSkeleton } from '../../components/dashboard/StatCard.jsx'
import DashboardCard from '../../components/dashboard/DashboardCard.jsx'

export default function TalentDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const recentApplications = [
    { id: 1, role: 'Senior React Developer', company: 'TechCorp', status: 'pending', date: '2d ago' },
    { id: 2, role: 'Full Stack Engineer', company: 'StartupXYZ', status: 'reviewed', date: '5d ago' },
    { id: 3, role: 'UI/UX Designer', company: 'DesignHub', status: 'accepted', date: '1w ago' },
  ]

  const statusColors = { pending: 'bg-amber-100 text-amber-700 border-amber-300', reviewed: 'bg-blue-100 text-blue-700 border-blue-300', accepted: 'bg-emerald-100 text-emerald-700 border-emerald-300' }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="mb-6 h-8 w-48 animate-pulse rounded bg-slate-200" />
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map(i => <StatCardSkeleton key={i} />)}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Talent Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Welcome back, {user?.name?.split(' ')[0] || 'there'}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <StatCard label="Profile Views" value="142" change={12} color="slate" />
          <StatCard label="Applications" value="8" change={-3} color="blue" />
          <StatCard label="Hire Rate" value="64%" change={5} color="emerald" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <DashboardCard title="Recent Applications" action={<Link to={ROUTES.applications} className="font-bold text-slate-500 hover:text-slate-900">View all</Link>}>
            <div className="space-y-3">
              {recentApplications.map(a => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{a.role}</p>
                    <p className="text-xs text-slate-500">{a.company} · {a.date}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-0.5 text-[10px] font-bold ${statusColors[a.status]}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title="Suggested Jobs" action={<Link to={ROUTES.jobs} className="font-bold text-slate-500 hover:text-slate-900">Browse</Link>}>
            <div className="space-y-3">
              {['Lead Frontend Developer · Remote', 'Backend Engineer (Node.js) · Nairobi', 'DevOps Specialist · Contract'].map((job, i) => (
                <div key={i} className="rounded-xl border-2 border-slate-200 px-4 py-3 transition-colors hover:border-slate-900">
                  <p className="text-sm font-bold text-slate-900">{job.split(' · ')[0]}</p>
                  <p className="text-xs text-slate-500">{job.split(' · ')[1]}</p>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>

        <div className="mt-6">
          <DashboardCard title="Recent Activity">
            <div className="space-y-3 text-sm text-slate-600">
              {['Updated your profile', 'Applied to Senior React Developer', 'Added JavaScript to your skills', 'Completed profile verification'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  )
}
