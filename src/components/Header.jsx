import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ApperIcon from './ApperIcon'

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Load dark mode preference from localStorage
  useEffect(() => {
    const darkMode = localStorage.getItem('taskflow-dark-mode')
    if (darkMode === 'true') {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem('taskflow-dark-mode', newDarkMode.toString())
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
    { name: 'Tasks', path: '/tasks', icon: 'CheckSquare' },
    { name: 'Projects', path: '/projects', icon: 'Folder' }
  ]

  const isActiveRoute = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-light rounded-lg flex items-center justify-center">
              <ApperIcon name="CheckSquare" className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              TaskFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActiveRoute(item.path)
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ApperIcon name={item.icon} className="w-4 h-4" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-2">
            {/* Dark mode toggle */}
            <motion.button
              onClick={toggleDarkMode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <ApperIcon 
                name={isDarkMode ? 'Sun' : 'Moon'} 
                className="w-5 h-5" 
              />
            </motion.button>

            {/* Mobile menu button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <ApperIcon 
                name={isMobileMenuOpen ? 'X' : 'Menu'} 
                className="w-5 h-5" 
              />
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-slate-200 dark:border-slate-700 py-4"
            >
              <nav className="flex flex-col space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActiveRoute(item.path)
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <ApperIcon name={item.icon} className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

export default Header