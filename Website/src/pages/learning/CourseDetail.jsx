import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import * as learningService from '../../services/learningService.js'

export default function CourseDetail() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [enrollment, setEnrollment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [cRes, lRes, eRes] = await Promise.all([
          learningService.getCourse(courseId),
          learningService.getCourseLessons(courseId),
          learningService.getEnrollment(courseId).catch(() => ({ data: { enrollment: null } })),
        ])
        setCourse(cRes.data?.course)
        setLessons(lRes.data?.lessons || [])
        setEnrollment(eRes.data?.enrollment || null)
      } catch { /* */ }
      setLoading(false)
    }
    load()
  }, [courseId])

  async function handleEnroll() {
    try {
      const res = await learningService.enrollCourse(courseId)
      setEnrollment(res.data?.enrollment)
    } catch { /* */ }
  }

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" /></div>
  if (!course) return <div className="p-8 text-center text-lg font-bold text-slate-500">Course not found</div>

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <button onClick={() => navigate('/learning')} className="mb-6 flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900">← Back to Courses</button>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-[11px] font-bold text-blue-700">{course.level}</span>
              {course.isFree && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-[11px] font-bold text-emerald-700">Free</span>}
              {course.categoryName && <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-0.5 text-[11px] text-slate-600">{course.categoryName}</span>}
            </div>
            <h1 className="text-3xl font-black text-slate-900">{course.title}</h1>
            <p className="mt-1 text-sm text-slate-500">by {course.instructorName}</p>
          </div>

          <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
            <h2 className="mb-3 text-sm font-bold text-slate-900">About This Course</h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{course.description}</p>
          </div>

          {course.whatYouLearn?.length > 0 && (
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
              <h2 className="mb-3 text-sm font-bold text-slate-900">What You'll Learn</h2>
              <ul className="space-y-2">
                {course.whatYouLearn.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-0.5 text-emerald-500">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {course.prerequisites && (
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
              <h2 className="mb-3 text-sm font-bold text-slate-900">Prerequisites</h2>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{course.prerequisites}</p>
            </div>
          )}

          <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-bold text-slate-900">{lessons.length} Lesson{lessons.length !== 1 ? 's' : ''}</h2>
            <div className="space-y-2">
              {lessons.map((lesson, i) => {
                const completed = enrollment?.completedLessons?.includes(lesson.id)
                const isCurrent = enrollment?.currentLessonId === lesson.id
                return (
                  <div key={lesson.id}
                    className={`flex items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                      isCurrent ? 'border-slate-900 bg-slate-50' :
                      completed ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'
                    }`}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      completed ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>{completed ? '✓' : i + 1}</div>
                    <div className="min-w-0 flex-1">
                      {enrollment ? (
                        <Link to={`/learning/${courseId}/lessons/${lesson.id}`} className="text-sm font-bold text-slate-900 hover:text-slate-700">
                          {lesson.title}
                        </Link>
                      ) : (
                        <p className="text-sm font-bold text-slate-900">{lesson.title}</p>
                      )}
                      <p className="text-xs text-slate-500">{lesson.contentType} · {lesson.videoDuration || ''}</p>
                    </div>
                    {enrollment && completed && (
                      <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 text-center sticky top-24">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-4xl">
              {course.isFree ? '📚' : '💰'}
            </div>
            <p className="text-lg font-bold text-slate-900">{course.isFree ? 'Free' : `$${course.price}`}</p>
            <p className="mt-1 text-xs text-slate-500">{course.duration || 0} min · {course.lessonCount || lessons.length} lessons</p>

            {enrollment ? (
              <div className="mt-4 space-y-3">
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${enrollment.progress || 0}%` }} />
                </div>
                <p className="text-xs text-slate-500">{enrollment.progress || 0}% complete</p>
                {enrollment.isCompleted && enrollment.certificateUrl && (
                  <a href={enrollment.certificateUrl} target="_blank" rel="noopener noreferrer"
                    className="block rounded-xl border-2 border-amber-400 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100">
                    🎓 View Certificate
                  </a>
                )}
                {lessons.length > 0 && (
                  <Link to={`/learning/${courseId}/lessons/${enrollment.currentLessonId || lessons[0].id}`}
                    className="block rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700">
                    {enrollment.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                  </Link>
                )}
              </div>
            ) : (
              <button onClick={handleEnroll}
                className="mt-4 w-full rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700">
                Enroll Now
              </button>
            )}

            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
              {course.rating > 0 && <p>★ {course.rating.toFixed(1)} ({course.reviewCount || 0} reviews)</p>}
              <p>{course.enrollmentCount || 0} enrolled</p>
              <p>{course.language || 'English'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
