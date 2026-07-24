const EXPERIENCE_LEVELS = ['entry', 'junior', 'mid', 'senior', 'expert']
const AVAILABILITY_OPTIONS = ['available', 'busy', 'unavailable']
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'name', label: 'Name' },
  { value: 'registration', label: 'Newest' },
]

const COMMON_SKILLS = [
  'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Java',
  'Flutter', 'React Native', 'Angular', 'Vue.js', 'Django', 'Go',
  'AWS', 'Docker', 'PostgreSQL', 'MongoDB', 'GraphQL', 'Figma',
]

export default function TalentFilters({ filters, onChange }) {
  function handleChange(key, value) {
    onChange({ ...filters, [key]: value })
  }

  function toggleSkill(skill) {
    const current = filters.skills || []
    const next = current.includes(skill)
      ? current.filter(s => s !== skill)
      : [...current, skill]
    handleChange('skills', next)
  }

  function clearAll() {
    onChange({
      query: '',
      skills: [],
      experienceLevel: '',
      availability: '',
      location: '',
      hourlyRateMin: '',
      hourlyRateMax: '',
      sortBy: 'relevance',
      sortOrder: 'desc',
    })
  }

  const hasActiveFilters = filters.query || filters.skills?.length || filters.experienceLevel || filters.availability || filters.location || filters.hourlyRateMin || filters.hourlyRateMax

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Filters</h3>
        {hasActiveFilters && (
          <button onClick={clearAll} className="text-[10px] font-bold text-red-600 hover:text-red-700">
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Search</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name..."
            className="w-full rounded-xl border-2 border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-slate-900 focus:outline-none"
            value={filters.query || ''}
            onChange={e => handleChange('query', e.target.value)}
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location</label>
        <input
          type="text"
          placeholder="e.g. Nairobi, Remote"
          className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
          value={filters.location || ''}
          onChange={e => handleChange('location', e.target.value)}
        />
      </div>

      {/* Experience Level */}
      <div>
        <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Experience</label>
        <div className="flex flex-wrap gap-1">
          {EXPERIENCE_LEVELS.map(level => (
            <button
              key={level}
              onClick={() => handleChange('experienceLevel', filters.experienceLevel === level ? '' : level)}
              className={`rounded-full border px-3 py-1 text-[10px] font-bold transition-all ${
                filters.experienceLevel === level
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 text-slate-600 hover:border-slate-900'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Availability</label>
        <select
          className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
          value={filters.availability || ''}
          onChange={e => handleChange('availability', e.target.value)}
        >
          <option value="">Any</option>
          {AVAILABILITY_OPTIONS.map(a => (
            <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Hourly Rate */}
      <div>
        <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hourly Rate ($)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
            value={filters.hourlyRateMin || ''}
            onChange={e => handleChange('hourlyRateMin', e.target.value)}
          />
          <span className="text-xs text-slate-400">—</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
            value={filters.hourlyRateMax || ''}
            onChange={e => handleChange('hourlyRateMax', e.target.value)}
          />
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Skills</label>
        <div className="flex flex-wrap gap-1">
          {COMMON_SKILLS.map(skill => {
            const active = (filters.skills || []).includes(skill)
            return (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`rounded-md border px-2 py-1 text-[9px] font-medium transition-all ${
                  active
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-400'
                }`}
              >
                {skill}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sort By</label>
        <select
          className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
          value={filters.sortBy || 'relevance'}
          onChange={e => handleChange('sortBy', e.target.value)}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
