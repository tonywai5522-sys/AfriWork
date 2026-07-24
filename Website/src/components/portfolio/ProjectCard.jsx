import { Link } from 'react-router-dom'
import { formatDate } from '../../utils/formatDate.js'

const CATEGORY_LABELS = {
  web_app: 'Web App',
  mobile_app: 'Mobile App',
  api: 'API / Backend',
  design: 'UI/UX Design',
  data: 'Data / Analytics',
  ai: 'AI / ML',
  blockchain: 'Blockchain',
  devops: 'DevOps',
  open_source: 'Open Source',
  freelance: 'Freelance',
  other: 'Other',
}

const CATEGORY_COLORS = {
  web_app: 'bg-blue-100 text-blue-700 border-blue-300',
  mobile_app: 'bg-purple-100 text-purple-700 border-purple-300',
  api: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  design: 'bg-pink-100 text-pink-700 border-pink-300',
  data: 'bg-amber-100 text-amber-700 border-amber-300',
  ai: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  blockchain: 'bg-orange-100 text-orange-700 border-orange-300',
  devops: 'bg-slate-100 text-slate-700 border-slate-300',
  open_source: 'bg-green-100 text-green-700 border-green-300',
  freelance: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  other: 'bg-slate-100 text-slate-600 border-slate-300',
}

export default function ProjectCard({ project }) {
  const categoryColor = CATEGORY_COLORS[project.category] || CATEGORY_COLORS.other
  const categoryLabel = CATEGORY_LABELS[project.category] || project.categoryLabel || project.category

  return (
    <Link
      to={`/portfolio/${project.id}`}
      className="group block rounded-2xl border-2 border-slate-200 bg-white p-5 transition-all hover:border-slate-900 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
    >
      {/* Thumbnail */}
      <div className="mb-4 flex h-40 items-center justify-center overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-100">
        {project.thumbnailUrl ? (
          <img src={project.thumbnailUrl} alt={project.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-slate-300">
            {project.category === 'web_app' ? '🌐' :
             project.category === 'mobile_app' ? '📱' :
             project.category === 'design' ? '🎨' :
             project.category === 'api' ? '⚡' :
             project.category === 'ai' ? '🤖' :
             project.category === 'data' ? '📊' :
             project.category === 'blockchain' ? '🔗' :
             project.category === 'devops' ? '🛠️' :
             project.category === 'open_source' ? '📂' :
             '📁'}
          </div>
        )}
      </div>

      {/* Category Badge */}
      <span className={`mb-2 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${categoryColor}`}>
        {categoryLabel}
      </span>

      {/* Title */}
      <h3 className="mb-1 text-base font-black text-slate-900 group-hover:text-slate-700">{project.title}</h3>

      {/* Description */}
      <p className="mb-3 line-clamp-2 text-xs text-slate-500">
        {project.description || 'No description'}
      </p>

      {/* Technologies */}
      {project.technologies?.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {project.technologies.slice(0, 4).map((tech, i) => (
            <span key={i} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600">
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="text-[10px] text-slate-400">+{project.technologies.length - 4}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t-2 border-slate-100 pt-3 text-[11px] text-slate-400">
        <span>{formatDate(project.createdAt)}</span>
        <div className="flex items-center gap-3">
          {project.githubUrl && <span className="font-bold text-slate-500">GH</span>}
          {project.liveUrl && <span className="font-bold text-emerald-600">Live</span>}
          <span>{project.viewCount || 0} views</span>
        </div>
      </div>
    </Link>
  )
}
