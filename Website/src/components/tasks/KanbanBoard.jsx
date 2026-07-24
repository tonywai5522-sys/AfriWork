import { useState } from 'react'
import TaskCard from './TaskCard.jsx'

const COLUMN_COLORS = {
  backlog: 'bg-amber-100 border-amber-300',
  todo: 'bg-blue-100 border-blue-300',
  in_progress: 'bg-emerald-100 border-emerald-300',
  review: 'bg-purple-100 border-purple-300',
  done: 'bg-slate-100 border-slate-300',
}

const COLUMN_HEADER_COLORS = {
  backlog: 'bg-amber-400',
  todo: 'bg-blue-400',
  in_progress: 'bg-emerald-400',
  review: 'bg-purple-400',
  done: 'bg-slate-400',
}

export default function KanbanBoard({ projectId, taskLists, tasks, onTaskMove, onTaskClick, onAddTask }) {
  const [dragOverListId, setDragOverListId] = useState(null)

  const handleDragStart = (e, taskId, sourceListId) => {
    e.dataTransfer.setData('taskId', taskId)
    e.dataTransfer.setData('sourceListId', sourceListId)
  }

  const handleDragOver = (e, listId) => {
    e.preventDefault()
    setDragOverListId(listId)
  }

  const handleDragLeave = () => {
    setDragOverListId(null)
  }

  const handleDrop = (e, targetListId) => {
    e.preventDefault()
    setDragOverListId(null)
    const taskId = e.dataTransfer.getData('taskId')
    const sourceListId = e.dataTransfer.getData('sourceListId')
    if (sourceListId !== targetListId && onTaskMove) {
      onTaskMove(taskId, sourceListId, targetListId)
    }
  }

  if (!taskLists || taskLists.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl border-2 border-slate-900 bg-slate-50 p-10">
        <p className="text-sm font-medium text-slate-500">No task lists yet.</p>
      </div>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {taskLists.map((list) => {
        const listTasks = tasks[list.id] || []
        const colColor = COLUMN_COLORS[list.slug] || COLUMN_COLORS.todo
        const headerColor = COLUMN_HEADER_COLORS[list.slug] || COLUMN_HEADER_COLORS.todo

        return (
          <div
            key={list.id}
            className={`flex min-w-[280px] max-w-[320px] flex-1 flex-col rounded-2xl border-2 border-slate-900 transition-all ${
              dragOverListId === list.id ? 'shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]' : 'shadow-none'
            }`}
            onDragOver={(e) => handleDragOver(e, list.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, list.id)}
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between rounded-t-xl border-b-2 border-slate-900 px-4 py-3 ${headerColor}`}>
              <h3 className="text-sm font-bold text-slate-900">{list.name}</h3>
              <span className="flex h-6 w-6 items-center justify-center rounded-lg border-2 border-slate-900 bg-white text-[11px] font-bold">
                {listTasks.length}
              </span>
            </div>

            {/* Task List */}
            <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
              {listTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id, list.id)}
                  onClick={() => onTaskClick && onTaskClick(task)}
                >
                  <TaskCard task={task} onClick={() => onTaskClick && onTaskClick(task)} />
                </div>
              ))}
              {listTasks.length === 0 && (
                <div className="flex items-center justify-center py-8 text-[11px] text-slate-400">
                  No tasks
                </div>
              )}
            </div>

            {/* Add Task Button */}
            <div className="border-t-2 border-slate-900 px-3 py-2">
              <button
                onClick={() => onAddTask && onAddTask(list.id)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-slate-400 py-2 text-[11px] font-bold text-slate-500 hover:border-slate-900 hover:text-slate-900"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add task
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}