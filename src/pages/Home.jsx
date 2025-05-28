import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'

import { FolderOpen, CheckSquare, BarChart3 } from 'lucide-react'

import { useState } from 'react'


import MainFeature from '../components/MainFeature'
import TeamMemberManager from '../components/TeamMemberManager'
import TaskComments from '../components/TaskComments'


const Home = () => {
  const [showTeamManager, setShowTeamManager] = useState(false)
  const [showTaskComments, setShowTaskComments] = useState(false)
  const [selectedTaskForComments, setSelectedTaskForComments] = useState(null)


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
            <motion.button
              onClick={() => setShowTeamManager(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2"
            >
              <ApperIcon name="Users" className="w-4 h-4" />
              <span>Team</span>
            </motion.button>

            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-6">
              <Link
                to="/"
                className="flex items-center space-x-2 px-4 py-2 text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20 rounded-lg font-medium transition-all duration-200"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Tasks</span>
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-all duration-200"
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

      {/* Team Member Manager Modal */}
      <TeamMemberManager 
        showManager={showTeamManager}
        onClose={() => setShowTeamManager(false)}
      />

      {/* Task Comments Modal */}
      {showTaskComments && selectedTaskForComments && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowTaskComments(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {selectedTaskForComments.title}
              </h2>
              <motion.button
                onClick={() => setShowTaskComments(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
              >
                <ApperIcon name="X" className="w-6 h-6" />
              </motion.button>
            </div>
            
            <TaskComments
              taskId={selectedTaskForComments.id}
              comments={selectedTaskForComments.comments || []}
              onUpdateComments={(updatedComments) => {
                // This would typically update the task in the main state
                // For now, we'll just update the selected task
                setSelectedTaskForComments({
                  ...selectedTaskForComments,
                  comments: updatedComments
                })
              }}
            />
          </motion.div>
        </motion.div>
      )}

        <MainFeature />
      </main>
    </div>
  )
}

export default Home