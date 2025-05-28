import { useState } from 'react'

import { motion } from 'framer-motion'
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns'
import ApperIcon from './ApperIcon'

const TaskCard = ({ task, onEdit, onDelete, onStatusChange, onSubtaskToggle, statusOptions, priorityOptions, categoryOptions, isDragging = false }) => {
  const [showSubtasks, setShowSubtasks] = useState(false)

  const formatDueDate = (dateString) => {
    if (!dateString) return 'No due date'
    
    const date = parseISO(dateString)
    
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isYesterday(date)) return 'Yesterday'
    
    return format(date, 'MMM d, yyyy')
  }

  const getDueDateStatus = (dateString) => {
    if (!dateString) return 'none'
    
    const date = parseISO(dateString)
    const today = new Date()
    
    if (date < today && !isToday(date)) return 'overdue'
    if (isToday(date)) return 'today'
    if (isTomorrow(date)) return 'tomorrow'
    
    return 'future'
  }

  const dueDateStatus = getDueDateStatus(task.dueDate)

  const getSubtaskProgress = () => {
    if (!task.subtasks || task.subtasks.length === 0) return { completed: 0, total: 0, percentage: 0 }
    
    const completed = task.subtasks.filter(subtask => subtask.completed).length
    const total = task.subtasks.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    
    return { completed, total, percentage }
  }

  const subtaskProgress = getSubtaskProgress()



  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`task-card dark:task-card-dark priority-${task.priority} group cursor-pointer ${
        isDragging ? 'kanban-task dragging' : 'kanban-task'
      }`}
      onClick={() => onEdit(task)}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full bg-${priorityOptions.find(p => p.value === task.priority)?.color}-500`}></div>
          <span className={`status-badge status-${task.status}`}>
            {statusOptions.find(s => s.value === task.status)?.label}
          </span>
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(task)
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 text-slate-400 hover:text-primary transition-colors duration-200"
          >
            <ApperIcon name="Edit" className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id)
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 text-slate-400 hover:text-red-500 transition-colors duration-200"
          >
            <ApperIcon name="Trash2" className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Task Content */}
      <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">{task.title}</h3>
      {task.description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Task Meta */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-2">
          <ApperIcon name={categoryOptions.find(c => c.value === task.category)?.icon || 'Tag'} className="w-4 h-4" />
          <span className="capitalize">{task.category}</span>
        </div>
        <div className={`flex items-center space-x-1 ${
          dueDateStatus === 'overdue' ? 'text-red-600 dark:text-red-400' :
          dueDateStatus === 'today' ? 'text-amber-600 dark:text-amber-400' :
          dueDateStatus === 'tomorrow' ? 'text-blue-600 dark:text-blue-400' :
          'text-slate-500 dark:text-slate-400'
        }`}>
          <ApperIcon name="Calendar" className="w-4 h-4" />
          <span className="font-medium">{formatDueDate(task.dueDate)}</span>
          {dueDateStatus === 'overdue' && (
            <ApperIcon name="AlertTriangle" className="w-3 h-3 ml-1" />
          )}
        </div>

      </div>

      {/* Subtasks Section */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="subtask-section">
          <div 
            className="subtask-toggle"
            onClick={(e) => {
              e.stopPropagation()
              setShowSubtasks(!showSubtasks)
            }}
          >
            <div className="flex items-center space-x-2">
              <ApperIcon name="CheckSquare" className="w-4 h-4" />
              <span>Subtasks ({subtaskProgress.completed}/{subtaskProgress.total})</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="subtask-progress-text">{subtaskProgress.percentage}%</span>
              <ApperIcon 
                name={showSubtasks ? "ChevronUp" : "ChevronDown"} 
                className="w-4 h-4" 
              />
            </div>
          </div>
          
          <div className="mt-2">
            <div className="subtask-progress-bar">
              <div 
                className="subtask-progress-fill" 
                style={{ width: `${subtaskProgress.percentage}%` }}
              ></div>
            </div>
          </div>

          {showSubtasks && (
            <div className="subtask-list">
              {task.subtasks.map((subtask) => (
                <div key={subtask.id} className="subtask-item">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={(e) => {
                      e.stopPropagation()
                      onSubtaskToggle && onSubtaskToggle(task.id, subtask.id)
                    }}
                    className="subtask-checkbox"
                  />
                  <span className={`subtask-text ${subtask.completed ? 'completed' : ''}`}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}



      {/* Quick Status Update */}
      <div className="flex items-center space-x-1 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        {statusOptions.map(status => (
          <motion.button
            key={status.value}
            onClick={(e) => {
              e.stopPropagation()
              onStatusChange(task.id, status.value)
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-1 rounded-lg transition-all duration-200 ${
              task.status === status.value 
                ? `bg-${status.color}-100 text-${status.color}-600 dark:bg-${status.color}-900/30 dark:text-${status.color}-400` 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            title={status.label}
          >
            <ApperIcon name={status.icon} className="w-4 h-4" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

export default TaskCard