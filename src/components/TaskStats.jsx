import { motion } from 'framer-motion'
import ApperIcon from './ApperIcon'

const TaskStats = ({ tasks }) => {
  const getTaskStats = () => {
    const total = tasks.length
    const completed = tasks.filter(task => task.status === 'done').length
    const inProgress = tasks.filter(task => task.status === 'progress').length
    const overdue = tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
    ).length
    
    return { total, completed, inProgress, overdue }
  }

  const stats = getTaskStats()

  const statItems = [
    { label: 'Total Tasks', value: stats.total, icon: 'List', color: 'blue' },
    { label: 'Completed', value: stats.completed, icon: 'CheckCircle', color: 'green' },
    { label: 'In Progress', value: stats.inProgress, icon: 'Clock', color: 'amber' },
    { label: 'Overdue', value: stats.overdue, icon: 'AlertCircle', color: 'red' }
  ]

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
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
  )
}

export default TaskStats