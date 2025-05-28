import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths, parseISO, isValid, isToday, isWithinInterval } from 'date-fns'


import Chart from 'react-apexcharts'
import ApperIcon from '../components/ApperIcon'
import { FolderOpen, CheckSquare, Calendar, BarChart3 } from 'lucide-react'

const Dashboard = () => {
  const [tasks, setTasks] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [projects, setProjects] = useState([])
  const [viewPeriod, setViewPeriod] = useState('week') // day, week, month
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Load data from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskflow-tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }

    const savedMembers = localStorage.getItem('taskflow-team-members')
    if (savedMembers) {
      setTeamMembers(JSON.parse(savedMembers))
    }

    const savedProjects = localStorage.getItem('taskflow-projects')
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
  }, [])

  // Get time period boundaries
  const getTimePeriod = () => {
    switch (viewPeriod) {
      case 'day':
        return {
          start: startOfDay(selectedDate),
          end: endOfDay(selectedDate),
          label: format(selectedDate, 'MMMM d, yyyy')
        }
      case 'week':
        return {
          start: startOfWeek(selectedDate),
          end: endOfWeek(selectedDate),
          label: `Week of ${format(startOfWeek(selectedDate), 'MMM d')} - ${format(endOfWeek(selectedDate), 'MMM d, yyyy')}`
        }
      case 'month':
        return {
          start: startOfMonth(selectedDate),
          end: endOfMonth(selectedDate),
          label: format(selectedDate, 'MMMM yyyy')
        }
      default:
        return {
          start: startOfWeek(selectedDate),
          end: endOfWeek(selectedDate),
          label: `Week of ${format(startOfWeek(selectedDate), 'MMM d')} - ${format(endOfWeek(selectedDate), 'MMM d, yyyy')}`
        }
    }
  }

  const timePeriod = getTimePeriod()

  // Filter tasks by time period
  const getFilteredTasks = () => {
    return tasks.filter(task => {
      if (!task.createdAt) return false
      const taskDate = parseISO(task.createdAt)
      return isValid(taskDate) && taskDate >= timePeriod.start && taskDate <= timePeriod.end
    })
  }

  const filteredTasks = getFilteredTasks()

  // Calculate dashboard statistics
  const getDashboardStats = () => {
    const total = filteredTasks.length
    const todo = filteredTasks.filter(task => task.status === 'todo').length
    const inProgress = filteredTasks.filter(task => task.status === 'progress').length
    const review = filteredTasks.filter(task => task.status === 'review').length
    const done = filteredTasks.filter(task => task.status === 'done').length
    
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0
    
    // Priority distribution
    const highPriority = filteredTasks.filter(task => task.priority === 'high').length
    const mediumPriority = filteredTasks.filter(task => task.priority === 'medium').length
    const lowPriority = filteredTasks.filter(task => task.priority === 'low').length
    
    // Overdue tasks
    const today = new Date()
    const overdue = filteredTasks.filter(task => {
      if (!task.dueDate || task.status === 'done') return false
      const dueDate = parseISO(task.dueDate)
      return isValid(dueDate) && dueDate < today
    }).length
    
    return {
      total,
      todo,
      inProgress,
      review,
      done,
      completionRate,
      highPriority,
      mediumPriority,
      lowPriority,
      overdue
    }
  }

  const stats = getDashboardStats()

  // Chart configurations
  const statusChartOptions = {
    chart: {
      type: 'donut',
      height: 300
    },
    labels: ['To Do', 'In Progress', 'Review', 'Done'],
    colors: ['#64748b', '#3b82f6', '#f59e0b', '#10b981'],
    legend: {
      position: 'bottom'
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  }

  const statusChartSeries = [stats.todo, stats.inProgress, stats.review, stats.done]

  const priorityChartOptions = {
    chart: {
      type: 'bar',
      height: 300
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      },
    },
    xaxis: {
      categories: ['High', 'Medium', 'Low']
    },
    colors: ['#ef4444', '#f59e0b', '#10b981'],
    title: {
      text: 'Priority Distribution'
    }
  }

  const priorityChartSeries = [{
    name: 'Tasks',
    data: [stats.highPriority, stats.mediumPriority, stats.lowPriority]
  }]

  // Navigation functions
  const navigatePeriod = (direction) => {
    let newDate
    switch (viewPeriod) {
      case 'day':
        newDate = direction === 'prev' ? subDays(selectedDate, 1) : subDays(selectedDate, -1)
        break
      case 'week':
        newDate = direction === 'prev' ? subWeeks(selectedDate, 1) : subWeeks(selectedDate, -1)
        break
      case 'month':
        newDate = direction === 'prev' ? subMonths(selectedDate, 1) : subMonths(selectedDate, -1)
        break
      default:
        newDate = selectedDate
    }
    setSelectedDate(newDate)
    toast.success(`Switched to ${direction === 'prev' ? 'previous' : 'next'} ${viewPeriod}`)
  }

  const handlePeriodChange = (period) => {
    setViewPeriod(period)
    toast.success(`Switched to ${period}ly view`)
  }

  // Recent activity
  const getRecentActivity = () => {
    return filteredTasks
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5)
  }


  // Get today's tasks based on due date
  const getTodaysTasks = () => {
    const today = new Date()
    return tasks.filter(task => {
      if (!task.dueDate) return false
      const dueDate = parseISO(task.dueDate)
      return isValid(dueDate) && isToday(dueDate)
    })
  }

  const todaysTasks = getTodaysTasks()

  // Handle task status update from today's tasks
  const handleTodayTaskStatusUpdate = (taskId, newStatus) => {
    // Update localStorage tasks directly since we don't have the setter here
    const savedTasks = localStorage.getItem('taskflow-tasks')
    if (savedTasks) {
      const allTasks = JSON.parse(savedTasks)
      const updatedTasks = allTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
          : task
      )
      localStorage.setItem('taskflow-tasks', JSON.stringify(updatedTasks))
      setTasks(updatedTasks)
      toast.success(`Task status updated to ${newStatus}!`)
    }
  }

  // Get this week's tasks based on due date
  const getThisWeeksTasks = () => {
    const weekStart = startOfWeek(new Date())
    const weekEnd = endOfWeek(new Date())
    return tasks.filter(task => {
      if (!task.dueDate) return false
      const dueDate = parseISO(task.dueDate)
      return isValid(dueDate) && isWithinInterval(dueDate, { start: weekStart, end: weekEnd })
    })
  }

  const thisWeeksTasks = getThisWeeksTasks()


  const recentTasks = getRecentActivity()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-white/20 dark:border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-light rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                TaskFlow
              </h1>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-6">
              <Link
                to="/"
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-all duration-200"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Tasks</span>
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20 rounded-lg font-medium transition-all duration-200"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/projects"
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-all duration-200"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Projects</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {timePeriod.label}
                </p>
              </div>
              
              {/* Period Controls */}
              <div className="flex items-center space-x-4">
                {/* View Period Selector */}
                <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  {['day', 'week', 'month'].map((period) => (
                    <motion.button
                      key={period}
                      onClick={() => handlePeriodChange(period)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 text-sm font-medium capitalize transition-all duration-200 ${
                        viewPeriod === period
                          ? 'bg-primary text-white rounded-lg'
                          : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light'
                      }`}
                    >
                      {period}ly
                    </motion.button>
                  ))}
                </div>
                
                {/* Navigation Controls */}
                <div className="flex items-center space-x-2">
                  <motion.button
                    onClick={() => navigatePeriod('prev')}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
                  >
                    <ApperIcon name="ChevronLeft" className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    onClick={() => navigatePeriod('next')}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
                  >
                    <ApperIcon name="ChevronRight" className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Statistics Overview */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* Total Tasks */}
            <div className="dashboard-stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Tasks</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <ApperIcon name="List" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="dashboard-stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Completion Rate</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.completionRate}%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <ApperIcon name="TrendingUp" className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            {/* In Progress */}
            <div className="dashboard-stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.inProgress}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <ApperIcon name="Clock" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            {/* Overdue */}
            <div className="dashboard-stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Overdue</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.overdue}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <ApperIcon name="AlertTriangle" className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Today's Tasks Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-8"
          >
            <div className="dashboard-activity-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Today's Tasks
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {format(new Date(), 'EEEE, MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/"
                    className="text-primary dark:text-primary-light hover:underline text-sm font-medium"
                  >
                    View All Tasks
                  </Link>
                </div>
                
                {todaysTasks.length > 0 ? (
                  <div className="space-y-3">
                    {todaysTasks.map((task) => (
                      <motion.div 
                        key={task.id} 
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full bg-${
                            task.priority === 'high' ? 'red' : 
                            task.priority === 'medium' ? 'amber' : 'green'
                          }-500`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {task.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`status-badge status-${task.status} text-xs`}>
                                {task.status === 'todo' ? 'To Do' : 
                                 task.status === 'progress' ? 'In Progress' : 
                                 task.status === 'review' ? 'Review' : 'Done'}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                Due: {format(parseISO(task.dueDate), 'h:mm a')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Quick status update buttons */}
                          <motion.button
                            onClick={() => handleTodayTaskStatusUpdate(task.id, task.status === 'todo' ? 'progress' : task.status === 'progress' ? 'done' : 'todo')}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary-light transition-colors duration-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                            title={task.status === 'todo' ? 'Start Task' : task.status === 'progress' ? 'Complete Task' : 'Reset Task'}
                          >
                            <ApperIcon 
                              name={task.status === 'todo' ? 'Play' : task.status === 'progress' ? 'CheckCircle' : 'RotateCcw'} 
                              className="w-4 h-4" 
                            />
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              toast.info(`Opening task: ${task.title}`)
                              // This would typically navigate to task details
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary-light transition-colors duration-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                            title="View Task Details"
                          >
                            <ApperIcon name="Eye" className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 opacity-50" />
                    </div>
                    <h4 className="text-lg font-medium mb-2">No tasks due today</h4>
                    <p className="text-sm">You're all caught up for today! 🎉</p>
                    <Link
                      to="/"
                      className="inline-flex items-center space-x-2 mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200 text-sm font-medium"
                    >
                      <ApperIcon name="Plus" className="w-4 h-4" />
                      <span>Add New Task</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* This Week's Tasks Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="dashboard-activity-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary dark:text-primary-light" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        This Week's Tasks
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {format(startOfWeek(new Date()), 'MMM d')} - {format(endOfWeek(new Date()), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/"
                    className="text-primary dark:text-primary-light hover:underline text-sm font-medium"
                  >
                    View All Tasks
                  </Link>
                </div>
                
                {thisWeeksTasks.length > 0 ? (
                  <div className="space-y-3">
                    {thisWeeksTasks.map((task) => (
                      <motion.div 
                        key={task.id} 
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full bg-${
                            task.priority === 'high' ? 'red' : 
                            task.priority === 'medium' ? 'amber' : 'green'
                          }-500`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {task.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`status-badge status-${task.status} text-xs`}>
                                {task.status === 'todo' ? 'To Do' : 
                                 task.status === 'progress' ? 'In Progress' : 
                                 task.status === 'review' ? 'Review' : 'Done'}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                Due: {format(parseISO(task.dueDate), 'EEE, MMM d')}
                                {isToday(parseISO(task.dueDate)) && (
                                  <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                    Today
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Quick status update buttons */}
                          <motion.button
                            onClick={() => handleTodayTaskStatusUpdate(task.id, task.status === 'todo' ? 'progress' : task.status === 'progress' ? 'done' : 'todo')}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary-light transition-colors duration-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                            title={task.status === 'todo' ? 'Start Task' : task.status === 'progress' ? 'Complete Task' : 'Reset Task'}
                          >
                            <ApperIcon 
                              name={task.status === 'todo' ? 'Play' : task.status === 'progress' ? 'CheckCircle' : 'RotateCcw'} 
                              className="w-4 h-4" 
                            />
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              toast.info(`Opening task: ${task.title}`)
                              // This would typically navigate to task details
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary-light transition-colors duration-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                            title="View Task Details"
                          >
                            <ApperIcon name="Eye" className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 opacity-50" />
                    </div>
                    <h4 className="text-lg font-medium mb-2">No tasks due this week</h4>
                    <p className="text-sm">Plan ahead and add some tasks for the week! 📅</p>
                    <Link
                      to="/"
                      className="inline-flex items-center space-x-2 mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200 text-sm font-medium"
                    >
                      <ApperIcon name="Plus" className="w-4 h-4" />
                      <span>Add New Task</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>



          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Status Distribution Chart */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="dashboard-chart-card"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Task Status Distribution
                </h3>
                {stats.total > 0 ? (
                  <Chart
                    options={statusChartOptions}
                    series={statusChartSeries}
                    type="donut"
                    height={300}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
                    <div className="text-center">
                      <ApperIcon name="BarChart3" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No tasks in this period</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Priority Distribution Chart */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="dashboard-chart-card"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Priority Distribution
                </h3>
                {stats.total > 0 ? (
                  <Chart
                    options={priorityChartOptions}
                    series={priorityChartSeries}
                    type="bar"
                    height={300}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
                    <div className="text-center">
                      <ApperIcon name="BarChart" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No tasks in this period</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Status Category Cards */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* To Do */}
            <div className="dashboard-category-card border-l-4 border-slate-500">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">To Do</h3>
                  <span className="status-badge status-todo">{stats.todo}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-slate-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: stats.total > 0 ? `${(stats.todo / stats.total) * 100}%` : '0%' }}
                  ></div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {stats.total > 0 ? Math.round((stats.todo / stats.total) * 100) : 0}% of total
                </p>
              </div>
            </div>

            {/* In Progress */}
            <div className="dashboard-category-card border-l-4 border-blue-500">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">In Progress</h3>
                  <span className="status-badge status-progress">{stats.inProgress}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: stats.total > 0 ? `${(stats.inProgress / stats.total) * 100}%` : '0%' }}
                  ></div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}% of total
                </p>
              </div>
            </div>

            {/* Review */}
            <div className="dashboard-category-card border-l-4 border-amber-500">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Review</h3>
                  <span className="status-badge status-review">{stats.review}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: stats.total > 0 ? `${(stats.review / stats.total) * 100}%` : '0%' }}
                  ></div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {stats.total > 0 ? Math.round((stats.review / stats.total) * 100) : 0}% of total
                </p>
              </div>
            </div>

            {/* Done */}
            <div className="dashboard-category-card border-l-4 border-green-500">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Done</h3>
                  <span className="status-badge status-done">{stats.done}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: stats.total > 0 ? `${(stats.done / stats.total) * 100}%` : '0%' }}
                  ></div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}% of total
                </p>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="dashboard-activity-card"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Recent Activity
                </h3>
                <Link
                  to="/"
                  className="text-primary dark:text-primary-light hover:underline text-sm font-medium"
                >
                  View All Tasks
                </Link>
              </div>
              
              {recentTasks.length > 0 ? (
                <div className="space-y-4">
                  {recentTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full bg-${task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'amber' : 'green'}-500`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {format(parseISO(task.updatedAt || task.createdAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <span className={`status-badge status-${task.status} text-xs`}>
                        {task.status === 'todo' ? 'To Do' : task.status === 'progress' ? 'In Progress' : task.status === 'review' ? 'Review' : 'Done'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <ApperIcon name="Activity" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No recent activity in this period</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard