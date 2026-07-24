import { useState } from 'react'

const CATEGORIES = [
  'frontend', 'backend', 'mobile', 'devops', 'design',
  'data', 'ai', 'blockchain', 'security', 'general',
]

const PROFICIENCIES = ['beginner', 'intermediate', 'advanced', 'expert']

export default function SkillsManager({ skills = [], onChange }) {
  const [newSkill, setNewSkill] = useState({ name: '', category: 'general', proficiency: 'intermediate' })
  const [editIndex, setEditIndex] = useState(-1)

  function addSkill() {
    if (!newSkill.name.trim()) return
    const updated = [...skills, { ...newSkill, name: newSkill.name.trim() }]
    onChange(updated)
    setNewSkill({ name: '', category: 'general', proficiency: 'intermediate' })
  }

  function removeSkill(index) {
    onChange(skills.filter((_, i) => i !== index))
  }

  function startEdit(index) {
    setEditIndex(index)
    setNewSkill(skills[index])
  }

  function saveEdit() {
    if (editIndex < 0 || !newSkill.name.trim()) return
    const updated = skills.map((s, i) => i === editIndex ? { ...newSkill, name: newSkill.name.trim() } : s)
    onChange(updated)
    setNewSkill({ name: '', category: 'general', proficiency: 'intermediate' })
    setEditIndex(-1)
  }

  const isEditing = editIndex >= 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill, i) => (
          <span
            key={i}
            className="group inline-flex items-center gap-1 rounded-full border-2 border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700"
          >
            <span>{skill.name}</span>
            <span className="hidden text-[10px] text-slate-400 group-hover:inline">({skill.proficiency})</span>
            <button
              type="button"
              onClick={() => removeSkill(i)}
              className="ml-0.5 text-slate-400 hover:text-red-500"
            >
              &times;
            </button>
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Skill name"
          className="min-w-[140px] rounded-xl border-2 border-slate-300 bg-white px-3 py-1.5 text-xs transition-all focus:border-slate-900 focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:outline-none"
          value={newSkill.name}
          onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              isEditing ? saveEdit() : addSkill()
            }
          }}
        />
        <select
          className="rounded-xl border-2 border-slate-300 bg-white px-2 py-1.5 text-xs transition-all focus:border-slate-900 focus:outline-none"
          value={newSkill.category}
          onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          className="rounded-xl border-2 border-slate-300 bg-white px-2 py-1.5 text-xs transition-all focus:border-slate-900 focus:outline-none"
          value={newSkill.proficiency}
          onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value })}
        >
          {PROFICIENCIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button
          type="button"
          onClick={isEditing ? saveEdit : addSkill}
          disabled={!newSkill.name.trim()}
          className="rounded-xl border-2 border-slate-900 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
        >
          {isEditing ? 'Save' : 'Add'}
        </button>
      </div>

      {skills.length === 0 && (
        <p className="text-xs text-slate-400 italic">No skills added yet. Type a skill name above and click Add.</p>
      )}
    </div>
  )
}
