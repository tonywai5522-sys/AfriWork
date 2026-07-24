import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as learningService from '../../services/learningService.js'

export default function MyLearning() {
  const [enrollments, setEnrollments] = useState([])
  const [courses, setCourses] = useState({})
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('in_progress')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const eRes = await learningService.getUserEnrollments()
        const items = eRes.data?.enrollments || []
        setEnrollments(items)

        const courseData = {}
        await Promise.all(items.map(async (enr) => {
          try {
            const cRes = await learningService.getCourse(enr.courseId)
            courseData[enr.courseId] = cRes.data?.course
          } catch { /* */ }
        }))
        setCourses(courseData)
      } catch { /* */ }
      setLoading(false)
    }
    load()
  }, [])

  const inProgress = enrollments.filter(e => !e.isCompleted)
  const completed = enrollments.filter(e => e.isCompleted)

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" /></div>

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-2 text-3xl font-black text-slate-900">My Learning</h1>
      <p className="mb-8 text-sm text-slate-500">{enrollments.length} enrolled courses</p>

      <div className="mb-6 flex gap-2">
        <button onClick={() => setTab('in_progress')}
          className={`rounded-xl px-4 py-2 text-xs font-bold ${tab === 'in_progress' ? 'border-2 border-slate-900 bg-slate-900 text-white' : 'border-2 border-slate-200 text-slate-600 hover:border-slate-300'}`}>
          In Progress ({inProgress.length})
        </button>
        <button onClick={() => setTab('completed')}
          className={`rounded-xl px-4 py-2 text-xs font-bold ${tab === 'completed' ? 'border-2 border-slate-900 bg-slate-900 text-white' : 'border-2 border-slate-200 text-slate-600 hover:border-slate-300'}`}>
          Completed ({completed.length})
        </button>
        <Link to="/learning" className="ml-auto rounded-xl border-2 border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:border-slate-900">
          Browse Courses
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-12 text-center">
          <p className="text-lg font-bold text-slate-400">No courses yet</p>
          <Link to="/learning" className="mt-2 inline-block rounded-xl border-2 border-slate-900 bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-700">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {(tab === 'in_progress' ? inProgress : completed).map(enr => {
            const course = courses[enr.courseId]
            return (
              <Link key={enr.id} to={`/learning/${enr.courseId}`}
                className="flex items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-4 transition-all hover:border-slate-900 hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-2xl">
                  {course?.isFree ? '📚' : '💰'}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-900">{course?.title || 'Loading...'}</h3>
                  {enr.isCompleted ? (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">✓ Completed</span>
                      {enr.certificateUrl && <span className="text-[10px] text-amber-600">🎓 Certificate</span>}
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${enr.progress || 0}%` }} />
                      </div>
                      <p className="mt-0.5 text-[10px] text-slate-400">{enr.progress || 0}% complete</p>
                    </div>
                  )}
                </div>
                <svg className="h-5 w-5 shrink-0 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
