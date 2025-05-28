import { motion } from 'framer-motion'
import ApperIcon from './ApperIcon'

const TaskControls = ({ 
  searchTerm, 
  setSearchTerm, 
  filter, 
  setFilter, 
  sortBy, 
  setSortBy, 
  onNewTask,
  viewMode,
  setViewMode,
  statusOptions 
}) => {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 rounded-xl p-4 sm:p-6 mb-8 shadow-soft"
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 sm:gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
            >
              <option value="all">All Status</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="created">Sort by Created</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
            <motion.button
              onClick={() => setViewMode('grid')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-slate-600 shadow-sm text-primary dark:text-primary-light' 
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <ApperIcon name="Grid3X3" className="w-4 h-4" />
              <span className="text-sm font-medium">Grid</span>
            </motion.button>
            <motion.button
              onClick={() => setViewMode('kanban')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                viewMode === 'kanban' 
                  ? 'bg-white dark:bg-slate-600 shadow-sm text-primary dark:text-primary-light' 
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <ApperIcon name="Columns" className="w-4 h-4" />
              <span className="text-sm font-medium">Kanban</span>
            </motion.button>
          </div>

          {/* Create Task Button */}
          <motion.button
            onClick={onNewTask}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white font-medium rounded-xl shadow-soft hover:shadow-card transition-all duration-300"
          >
            <ApperIcon name="Plus" className="w-5 h-5" />
            <span className="hidden sm:inline">New Task</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default TaskControls