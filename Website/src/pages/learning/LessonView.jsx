import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import * as learningService from '../../services/learningService.js'

export default function LessonView() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [enrollment, setEnrollment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [lRes, cRes, lsRes, eRes] = await Promise.all([
          learningService.getLesson(lessonId),
          learningService.getCourse(courseId),
          learningService.getCourseLessons(courseId),
          learningService.getEnrollment(courseId).catch(() => ({ data: { enrollment: null } })),
        ])
        setLesson(lRes.data?.lesson)
        setCourse(cRes.data?.course)
        setLessons(lsRes.data?.lessons || [])
        const enr = eRes.data?.enrollment
        setEnrollment(enr)
        setCompleted(enr?.completedLessons?.includes(lessonId))
      } catch { /* */ }
      setLoading(false)
    }
    load()
  }, [courseId, lessonId])

  async function handleComplete() {
    try {
      const res = await learningService.updateProgress(courseId, lessonId)
      setEnrollment(res.data?.enrollment)
      setCompleted(true)
    } catch { /* */ }
  }

  const currentIndex = lessons.findIndex(l => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" /></div>
  if (!lesson || !course) return <div className="p-8 text-center text-lg font-bold text-slate-500">Lesson not found</div>

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to={`/learning/${courseId}`} className="text-xs font-bold text-slate-500 hover:text-slate-900">← Back to {course.title}</Link>
          <h1 className="mt-1 text-2xl font-black text-slate-900">{lesson.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {prevLesson && (
            <Link to={`/learning/${courseId}/lessons/${prevLesson.id}`}
              className="rounded-xl border-2 border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:border-slate-900">
              ← Previous
            </Link>
          )}
          {nextLesson && (
            <Link to={`/learning/${courseId}/lessons/${nextLesson.id}`}
              className="rounded-xl border-2 border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:border-slate-900">
              Next →
            </Link>
          )}
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-0.5 text-[11px] text-slate-600">
          Lesson {currentIndex + 1} of {lessons.length}
        </span>
        {lesson.contentType === 'video' && <span className="text-xs text-slate-400">🎬 Video</span>}
        {lesson.isFree && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Free</span>}
      </div>

      {lesson.videoUrl && (
        <div className="mb-6 overflow-hidden rounded-2xl border-2 border-slate-200 bg-black aspect-video">
          <video src={lesson.videoUrl} controls className="h-full w-full" />
        </div>
      )}

      {lesson.description && (
        <div className="mb-6 rounded-2xl border-2 border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-700 leading-relaxed">{lesson.description}</p>
        </div>
      )}

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
        <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
          {lesson.content || 'No content for this lesson yet.'}
        </div>
      </div>

      {lesson.resources?.length > 0 && (
        <div className="mt-6 rounded-2xl border-2 border-slate-200 bg-white p-6">
          <h3 className="mb-3 text-sm font-bold text-slate-900">Resources</h3>
          <ul className="space-y-2">
            {lesson.resources.map((r, i) => (
              <li key={i}><a href={r.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">{r.name}</a></li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between border-t-2 border-slate-200 pt-6">
        <button onClick={handleComplete}
          className={`rounded-xl border-2 px-6 py-2.5 text-xs font-bold transition-all ${
            completed
              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
              : 'border-slate-900 bg-slate-900 text-white hover:bg-slate-700'
          }`}>
          {completed ? '✓ Completed' : 'Mark as Complete'}
        </button>

        <div className="flex gap-2">
          {prevLesson && (
            <Link to={`/learning/${courseId}/lessons/${prevLesson.id}`}
              className="rounded-xl border-2 border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-600 hover:border-slate-900">
              ← Previous
            </Link>
          )}
          {nextLesson && (
            <Link to={`/learning/${courseId}/lessons/${nextLesson.id}`}
              className="rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700">
              Next Lesson →
            </Link>
          )}
          {!nextLesson && (
            <Link to={`/learning/${courseId}`}
              className="rounded-xl border-2 border-emerald-400 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100">
              🎉 Complete Course
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
