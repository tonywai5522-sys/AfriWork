import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes.js'
import DashboardLayout from '../../layouts/dashboard/DashboardLayout.jsx'
import KanbanBoard from '../../components/tasks/KanbanBoard.jsx'
import TaskCard from '../../components/tasks/TaskCard.jsx'
import TaskForm from '../../components/tasks/TaskForm.jsx'
import TaskDetail from '../../components/tasks/TaskDetail.jsx'
import MilestoneList from '../../components/tasks/MilestoneList.jsx'
import MilestoneForm from '../../components/tasks/MilestoneForm.jsx'
import ActivityFeed from '../../components/projects/ActivityFeed.jsx'
import ProjectForm from '../../components/projects/ProjectForm.jsx'
import CommentSection from '../../components/comments/CommentSection.jsx'
import * as projectService from '../../services/projectService.js'
import * as taskListService from '../../services/taskListService.js'
import * as taskService from '../../services/taskService.js'
import * as milestoneService from '../../services/milestoneService.js'
import * as commentService from '../../services/commentService.js'
import * as activityFeedService from '../../services/activityFeedService.js'
import { useAuth } from '../../hooks/useAuth.js'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function WorkspaceDetail() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [project, setProject] = useState(null)
  const [taskLists, setTaskLists] = useState([])
  const [tasks, setTasks] = useState({})
  const [milestones, setMilestones] = useState([])
  const [activity, setActivity] = useState([])
  const [activityPage, setActivityPage] = useState(1)
  const [hasMoreActivity, setHasMoreActivity] = useState(false)

  const [activeTab, setActiveTab] = useState('board')
  const [showEdit, setShowEdit] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskFormListId, setTaskFormListId] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState(null)
  const [saving, setSaving] = useState(false)
  const [comments, setComments] = useState([])

  /* ─── Data Loading ─────────────────────────────────── */

  const loadProject = useCallback(async () => {
    setLoading(true)
    try {
      const res = await projectService.getProjectById(projectId)
      if (!res?.data?.project) { navigate(ROUTES.projects); return }
      setProject(res.data.project)
    } catch { navigate(ROUTES.projects) }
    setLoading(false)
  }, [projectId, navigate])

  const loadTaskLists = useCallback(async () => {
    try {
      const res = await taskListService.getProjectTaskLists(projectId)
      setTaskLists(res?.data?.taskLists || [])
    } catch { /* ignore */ }
  }, [projectId])

  const loadTasks = useCallback(async () => {
    try {
      const res = await taskService.getProjectTasks(projectId, { limit: 200 })
      const taskArr = res?.data?.tasks || []
      const grouped = {}
      taskArr.forEach(t => {
        const listId = t.taskListId || 'unassigned'
        if (!grouped[listId]) grouped[listId] = []
        grouped[listId].push(t)
      })
      setTasks(grouped)
    } catch { /* ignore */ }
  }, [projectId])

  const loadMilestones = useCallback(async () => {
    try {
      const res = await milestoneService.getProjectMilestones(projectId, { limit: 100 })
      setMilestones(res?.data?.milestones || [])
    } catch { /* ignore */ }
  }, [projectId])

  const loadComments = useCallback(async () => {
    try {
      const res = await commentService.getEntityComments('project', projectId)
      setComments(res?.data?.comments || [])
    } catch { /* ignore */ }
  }, [projectId])

  const loadActivity = useCallback(async (page = 1) => {
    try {
      const res = await activityFeedService.getProjectActivity?.(projectId, { page, limit: 20 }) ||
        { data: { entries: [] } }
      const entries = res?.data?.entries || []
      if (page === 1) setActivity(entries)
      else setActivity(prev => [...prev, ...entries])
      setHasMoreActivity(entries.length === 20)
      setActivityPage(page)
    } catch { /* ignore */ }
  }, [projectId])

  useEffect(() => {
    loadProject()
    loadTaskLists()
    loadTasks()
    loadMilestones()
    loadComments()
    loadActivity()
  }, [loadProject, loadTaskLists, loadTasks, loadMilestones, loadComments, loadActivity])

  /* ─── Event Handlers ────────────────────────────────── */

  async function handleUpdateProject(formData) {
    setSaving(true)
    try {
      const res = await projectService.updateProject(projectId, formData)
      if (res?.data?.project) setProject(res.data.project)
      setShowEdit(false)
    } catch (err) {
      setError(err.message || 'Failed to update project')
    }
    setSaving(false)
  }

  async function handleDeleteProject() {
    if (!window.confirm('Delete this project and all its data? This cannot be undone.')) return
    try {
      await projectService.deleteProject(projectId)
      navigate(ROUTES.projects)
    } catch (err) {
      setError(err.message || 'Failed to delete project')
    }
  }

  async function handleAddTask(formData) {
    setSaving(true)
    try {
      await taskService.createTask({ ...formData, projectId })
      await loadTasks()
      setShowTaskForm(false)
    } catch (err) {
      setError(err.message || 'Failed to create task')
    }
    setSaving(false)
  }

  async function handleUpdateTask(taskId, formData) {
    setSaving(true)
    try {
      await taskService.updateTask(taskId, formData)
      await loadTasks()
      setSelectedTask(prev => prev?.id === taskId ? { ...prev, ...formData } : prev)
    } catch (err) {
      setError(err.message || 'Failed to update task')
    }
    setSaving(false)
  }

  async function handleDeleteTask(taskId) {
    if (!window.confirm('Delete this task?')) return
    try {
      await taskService.deleteTask(taskId)
      await loadTasks()
      setSelectedTask(null)
    } catch (err) {
      setError(err.message || 'Failed to delete task')
    }
  }

  async function handleTaskMove(taskId, newListId, newPosition) {
    try {
      await taskService.reorderTasks({ taskListId: newListId, taskIds: [taskId] })
      await loadTasks()
    } catch { /* optimistic */ }
  }

  async function handleAddMilestone(formData) {
    setSaving(true)
    try {
      await milestoneService.createMilestone({ ...formData, projectId })
      await loadMilestones()
      setShowMilestoneForm(false)
      setEditingMilestone(null)
    } catch (err) {
      setError(err.message || 'Failed to create milestone')
    }
    setSaving(false)
  }

  async function handleUpdateMilestone(milestoneId, formData) {
    setSaving(true)
    try {
      await milestoneService.updateMilestone(milestoneId, formData)
      await loadMilestones()
      setEditingMilestone(null)
    } catch (err) {
      setError(err.message || 'Failed to update milestone')
    }
    setSaving(false)
  }

  async function handleAddComment(data) {
    try {
      await commentService.createComment(data)
      await loadComments()
    } catch { /* ignore */ }
  }

  function handleLoadMoreActivity() {
    loadActivity(activityPage + 1)
  }

  /* ─── Render Helpers ─────────────────────────────────── */

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        </div>
      </DashboardLayout>
    )
  }

  if (!project) return null

  const isOwner = project.ownerId === user?.id
  const progress = project.progress || 0
  const memberAvatars = project.members?.filter(m => m.status === 'active')?.slice(0, 5) || []

  const tabs = [
    { id: 'board', label: 'Board' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'milestones', label: `Milestones (${milestones.length})` },
    { id: 'activity', label: 'Activity' },
    { id: 'comments', label: `Comments (${comments.length})` },
  ]

  const PRIORITY_COLORS = {
    urgent: 'border-red-300 bg-red-50 text-red-700',
    high: 'border-orange-300 bg-orange-50 text-orange-700',
    medium: 'border-blue-300 bg-blue-50 text-blue-700',
    low: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  }

  const STATUS_COLORS = {
    planning: 'border-amber-300 bg-amber-50 text-amber-700',
    active: 'border-emerald-300 bg-emerald-50 text-emerald-700',
    on_hold: 'border-orange-300 bg-orange-50 text-orange-700',
    completed: 'border-blue-300 bg-blue-50 text-blue-700',
    archived: 'border-slate-300 bg-slate-50 text-slate-600',
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* ─── Error Banner ──────────────────────────────── */}
        {error && (
          <div className="mb-6 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {/* ─── Project Header ────────────────────────────── */}
        <div className="mb-8">
          <button
            onClick={() => navigate(ROUTES.projects)}
            className="mb-4 inline-flex items-center gap-1 rounded-xl border-2 border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-slate-900 hover:text-slate-900"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Projects
          </button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-900 bg-slate-900 text-lg font-black text-white">
                {project.title?.[0]?.toUpperCase() || 'P'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 truncate">{project.title}</h1>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize ${STATUS_COLORS[project.status] || STATUS_COLORS.planning}`}>
                    {project.status?.replace('_', ' ') || 'planning'}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-medium text-slate-500 capitalize">
                    {project.visibility || 'private'}
                  </span>
                </div>
                {project.description && (
                  <p className="mt-1 text-sm text-slate-600 line-clamp-1">{project.description}</p>
                )}
                {/* Progress Bar */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 max-w-xs rounded-full border-2 border-slate-900 bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">{progress}%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Member avatars */}
              <div className="flex -space-x-2">
                {memberAvatars.map((m) => (
                  <div key={m.id} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[10px] font-bold text-slate-700">
                    {(m.name?.[0] || m.email?.[0] || '?').toUpperCase()}
                  </div>
                ))}
                {project.members?.length > 5 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-500">
                    +{project.members.length - 5}
                  </div>
                )}
              </div>

              {isOwner && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEdit(true)}
                    className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteProject}
                    className="rounded-xl border-2 border-red-400 bg-white px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Edit Project Modal ─────────────────────────── */}
        {showEdit && (
          <ProjectForm
            open={showEdit}
            onClose={() => setShowEdit(false)}
            onSubmit={handleUpdateProject}
            initialData={{ title: project.title, description: project.description || '', visibility: project.visibility, startDate: project.startDate, endDate: project.endDate, budget: project.budget, currency: project.currency }}
            loading={saving}
          />
        )}

        {/* ─── Tabs ───────────────────────────────────────── */}
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

        {/* ─── Tab Content ────────────────────────────────── */}

        {/* Tab: Board (Kanban) */}
        {activeTab === 'board' && (
          <KanbanBoard
            projectId={projectId}
            taskLists={taskLists}
            tasks={tasks}
            onTaskMove={handleTaskMove}
            onTaskClick={(task) => setSelectedTask(task)}
            onAddTask={(listId) => {
              setTaskFormListId(listId)
              setShowTaskForm(true)
            }}
          />
        )}

        {/* Tab: Tasks (List View) */}
        {activeTab === 'tasks' && (
          <div className="rounded-2xl border-2 border-slate-900 bg-white shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex items-center justify-between border-b-2 border-slate-900 px-5 py-3">
              <h3 className="text-sm font-bold text-slate-900">All Tasks</h3>
              <button
                type="button"
                onClick={() => { setTaskFormListId(null); setShowTaskForm(true) }}
                className="rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-1.5 text-[10px] font-bold text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                + Add Task
              </button>
            </div>
            <div className="divide-y-2 divide-slate-100">
              {Object.values(tasks).flat().length === 0 && (
                <p className="px-5 py-8 text-center text-xs text-slate-400">No tasks yet.</p>
              )}
              {Object.entries(tasks).map(([listId, listTasks]) => (
                <div key={listId}>
                  {listTasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-slate-50 transition-all"
                    >
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 border-slate-300">
                        {task.status === 'completed' && (
                          <svg className="h-3 w-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="flex-1 text-xs font-medium text-slate-900 truncate">{task.title}</span>
                      {task.priority && task.priority !== 'none' && (
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${PRIORITY_COLORS[task.priority] || ''}`}>
                          {task.priority}
                        </span>
                      )}
                      {task.assigneeName && (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-100 text-[9px] font-bold text-slate-600">
                          {task.assigneeName[0]}
                        </div>
                      )}
                      {task.dueDate && (
                        <span className="text-[10px] text-slate-400">{new Date(task.dueDate).toLocaleDateString()}</span>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Milestones */}
        {activeTab === 'milestones' && (
          <MilestoneList
            milestones={milestones}
            onMilestoneClick={(ms) => setEditingMilestone(ms)}
            onAddMilestone={() => { setEditingMilestone(null); setShowMilestoneForm(true) }}
          />
        )}

        {/* Tab: Activity */}
        {activeTab === 'activity' && (
          <ActivityFeed
            entries={activity}
            onLoadMore={hasMoreActivity ? handleLoadMoreActivity : undefined}
            hasMore={hasMoreActivity}
          />
        )}

        {/* Tab: Comments */}
        {activeTab === 'comments' && (
          <CommentSection
            entityType="project"
            entityId={projectId}
            comments={comments}
            onAddComment={handleAddComment}
            currentUserName={user?.name}
          />
        )}
      </div>

      {/* ─── Task Form Modal ─────────────────────────────── */}
      {showTaskForm && (
        <TaskForm
          open={showTaskForm}
          onClose={() => { setShowTaskForm(false); setTaskFormListId(null) }}
          onSubmit={handleAddTask}
          projectId={projectId}
          taskListId={taskFormListId}
          loading={saving}
        />
      )}

      {/* ─── Task Detail Modal ──────────────────────────── */}
      {selectedTask && (
        <TaskDetail
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}

      {/* ─── Milestone Form Modal ────────────────────────── */}
      {showMilestoneForm && (
        <MilestoneForm
          open={showMilestoneForm}
          onClose={() => { setShowMilestoneForm(false); setEditingMilestone(null) }}
          onSubmit={editingMilestone
            ? (data) => handleUpdateMilestone(editingMilestone.id, data)
            : handleAddMilestone
          }
          initialData={editingMilestone}
          projectId={projectId}
          loading={saving}
        />
      )}
    </DashboardLayout>
  )
}
