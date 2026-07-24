export default function ProfileCompletion({ completeness = 0, sections = [] }) {
  const getBarColor = (pct) => {
    if (pct >= 80) return 'bg-emerald-500'
    if (pct >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getLabel = (pct) => {
    if (pct >= 80) return 'Looks great!'
    if (pct >= 50) return 'Getting there'
    return 'Needs work'
  }

  const sectionLabels = {
    headline: 'Professional Headline',
    bio: 'Bio / Summary',
    avatar: 'Profile Photo',
    location: 'Location',
    experienceLevel: 'Experience Level',
    skills: 'Skills',
    experience: 'Work Experience',
    education: 'Education',
    certifications: 'Certifications',
    resume: 'Resume / CV',
  }

  return (
    <div className="rounded-2xl border-2 border-slate-900 bg-white p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Profile Completion</h3>
        <span className="text-lg font-black text-slate-900">{completeness}%</span>
      </div>

      <div className="mb-1 h-3 overflow-hidden rounded-full border-2 border-slate-900 bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor(completeness)}`}
          style={{ width: `${completeness}%` }}
        />
      </div>

      <p className={`mb-4 text-xs font-bold ${completeness >= 80 ? 'text-emerald-600' : completeness >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
        {getLabel(completeness)}
      </p>

      {sections.length > 0 && (
        <div className="space-y-1.5">
          {sections.map((section) => (
            <div key={section.name} className="flex items-center justify-between text-xs">
              <span className="text-slate-600">{sectionLabels[section.name] || section.name}</span>
              {section.completed ? (
                <span className="font-bold text-emerald-600">Done</span>
              ) : (
                <span className="font-bold text-slate-300">—</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
