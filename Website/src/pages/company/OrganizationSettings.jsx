import { useState } from 'react'

export default function OrganizationSettings({ org, onUpdate, onLogoUpload }) {
  const [uploading, setUploading] = useState(false)
  const [branding, setBranding] = useState(org?.branding || { primaryColor: '#0f172a', logoUrl: '', coverUrl: '' })
  const [socialLinks, setSocialLinks] = useState(org?.socialLinks || { linkedin: '', twitter: '', facebook: '', instagram: '' })

  async function handleColorChange(color) {
    const updated = { ...branding, primaryColor: color }
    setBranding(updated)
    await onUpdate({ branding: updated })
  }

  async function handleSocialSave() {
    await onUpdate({ socialLinks })
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await onLogoUpload(file)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Logo */}
      <div>
        <h4 className="mb-3 text-sm font-bold text-slate-900">Company Logo</h4>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-slate-300 bg-slate-50 text-2xl font-black text-slate-400 overflow-hidden">
            {org?.logoUrl ? (
              <img src={org.logoUrl} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              org?.name?.[0] || '?'
            )}
          </div>
          <div>
            <label className="cursor-pointer rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
              {uploading ? 'Uploading...' : 'Upload Logo'}
              <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleLogoUpload} />
            </label>
            <p className="mt-1 text-xs text-slate-400">JPEG, PNG, GIF, WebP. Max 5MB.</p>
          </div>
        </div>
      </div>

      {/* Brand Color */}
      <div>
        <h4 className="mb-3 text-sm font-bold text-slate-900">Brand Color</h4>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={branding.primaryColor}
            onChange={e => handleColorChange(e.target.value)}
            className="h-10 w-10 cursor-pointer rounded-xl border-2 border-slate-300"
          />
          <span className="text-xs font-mono text-slate-500">{branding.primaryColor}</span>
        </div>
      </div>

      {/* Social Links */}
      <div>
        <h4 className="mb-3 text-sm font-bold text-slate-900">Social Links</h4>
        <div className="grid grid-cols-2 gap-3">
          {['linkedin', 'twitter', 'facebook', 'instagram'].map(platform => (
            <div key={platform}>
              <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">{platform}</label>
              <input
                className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
                placeholder={`https://${platform}.com/...`}
                value={socialLinks[platform] || ''}
                onChange={e => setSocialLinks({ ...socialLinks, [platform]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleSocialSave}
          className="mt-3 rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          Save Social Links
        </button>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4">
        <h4 className="text-sm font-bold text-red-700">Danger Zone</h4>
        <p className="mb-3 text-xs text-red-600">Irreversible actions for your organization.</p>
        <button
          type="button"
          disabled
          className="rounded-xl border-2 border-red-500 bg-white px-4 py-2 text-xs font-bold text-red-600 opacity-50 cursor-not-allowed"
        >
          Delete Organization (Coming Soon)
        </button>
      </div>
    </div>
  )
}
