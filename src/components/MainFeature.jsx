import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import TaskStats from './TaskStats'
import TaskControls from './TaskControls'
import TaskCard from './TaskCard'
import TaskForm from './TaskForm'
import KanbanBoard from './KanbanBoard'

const MainFeature = () => {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedProject, setSelectedProject] = useState('all')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    category: 'work',
    projectId: '',
    subtasks: []
  })
  // Load tasks from localStorage on mount
  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskflow-tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('taskflow-projects')
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
  }, [])

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    localStorage.setItem('taskflow-projects', JSON.stringify(projects))
  }, [projects])


  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('taskflow-tasks', JSON.stringify(tasks))
  }, [tasks])

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      dueDate: '',
      category: 'work',
      projectId: '',
      subtasks: []
    })
    setEditingTask(null)
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Task title is required!')
      return
    }

    if (editingTask) {
      // Update existing task
      setTasks(tasks.map(task => 
        task.id === editingTask.id 
          ? { ...task, ...formData, updatedAt: new Date().toISOString() }
          : task
      ))
      toast.success('Task updated successfully!')
    } else {
      // Create new task
      const newTask = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setTasks([newTask, ...tasks])
      toast.success('Task created successfully!')
    }

    resetForm()
    setShowCreateForm(false)
  }

  const handleEdit = (task) => {
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      category: task.category,
      projectId: task.projectId || '',
      subtasks: task.subtasks || []
    })
    setEditingTask(task)
    setShowCreateForm(true)
  }
  const handleDelete = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId))
    toast.success('Task deleted successfully!')
  }

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
        : task
    ))
    toast.success(`Task status updated to ${newStatus}!`)
  }

  const handleTaskMove = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
        : task
    ))
  }

  const handleSubtaskToggle = (taskId, subtaskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedSubtasks = task.subtasks.map(subtask => 
          subtask.id === subtaskId 
            ? { ...subtask, completed: !subtask.completed }
            : subtask
        )
        return { ...task, subtasks: updatedSubtasks, updatedAt: new Date().toISOString() }
      }
      return task
    }))
    toast.success('Subtask updated!')
  }


  const filteredAndSortedTasks = tasks
    .filter(task => {
      const matchesFilter = filter === 'all' || task.status === filter
      const matchesProject = selectedProject === 'all' || task.projectId === selectedProject
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesFilter && matchesProject && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      }
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

  const statusOptions = [
    { value: 'todo', label: 'To Do', icon: 'Circle', color: 'slate' },
    { value: 'progress', label: 'In Progress', icon: 'Clock', color: 'blue' },
    { value: 'review', label: 'Review', icon: 'Eye', color: 'amber' },
    { value: 'done', label: 'Done', icon: 'CheckCircle', color: 'green' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'amber' },
    { value: 'high', label: 'High', color: 'red' }
  ]

  const categoryOptions = [
    { value: 'work', label: 'Work', icon: 'Briefcase' },
    { value: 'personal', label: 'Personal', icon: 'User' },
    { value: 'shopping', label: 'Shopping', icon: 'ShoppingCart' },
    { value: 'health', label: 'Health', icon: 'Heart' },
    { value: 'learning', label: 'Learning', icon: 'BookOpen' }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Stats Dashboard */}
      <TaskStats tasks={tasks} />

      {/* Controls */}
      <TaskControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filter={filter}
        setFilter={setFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onNewTask={() => setShowCreateForm(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        statusOptions={statusOptions}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        projects={projects}
      />


      {/* Task Views */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={filteredAndSortedTasks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onTaskMove={handleTaskMove}
          statusOptions={statusOptions}
          priorityOptions={priorityOptions}
          categoryOptions={categoryOptions}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <AnimatePresence>
            {filteredAndSortedTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onSubtaskToggle={handleSubtaskToggle}
                statusOptions={statusOptions}
                priorityOptions={priorityOptions}
                categoryOptions={categoryOptions}
              />
            ))}
          </AnimatePresence>


          {filteredAndSortedTasks.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                {searchTerm || filter !== 'all' ? 'No tasks match your criteria' : 'No tasks yet'}
              </h3>
              <p className="text-slate-500 dark:text-slate-500">
                {searchTerm || filter !== 'all' ? 'Try adjusting your filters' : 'Create your first task to get started'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Task Modal */}


      {/* Create/Edit Task Modal */}
      <AnimatePresence>
        <TaskForm
          showForm={showCreateForm}
          editingTask={editingTask}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowCreateForm(false)
            resetForm()
          }}
          statusOptions={statusOptions}
          priorityOptions={priorityOptions}
          categoryOptions={categoryOptions}
          projects={projects}
        />
      </AnimatePresence>
    </div>
  )
}

export default MainFeature