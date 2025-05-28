import { motion } from 'framer-motion'
import { isToday, isThisWeek, parseISO, isValid } from 'date-fns'

import ApperIcon from './ApperIcon'

const TaskStats = ({ tasks }) => {
  const getTaskStats = () => {
    const total = tasks.length
    const completed = tasks.filter(task => task.status === 'done').length
    const inProgress = tasks.filter(task => task.status === 'progress').length
    const today = new Date()
    
    // Deadline-specific calculations
    const overdue = tasks.filter(task => {
      if (!task.dueDate || task.status === 'done') return false
      const dueDate = parseISO(task.dueDate)
      return isValid(dueDate) && dueDate < today
    }).length
    
    const dueToday = tasks.filter(task => {
      if (!task.dueDate || task.status === 'done') return false
      const dueDate = parseISO(task.dueDate)
      return isValid(dueDate) && isToday(dueDate)
    }).length
    
    const dueThisWeek = tasks.filter(task => {
      if (!task.dueDate || task.status === 'done') return false
      const dueDate = parseISO(task.dueDate)
      return isValid(dueDate) && isThisWeek(dueDate) && !isToday(dueDate)
    }).length
    
    return { total, completed, inProgress, overdue, dueToday, dueThisWeek }
  }


  const stats = getTaskStats()

  const statItems = [
    { label: 'Total Tasks', value: stats.total, icon: 'List', color: 'blue' },
    { label: 'Completed', value: stats.completed, icon: 'CheckCircle', color: 'green' },
    { label: 'In Progress', value: stats.inProgress, icon: 'Clock', color: 'amber' },
    { label: 'Overdue', value: stats.overdue, icon: 'AlertTriangle', color: 'red' },
  ]

  const deadlineStats = [
    { label: 'Due Today', value: stats.dueToday, icon: 'Clock', color: 'amber' },
    { label: 'Due This Week', value: stats.dueThisWeek, icon: 'Calendar', color: 'blue' },
  ]


  return (
    <div className="space-y-6">
      {/* Main Task Statistics */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {statItems.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 rounded-xl p-4 sm:p-6 shadow-soft hover:shadow-card transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-xl flex items-center justify-center`}>
                <ApperIcon name={stat.icon} className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Deadline Dashboard */}
      {(stats.dueToday > 0 || stats.dueThisWeek > 0 || stats.overdue > 0) && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-slate-200 dark:border-slate-600 shadow-soft"
        >
          <div className="flex items-center space-x-2 mb-4">
            <ApperIcon name="Calendar" className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Deadline Overview</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Overdue Tasks */}
            {stats.overdue > 0 && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <ApperIcon name="AlertTriangle" className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">Overdue</p>
                    <p className="text-xl font-bold text-red-900 dark:text-red-100">{stats.overdue}</p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Due Today */}
            {stats.dueToday > 0 && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                    <ApperIcon name="Clock" className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Due Today</p>
                    <p className="text-xl font-bold text-amber-900 dark:text-amber-100">{stats.dueToday}</p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Due This Week */}
            {stats.dueThisWeek > 0 && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <ApperIcon name="Calendar" className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Due This Week</p>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{stats.dueThisWeek}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )

}

export default TaskStats