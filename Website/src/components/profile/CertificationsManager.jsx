import { useState, useEffect } from 'react'

function emptyCert() {
  return {
    id: `new_${Date.now()}`,
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    doesNotExpire: false,
    credentialUrl: '',
    credentialId: '',
    description: '',
  }
}

export default function CertificationsManager({ certifications = [], onChange }) {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    setItems(certifications)
  }, [certifications])

  function handleAdd() {
    setEditing(emptyCert())
  }

  function handleSave() {
    if (!editing.name.trim() || !editing.issuer.trim() || !editing.issueDate) return

    const updated = editing.id.startsWith('new_')
      ? [...items, { ...editing, id: `cert_${Date.now()}` }]
      : items.map(c => c.id === editing.id ? editing : c)

    setItems(updated)
    onChange(updated)
    setEditing(null)
  }

  function handleEdit(cert) {
    setEditing({ ...cert })
  }

  function handleDelete(id) {
    const updated = items.filter(c => c.id !== id)
    setItems(updated)
    onChange(updated)
  }

  function handleCancel() {
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      {/* Existing certifications */}
      {items.map((cert) => (
        <div key={cert.id} className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">{cert.name}</p>
              <p className="text-xs text-slate-600">{cert.issuer}</p>
              <p className="text-xs text-slate-400">
                Issued: {cert.issueDate}
                {!cert.doesNotExpire && cert.expiryDate ? ` · Expires: ${cert.expiryDate}` : ''}
                {cert.doesNotExpire ? ' · No Expiry' : ''}
              </p>
              {cert.credentialId && (
                <p className="mt-0.5 text-xs text-slate-400">Credential ID: {cert.credentialId}</p>
              )}
              {cert.description && (
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{cert.description}</p>
              )}
              {cert.credentialUrl && (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs font-bold text-blue-600 hover:underline"
                >
                  View Credential &rarr;
                </a>
              )}
            </div>
            <div className="ml-3 flex flex-shrink-0 gap-1">
              <button
                type="button"
                onClick={() => handleEdit(cert)}
                className="rounded-lg border border-slate-300 px-2 py-1 text-xs hover:bg-slate-200"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(cert.id)}
                className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                Del
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Editing form */}
      {editing && (
        <div className="rounded-xl border-2 border-slate-900 bg-white p-4 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
          <h4 className="mb-3 text-sm font-bold text-slate-900">
            {editing.id.startsWith('new_') ? 'Add Certification' : 'Edit Certification'}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="col-span-2 rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
              placeholder="Certification Name *"
              value={editing.name}
              onChange={e => setEditing({ ...editing, name: e.target.value })}
            />
            <input
              className="col-span-2 rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
              placeholder="Issuing Organization *"
              value={editing.issuer}
              onChange={e => setEditing({ ...editing, issuer: e.target.value })}
            />
            <div>
              <label className="mb-1 block text-[10px] font-bold text-slate-500">Issue Date *</label>
              <input
                type="date"
                className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
                value={editing.issueDate}
                onChange={e => setEditing({ ...editing, issueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold text-slate-500">
                {editing.doesNotExpire ? 'Expiry' : 'Expiry Date'}
              </label>
              <input
                type="date"
                disabled={editing.doesNotExpire}
                className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none disabled:opacity-40"
                value={editing.expiryDate}
                onChange={e => setEditing({ ...editing, expiryDate: e.target.value })}
              />
            </div>
            <label className="col-span-2 flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-2 border-slate-300"
                checked={editing.doesNotExpire}
                onChange={e => setEditing({ ...editing, doesNotExpire: e.target.checked, expiryDate: e.target.checked ? '' : editing.expiryDate })}
              />
              This certification does not expire
            </label>
            <input
              className="rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
              placeholder="Credential URL"
              value={editing.credentialUrl}
              onChange={e => setEditing({ ...editing, credentialUrl: e.target.value })}
            />
            <input
              className="rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
              placeholder="Credential ID"
              value={editing.credentialId}
              onChange={e => setEditing({ ...editing, credentialId: e.target.value })}
            />
            <textarea
              className="col-span-2 rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
              rows={2}
              placeholder="Description (optional)"
              value={editing.description}
              onChange={e => setEditing({ ...editing, description: e.target.value })}
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!editing.name.trim() || !editing.issuer.trim() || !editing.issueDate}
              className="rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-1.5 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl border-2 border-slate-300 px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add button */}
      {!editing && (
        <button
          type="button"
          onClick={handleAdd}
          className="w-full rounded-xl border-2 border-dashed border-slate-300 py-3 text-xs font-bold text-slate-500 transition-all hover:border-slate-900 hover:text-slate-900"
        >
          + Add Certification
        </button>
      )}

      {items.length === 0 && !editing && (
        <p className="text-xs text-slate-400 italic">No certifications added yet.</p>
      )}
    </div>
  )
}
