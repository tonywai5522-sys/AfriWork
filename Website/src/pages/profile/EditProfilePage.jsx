import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { ROUTES } from '../../constants/routes.js'
import * as profileService from '../../services/profileService.js'
import * as certificationService from '../../services/certificationService.js'
import * as resumeService from '../../services/resumeService.js'
import AvatarUpload from '../../components/profile/AvatarUpload.jsx'
import SkillsManager from '../../components/profile/SkillsManager.jsx'
import ExperienceForm from '../../components/profile/ExperienceForm.jsx'
import EducationForm from '../../components/profile/EducationForm.jsx'
import ProfileCompletion from '../../components/profile/ProfileCompletion.jsx'
import CertificationsManager from '../../components/profile/CertificationsManager.jsx'
import ResumeUpload from '../../components/profile/ResumeUpload.jsx'

const EXPERIENCE_LEVELS = ['entry', 'junior', 'mid', 'senior', 'expert']
const AVAILABILITY = ['available', 'busy', 'unavailable']
const WORK_TYPES = ['full_time', 'part_time', 'contract', 'remote', 'hybrid']
const TIMEZONES = [
  'UTC-12', 'UTC-11', 'UTC-10', 'UTC-9', 'UTC-8', 'UTC-7', 'UTC-6', 'UTC-5',
  'UTC-4', 'UTC-3', 'UTC-2', 'UTC-1', 'UTC+0', 'UTC+1', 'UTC+2', 'UTC+3',
  'UTC+4', 'UTC+5', 'UTC+6', 'UTC+7', 'UTC+8', 'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12',
]

export default function EditProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profile, setProfile] = useState(null)
  const [completeness, setCompleteness] = useState(0)
  const [completenessSections, setCompletenessSections] = useState([])
  const [activeTab, setActiveTab] = useState('basic')

  const [form, setForm] = useState({
    headline: '',
    bio: '',
    location: '',
    timezone: '',
    experienceLevel: 'mid',
    availability: 'available',
    website: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    preferredWorkType: 'remote',
    hourlyRate: '',
    currency: 'USD',
  })
  const [skills, setSkills] = useState([])
  const [experience, setExperience] = useState([])
  const [education, setEducation] = useState([])
  const [certifications, setCertifications] = useState([])
  const [resume, setResume] = useState(null)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await profileService.getProfileCompleteness()
      const p = response?.data?.profile
      const comp = response?.data?.completeness || 0
      const sections = response?.data?.sections || []

      setProfile(p)
      setCompleteness(comp)
      setCompletenessSections(sections)

      if (p) {
        setForm({
          headline: p.headline || '',
          bio: p.bio || '',
          location: p.location || '',
          timezone: p.timezone || '',
          experienceLevel: p.experienceLevel || 'mid',
          availability: p.availability || 'available',
          website: p.website || '',
          linkedinUrl: p.linkedinUrl || '',
          githubUrl: p.githubUrl || '',
          portfolioUrl: p.portfolioUrl || '',
          preferredWorkType: p.preferredWorkType || 'remote',
          hourlyRate: p.hourlyRate ? String(p.hourlyRate) : '',
          currency: p.currency || 'USD',
        })
        setSkills(p.skills || [])
        setExperience(p.experience || [])
        setEducation(p.education || [])
        setCertifications(p.certifications || [])
      }

      // Load resume info
      try {
        const resumeRes = await resumeService.getResumeInfo()
        if (resumeRes?.data?.resume) {
          setResume(resumeRes.data.resume)
        }
      } catch {
        // No resume yet - that's fine
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProfile() }, [loadProfile])

  async function handleSave(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        ...form,
        hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : 0,
      }
      await profileService.updateProfile(payload)
      await profileService.updateSkills(skills)
      await profileService.updateExperience(experience)
      await profileService.updateEducation(education)

      // Save certifications
      await certificationService.updateAllCertifications(certifications)

      setSuccess('Profile saved successfully!')
      await loadProfile()
    } catch (err) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarUpload(file) {
    setUploadingAvatar(true)
    try {
      await profileService.uploadAvatar(file)
      setSuccess('Avatar updated!')
      await loadProfile()
    } catch (err) {
      setError(err.message || 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleAvatarDelete() {
    setUploadingAvatar(true)
    try {
      await profileService.deleteAvatar()
      setSuccess('Avatar removed')
      await loadProfile()
    } catch (err) {
      setError(err.message || 'Failed to remove avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleResumeUpload(file) {
    setUploadingResume(true)
    try {
      const result = await resumeService.uploadResume(file)
      if (result?.data) {
        setResume(result.data)
      }
      setSuccess('Resume uploaded!')
      await loadProfile()
    } catch (err) {
      setError(err.message || 'Failed to upload resume')
    } finally {
      setUploadingResume(false)
    }
  }

  async function handleResumeDelete() {
    setUploadingResume(true)
    try {
      await resumeService.deleteResume()
      setResume(null)
      setSuccess('Resume removed')
      await loadProfile()
    } catch (err) {
      setError(err.message || 'Failed to remove resume')
    } finally {
      setUploadingResume(false)
    }
  }

  async function handleResumeDownload() {
    try {
      const blob = await resumeService.downloadResume()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = resume?.name || 'resume'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message || 'Failed to download resume')
    }
  }

  function handleSkillsChange(newSkills) {
    setSkills(newSkills)
  }

  function handleExperienceChange(newExp) {
    setExperience(newExp)
  }

  function handleEducationChange(newEdu) {
    setEducation(newEdu)
  }

  function handleCertificationsChange(newCerts) {
    setCertifications(newCerts)
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'skills', label: `Skills (${skills.length})` },
    { id: 'experience', label: `Experience (${experience.length})` },
    { id: 'education', label: `Education (${education.length})` },
    { id: 'certifications', label: `Certs (${certifications.length})` },
    { id: 'resume', label: 'CV / Resume' },
    { id: 'links', label: 'Links & Social' },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Edit Profile</h1>
          <p className="mt-1 text-sm text-slate-600">
            {profile ? 'Update your professional profile' : 'Create your professional profile'}
          </p>
        </div>
        <button
          onClick={() => navigate(ROUTES.dashboard)}
          className="rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition-all hover:border-slate-900 hover:text-slate-900"
        >
          &larr; Dashboard
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-xl border-2 border-emerald-500 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-medium text-emerald-700">{success}</p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]">
            <AvatarUpload
              currentUrl={profile?.avatarUrl}
              onUpload={handleAvatarUpload}
              onDelete={handleAvatarDelete}
              uploading={uploadingAvatar}
            />
            <div className="mt-4 text-center">
              <p className="text-sm font-bold text-slate-900">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <span className="mt-1 inline-block rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {user?.role || 'talent'}
              </span>
            </div>
          </div>

          <ProfileCompletion completeness={completeness} sections={completenessSections} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="mb-6 flex flex-wrap gap-2 border-b-2 border-slate-200 pb-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
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

          <form onSubmit={handleSave}>
            <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-5">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-900">Professional Headline *</label>
                    <input
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:outline-none"
                      placeholder="e.g. Full-Stack Developer | React & Node.js Expert"
                      maxLength={160}
                      value={form.headline}
                      onChange={e => setForm({ ...form, headline: e.target.value })}
                    />
                    <p className="mt-1 text-xs text-slate-400">{form.headline.length}/160</p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-900">Bio / Summary</label>
                    <textarea
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:outline-none"
                      rows={5}
                      maxLength={4000}
                      placeholder="Tell potential employers about yourself, your background, and what you're looking for..."
                      value={form.bio}
                      onChange={e => setForm({ ...form, bio: e.target.value })}
                    />
                    <p className="mt-1 text-xs text-slate-400">{form.bio.length}/4000</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-900">Location</label>
                      <input
                        className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:outline-none"
                        placeholder="Nairobi, Kenya"
                        value={form.location}
                        onChange={e => setForm({ ...form, location: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-900">Timezone</label>
                      <select
                        className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none"
                        value={form.timezone}
                        onChange={e => setForm({ ...form, timezone: e.target.value })}
                      >
                        <option value="">Select timezone</option>
                        {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-900">Experience Level</label>
                      <select
                        className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none"
                        value={form.experienceLevel}
                        onChange={e => setForm({ ...form, experienceLevel: e.target.value })}
                      >
                        {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-900">Availability</label>
                      <select
                        className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none"
                        value={form.availability}
                        onChange={e => setForm({ ...form, availability: e.target.value })}
                      >
                        {AVAILABILITY.map(a => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-900">Preferred Work Type</label>
                      <select
                        className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none"
                        value={form.preferredWorkType}
                        onChange={e => setForm({ ...form, preferredWorkType: e.target.value })}
                      >
                        {WORK_TYPES.map(w => <option key={w} value={w}>{w.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-900">Rate</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:outline-none"
                          placeholder="0.00"
                          value={form.hourlyRate}
                          onChange={e => setForm({ ...form, hourlyRate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-900">&nbsp;</label>
                        <select
                          className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none"
                          value={form.currency}
                          onChange={e => setForm({ ...form, currency: e.target.value })}
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="KES">KES</option>
                          <option value="NGN">NGN</option>
                          <option value="ZAR">ZAR</option>
                          <option value="GHS">GHS</option>
                          <option value="ETB">ETB</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills Tab */}
              {activeTab === 'skills' && (
                <SkillsManager skills={skills} onChange={handleSkillsChange} />
              )}

              {/* Experience Tab */}
              {activeTab === 'experience' && (
                <ExperienceForm experience={experience} onChange={handleExperienceChange} />
              )}

              {/* Education Tab */}
              {activeTab === 'education' && (
                <EducationForm education={education} onChange={handleEducationChange} />
              )}

              {/* Certifications Tab */}
              {activeTab === 'certifications' && (
                <CertificationsManager certifications={certifications} onChange={handleCertificationsChange} />
              )}

              {/* Resume Tab */}
              {activeTab === 'resume' && (
                <ResumeUpload
                  resume={resume}
                  onUpload={handleResumeUpload}
                  onDelete={handleResumeDelete}
                  onDownload={handleResumeDownload}
                  uploading={uploadingResume}
                />
              )}

              {/* Links Tab */}
              {activeTab === 'links' && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-900">Website</label>
                    <input
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:outline-none"
                      placeholder="https://yourwebsite.com"
                      value={form.website}
                      onChange={e => setForm({ ...form, website: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-900">LinkedIn</label>
                    <input
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:outline-none"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={form.linkedinUrl}
                      onChange={e => setForm({ ...form, linkedinUrl: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-900">GitHub</label>
                    <input
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:outline-none"
                      placeholder="https://github.com/yourhandle"
                      value={form.githubUrl}
                      onChange={e => setForm({ ...form, githubUrl: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-900">Portfolio</label>
                    <input
                      className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:outline-none"
                      placeholder="https://yourportfolio.dev"
                      value={form.portfolioUrl}
                      onChange={e => setForm({ ...form, portfolioUrl: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 border-t-2 border-slate-200 pt-6">
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl border-2 border-slate-900 bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-800 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : profile ? 'Save Changes' : 'Create Profile'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.dashboard)}
                    className="rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition-all hover:border-slate-900 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
