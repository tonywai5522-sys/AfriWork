import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { ROUTES } from '../../constants/routes.js'
import DashboardLayout from '../../layouts/dashboard/DashboardLayout.jsx'
import StatCard, { StatCardSkeleton } from '../../components/dashboard/StatCard.jsx'
import DashboardCard from '../../components/dashboard/DashboardCard.jsx'

export default function EmployerDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="mb-6 h-8 w-48 animate-pulse rounded bg-slate-200" />
          <div className="grid gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Employer Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Good to see you, {user?.name?.split(' ')[0] || 'there'}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <StatCard label="Active Jobs" value="12" change={2} color="slate" />
          <StatCard label="Applications" value="48" change={15} color="blue" />
          <StatCard label="Interviews" value="6" change={0} color="amber" />
          <StatCard label="Hires" value="3" change={1} color="emerald" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <DashboardCard title="Recent Applicants" action={<Link to={ROUTES.applications} className="font-bold text-slate-500 hover:text-slate-900">View all</Link>}>
            <div className="space-y-3">
              {[
                { name: 'Jane Doe', role: 'Senior React Developer', match: '95%' },
                { name: 'John Smith', role: 'Full Stack Engineer', match: '88%' },
                { name: 'Alice Wang', role: 'DevOps Specialist', match: '82%' },
              ].map((a, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{a.name}</p>
                    <p className="text-xs text-slate-500">{a.role}</p>
                  </div>
                  <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-0.5 text-[10px] font-bold text-emerald-700">
                    {a.match} match
                  </span>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title="Job Postings Overview" action={<Link to={ROUTES.jobs} className="font-bold text-slate-500 hover:text-slate-900">Manage</Link>}>
            <div className="space-y-3 text-sm">
              {[
                { title: 'Senior React Developer', applicants: 15, daysLeft: 12 },
                { title: 'Backend Engineer (Node.js)', applicants: 8, daysLeft: 5 },
                { title: 'UI/UX Designer', applicants: 22, daysLeft: 3 },
              ].map((job, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border-2 border-slate-200 px-4 py-3">
                  <div>
                    <p className="font-bold text-slate-900">{job.title}</p>
                    <p className="text-xs text-slate-500">{job.applicants} applicants</p>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{job.daysLeft}d left</span>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>

        <div className="mt-6">
          <DashboardCard title="Quick Actions">
            <div className="flex flex-wrap gap-3">
              {['Post New Job', 'Browse Talent', 'View Reports', 'Team Settings'].map((action, i) => (
                <button key={i} className="rounded-xl border-2 border-slate-900 bg-white px-5 py-2 text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                  {action}
                </button>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  )
}
