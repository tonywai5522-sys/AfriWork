import Button from '../components/common/Button.jsx'

export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center lg:py-24">
      <div className="max-w-2xl space-y-6">
        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
          Africa’s Digital Talent Infrastructure
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          Build trusted work identities and unlock opportunity.
        </h1>
        <p className="text-lg text-slate-600">
          AfriWork helps African youth showcase verified skills, discover meaningful work, collaborate on projects, and grow professional reputation in one platform.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button>Join as Talent</Button>
          <Button variant="secondary">Post a Job</Button>
        </div>
      </div>

      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold">Platform modules</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          <li className="rounded-lg border border-slate-100 p-3">Profiles and verification</li>
          <li className="rounded-lg border border-slate-100 p-3">Opportunity marketplace</li>
          <li className="rounded-lg border border-slate-100 p-3">Project collaboration workspaces</li>
          <li className="rounded-lg border border-slate-100 p-3">Notifications and reputation</li>
        </ul>
      </div>
    </section>
  )
}
