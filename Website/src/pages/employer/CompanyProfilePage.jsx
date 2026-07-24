import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { ROUTES } from '../../constants/routes.js'
import DashboardLayout from '../../layouts/dashboard/DashboardLayout.jsx'
import DashboardCard from '../../components/dashboard/DashboardCard.jsx'
import MemberManager from '../../components/company/MemberManager.jsx'
import OrganizationSettings from '../company/OrganizationSettings.jsx'
import * as orgService from '../../services/organizationService.js'

const INDUSTRIES = ['Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Marketing', 'Consulting', 'Real Estate', 'Manufacturing', 'Media', 'Non-profit', 'Other']
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']

export default function CompanyProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [org, setOrg] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')

  const [form, setForm] = useState({ name: '', slug: '', description: '', website: '', industry: '', location: '', companySize: '', foundedYear: '' })

  const loadOrg = useCallback(async () => {
    setLoading(true)
    try {
      const response = await orgService.getMyOrganization()
      const data = response?.data?.organization
      setOrg(data)
      if (data) {
        setForm({ name: data.name || '', slug: data.slug || '', description: data.description || '', website: data.website || '', industry: data.industry || '', location: data.location || '', companySize: data.companySize || '', foundedYear: data.foundedYear || '' })
      }
    } catch { setError('Failed to load organization') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadOrg() }, [loadOrg])

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setSuccess(''); setSaving(true)
    try {
      if (org) {
        await orgService.updateOrganization(form)
        setSuccess('Company profile updated!')
      } else {
        await orgService.createOrganization(form)
        setSuccess('Company created!')
      }
      await loadOrg()
    } catch (err) { setError(err.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  async function handleLogoUpload(file) {
    try {
      await orgService.uploadOrgLogo(file)
      setSuccess('Logo updated!')
      await loadOrg()
    } catch (err) { setError(err.message || 'Failed to upload logo') }
  }

  async function handleUpdate(data) {
    try {
      await orgService.updateOrganization(data)
      if (data.socialLinks) setSuccess('Social links saved!')
      await loadOrg()
    } catch (err) { setError(err.message || 'Failed to update') }
  }

  async function handleInvite(data) {
    try {
      await orgService.addRecruiter(data)
      setSuccess('Invitation sent!')
      await loadOrg()
    } catch (err) { setError(err.message || 'Failed to invite') }
  }

  async function handleUpdateRecruiter(recruiterId, data) {
    try {
      await orgService.updateRecruiter(recruiterId, data)
      await loadOrg()
    } catch (err) { setError(err.message || 'Failed to update member') }
  }

  async function handleRemoveRecruiter(recruiterId) {
    try {
      await orgService.removeRecruiter(recruiterId)
      setSuccess('Member removed')
      await loadOrg()
    } catch (err) { setError(err.message || 'Failed to remove member') }
  }

  async function handleRequestVerification() {
    try {
      await orgService.requestVerification()
      setSuccess('Verification requested!')
      await loadOrg()
    } catch (err) { setError(err.message || 'Failed to request verification') }
  }

  if (loading) return <DashboardLayout><div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" /></div></DashboardLayout>

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'members', label: `Members (${org?.recruiters?.length || 0})` },
    { id: 'settings', label: 'Settings' },
    { id: 'verification', label: 'Verification' },
  ]

  const verifBadge = { verified: 'bg-emerald-100 text-emerald-700 border-emerald-300', pending: 'bg-amber-100 text-amber-700 border-amber-300', unverified: 'bg-slate-100 text-slate-500 border-slate-300' }
  const verifColor = verifBadge[org?.verificationStatus] || verifBadge.unverified

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Company Profile</h1>
            <p className="text-sm text-slate-600">{org ? 'Manage your organization' : 'Create your organization'}</p>
          </div>
          <button onClick={() => navigate(ROUTES.dashboardEmployer)} className="rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:border-slate-900 hover:text-slate-900">&larr; Dashboard</button>
        </div>

        {error && <div className="mb-6 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3"><p className="text-sm font-medium text-red-700">{error}</p></div>}
        {success && <div className="mb-6 rounded-xl border-2 border-emerald-500 bg-emerald-50 px-4 py-3"><p className="text-sm font-medium text-emerald-700">{success}</p></div>}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 text-center shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-slate-900 bg-slate-100 text-2xl font-black text-slate-400 overflow-hidden">
                {org?.logoUrl ? (
                  <img src={org.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  org?.name?.[0] || '?'
                )}
              </div>
              <p className="text-sm font-bold text-slate-900">{org?.name || 'No company yet'}</p>
              <p className="text-xs text-slate-500">{org?.industry || '—'}</p>
              {org?.verificationStatus && (
                <span className={`mt-2 inline-block rounded-full border px-3 py-0.5 text-[10px] font-bold ${verifColor}`}>{org.verificationStatus}</span>
              )}
            </div>

            {org && (
              <DashboardCard title="Quick Stats">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Members</span><span className="font-bold text-slate-900">{org.recruiters?.length || 0}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Location</span><span className="font-bold text-slate-900">{org.location || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Size</span><span className="font-bold text-slate-900">{org.companySize || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Verification</span><span className="font-bold text-slate-900 capitalize">{org.verificationStatus}</span></div>
                </div>
              </DashboardCard>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex flex-wrap gap-2 border-b-2 border-slate-200 pb-4">
              {tabs.map(tab => (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'border-2 border-slate-900 bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                      : 'border-2 border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="mb-1 block text-xs font-bold text-slate-900">Company Name *</label>
                        <input className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:outline-none" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Acme Inc." />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="mb-1 block text-xs font-bold text-slate-900">Slug</label>
                        <input className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="acme-inc" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-900">Description</label>
                      <textarea className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:outline-none" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Tell talent what your company does..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-900">Website</label>
                        <input className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://acme.com" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-900">Industry</label>
                        <select className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })}>
                          <option value="">Select</option>
                          {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-900">Location</label>
                        <input className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Nairobi, Kenya" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-900">Company Size</label>
                        <select className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none" value={form.companySize} onChange={e => setForm({ ...form, companySize: e.target.value })}>
                          <option value="">Select</option>
                          {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-900">Founded Year</label>
                      <input type="number" min="1900" max={new Date().getFullYear()} className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none" value={form.foundedYear} onChange={e => setForm({ ...form, foundedYear: e.target.value })} placeholder="2020" />
                    </div>
                  </div>
                  <div className="mt-8 border-t-2 border-slate-200 pt-6">
                    <button type="submit" disabled={saving} className="rounded-xl border-2 border-slate-900 bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-800 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50">
                      {saving ? 'Saving...' : org ? 'Save Changes' : 'Create Company'}
                    </button>
                  </div>
                </form>
              )}

              {/* Members Tab */}
              {activeTab === 'members' && (
                <MemberManager
                  members={org?.recruiters || []}
                  onInvite={handleInvite}
                  onUpdate={handleUpdateRecruiter}
                  onRemove={handleRemoveRecruiter}
                />
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <OrganizationSettings
                  org={org}
                  onUpdate={handleUpdate}
                  onLogoUpload={handleLogoUpload}
                />
              )}

              {/* Verification Tab */}
              {activeTab === 'verification' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${
                      org?.verificationStatus === 'verified' ? 'bg-emerald-500' :
                      org?.verificationStatus === 'pending' ? 'bg-amber-500' : 'bg-slate-300'
                    }`} />
                    <div>
                      <p className="text-sm font-bold text-slate-900 capitalize">{org?.verificationStatus || 'Unverified'}</p>
                      <p className="text-xs text-slate-500">
                        {org?.verificationStatus === 'verified' ? 'Your organization is verified.' :
                         org?.verificationStatus === 'pending' ? 'Verification is being reviewed.' :
                         'Verify your organization to build trust with talent.'}
                      </p>
                    </div>
                  </div>

                  {org?.verificationStatus === 'unverified' && (
                    <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
                      <h4 className="text-sm font-bold text-amber-800">Why verify?</h4>
                      <ul className="mt-2 space-y-1 text-xs text-amber-700">
                        <li>• Build trust with potential hires</li>
                        <li>• Get a verified badge on your profile</li>
                        <li>• Increase visibility in search results</li>
                        <li>• Access to premium features</li>
                      </ul>
                      <button
                        type="button"
                        onClick={handleRequestVerification}
                        className="mt-4 rounded-xl border-2 border-amber-500 bg-amber-500 px-6 py-2 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(245,158,11,1)] hover:bg-amber-600 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                      >
                        Request Verification
                      </button>
                    </div>
                  )}

                  {org?.verificationStatus === 'verified' && (
                    <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-sm font-bold text-emerald-800">Your organization is verified</p>
                      <p className="mt-1 text-xs text-emerald-700">Talent can see your verified badge and trust your organization.</p>
                    </div>
                  )}

                  {org?.verificationStatus === 'pending' && (
                    <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm font-bold text-amber-800">Verification Pending</p>
                      <p className="mt-1 text-xs text-amber-700">We're reviewing your verification request. This usually takes 1-2 business days.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
