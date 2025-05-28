import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'
import CalendarPicker from './CalendarPicker'

import TaskComments from './TaskComments'

const TaskForm = ({ 
  showForm, 
  editingTask, 
  formData, 
  setFormData, 
  onSubmit, 
  onClose, 
  statusOptions, 
  priorityOptions, 
  categoryOptions 
}) => {
  const [teamMembers, setTeamMembers] = useState([])

  const [projects, setProjects] = useState([])
  const [subtaskInput, setSubtaskInput] = useState('')
  const [showSubtaskForm, setShowSubtaskForm] = useState(false)

  // Load projects from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('taskflow-projects')
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
    const savedMembers = localStorage.getItem('taskflow-team-members')
    if (savedMembers) {
      try {
        const members = JSON.parse(savedMembers)
        setTeamMembers(members)
      } catch (error) {
        console.error('Error parsing team members:', error)
        setTeamMembers([])
      }
    } else {
      setTeamMembers([])
    }

  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (date) => {
    setFormData(prev => ({ 
      ...prev, 
      dueDate: date ? date.toISOString().split('T')[0] : '' 
    }))
  }

  const addSubtask = () => {
    if (!subtaskInput.trim()) {
      toast.error('Please enter a subtask title')
      return
    }

    const newSubtask = {
      id: Date.now().toString(),
      title: subtaskInput.trim(),
      completed: false
    }

    setFormData(prev => ({
      ...prev,
      subtasks: [...(prev.subtasks || []), newSubtask]
    }))

    setSubtaskInput('')
    toast.success('Subtask added!')
  }

  const removeSubtask = (subtaskId) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(subtask => subtask.id !== subtaskId)
    }))
    toast.success('Subtask removed!')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(e)
  }

  if (!showForm) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
          >
            <ApperIcon name="X" className="w-6 h-6" />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              placeholder="Enter task description"
            />
          </div>

          {/* Project Assignment */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Project
            </label>
            <select
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
            >
              <option value="">No Project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          {/* Assignee Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Assign To
            </label>
            <select
              name="assigneeId"
              value={formData.assigneeId || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
            >
              <option value="">Unassigned</option>
              {teamMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Due Date
            </label>
            <CalendarPicker
              value={formData.dueDate ? new Date(formData.dueDate) : null}
              onChange={handleDateChange}
              placeholder="Select due date"
            />
          </div>

          {/* Subtasks Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Subtasks ({(formData.subtasks || []).length})
              </label>
              <motion.button
                type="button"
                onClick={() => setShowSubtaskForm(!showSubtaskForm)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-1 text-sm text-primary hover:text-primary-dark transition-colors duration-200"
              >
                <ApperIcon name="Plus" className="w-4 h-4" />
                <span>Add Subtask</span>
              </motion.button>
            </div>

            <AnimatePresence>
              {showSubtaskForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="subtask-form mb-4"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={subtaskInput}
                      onChange={(e) => setSubtaskInput(e.target.value)}
                      className="subtask-input flex-1"
                      placeholder="Enter subtask title"
                      onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
                    />
                    <motion.button
                      type="button"
                      onClick={addSubtask}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200"
                    >
                      Add
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Subtasks List */}
            {formData.subtasks && formData.subtasks.length > 0 && (
              <div className="subtask-list">
                {formData.subtasks.map((subtask) => (
                  <div key={subtask.id} className="subtask-item">
                    <span className="subtask-text">{subtask.title}</span>
                    <motion.button
                      type="button"
                      onClick={() => removeSubtask(subtask.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </motion.button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Comments Section - Only show when editing existing task */}
          {editingTask && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                <ApperIcon name="MessageCircle" className="w-5 h-5" />
                <span>Comments</span>
              </h3>
              <TaskComments
                taskId={editingTask.id}
                comments={formData.comments || []}
                onUpdateComments={(updatedComments) => {
                  setFormData(prev => ({ ...prev, comments: updatedComments }))
                }}
              />
            </div>
          )}



          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-300"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-gradient-to-r from-primary to-primary-light text-white font-medium rounded-xl shadow-soft hover:shadow-card transition-all duration-300"
            >
              {editingTask ? 'Update Task' : 'Create Task'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default TaskForm