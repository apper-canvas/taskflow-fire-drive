import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FolderOpen, CheckSquare, Calendar, BarChart3 } from 'lucide-react'
import MainFeature from '../components/MainFeature'

const Home = () => {
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
                className="flex items-center space-x-2 px-4 py-2 text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20 rounded-lg font-medium transition-all duration-200"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Tasks</span>
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
        <MainFeature />
      </main>
    </div>
  )
}

export default Home