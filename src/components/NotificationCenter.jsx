import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, isToday, isTomorrow, parseISO, isPast } from 'date-fns'
import ApperIcon from './ApperIcon'

const NotificationCenter = ({ tasks = [], teamMembers = [] }) => {
  const [notifications, setNotifications] = useState([])
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const [showPanel, setShowPanel] = useState(false)
  const [lastCheck, setLastCheck] = useState(Date.now())

  // Load notifications from localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem('taskflow-notifications')
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications)
        setNotifications(parsed)
      } catch (error) {
        console.error('Error loading notifications:', error)
        setNotifications([])
      }
    }
  }, [])

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('taskflow-notifications', JSON.stringify(notifications))
  }, [notifications])

  // Check for due date reminders and assignment notifications
  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date()
      const newNotifications = []

      tasks.forEach(task => {
        if (!task.dueDate) return

        const dueDate = parseISO(task.dueDate)
        const notificationId = `due-${task.id}-${task.dueDate}`
        
        // Check if we already have this notification
        const existingNotification = notifications.find(n => n.id === notificationId)
        if (existingNotification) return

        // Overdue tasks
        if (isPast(dueDate) && !isToday(dueDate) && task.status !== 'done') {
          const assignee = teamMembers.find(m => m.id === task.assigneeId)
          newNotifications.push({
            id: notificationId,
            type: 'overdue',
            title: 'Overdue Task',
            message: `"${task.title}" was due ${format(dueDate, 'MMM d, yyyy')}`,
            taskId: task.id,
            taskTitle: task.title,
            assignee: assignee?.name || 'Unassigned',
            timestamp: now.toISOString(),
            isRead: false,
            priority: 'high'
          })
        }
        // Tasks due today
        else if (isToday(dueDate) && task.status !== 'done') {
          const assignee = teamMembers.find(m => m.id === task.assigneeId)
          newNotifications.push({
            id: notificationId,
            type: 'due_today',
            title: 'Task Due Today',
            message: `"${task.title}" is due today`,
            taskId: task.id,
            taskTitle: task.title,
            assignee: assignee?.name || 'Unassigned',
            timestamp: now.toISOString(),
            isRead: false,
            priority: 'medium'
          })
        }
        // Tasks due tomorrow
        else if (isTomorrow(dueDate) && task.status !== 'done') {
          const assignee = teamMembers.find(m => m.id === task.assigneeId)
          newNotifications.push({
            id: notificationId,
            type: 'due_tomorrow',
            title: 'Task Due Tomorrow',
            message: `"${task.title}" is due tomorrow`,
            taskId: task.id,
            taskTitle: task.title,
            assignee: assignee?.name || 'Unassigned',
            timestamp: now.toISOString(),
            isRead: false,
            priority: 'low'
          })
        }
      })

      // Check for assignment notifications (tasks updated in the last 5 minutes)
      tasks.forEach(task => {
        if (!task.assigneeId || !task.updatedAt) return

        const updatedAt = new Date(task.updatedAt)
        const timeDiff = now - updatedAt
        const fiveMinutesAgo = 5 * 60 * 1000

        if (timeDiff <= fiveMinutesAgo && updatedAt > new Date(lastCheck)) {
          const assignee = teamMembers.find(m => m.id === task.assigneeId)
          const notificationId = `assignment-${task.id}-${task.updatedAt}`
          
          // Check if we already have this notification
          const existingNotification = notifications.find(n => n.id === notificationId)
          if (existingNotification) return

          if (assignee) {
            newNotifications.push({
              id: notificationId,
              type: 'assignment',
              title: 'Task Assigned',
              message: `"${task.title}" has been assigned to ${assignee.name}`,
              taskId: task.id,
              taskTitle: task.title,
              assignee: assignee.name,
              timestamp: now.toISOString(),
              isRead: false,
              priority: 'medium'
            })
          }
        }
      })

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev])
        
        // Show toast notifications for high priority items
        newNotifications.forEach(notification => {
          if (notification.priority === 'high') {
            toast.error(notification.message, {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true
            })
          } else if (notification.priority === 'medium') {
            toast.warning(notification.message, {
              position: 'top-right',
              autoClose: 4000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true
            })
          }
        })
      }

      setLastCheck(Date.now())
    }

    // Initial check
    checkNotifications()

    // Set up interval to check every 30 seconds
    const interval = setInterval(checkNotifications, 30000)

    return () => clearInterval(interval)
  }, [tasks, teamMembers, notifications, lastCheck])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    )
  }

  const removeNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    )
  }

  const clearAllNotifications = () => {
  const clearAllNotifications = () => {
    setNotifications([])
    toast.success('All notifications cleared')
  }

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification)
    setShowDetailsModal(true)
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
  }

  const handleMarkAsUnread = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: false } : n
      )
    )
    toast.success('Notification marked as unread')
  }

  const handleDeleteFromModal = (notificationId) => {
    removeNotification(notificationId)
    setShowDetailsModal(false)
    setSelectedNotification(null)
    toast.success('Notification deleted')
  }

  const handleViewTask = (taskId) => {
    // This would typically navigate to the task details page
    // For now, we'll show a toast message
    toast.info(`Navigate to task: ${taskId}`)
    setShowDetailsModal(false)
    setSelectedNotification(null)
  }

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
      case 'in-progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'review': return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
      case 'done': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
    }
  }


  const getNotificationIcon = (type) => {
    switch (type) {
      case 'overdue':
        return 'AlertTriangle'
      case 'due_today':
        return 'Clock'
      case 'due_tomorrow':
        return 'Calendar'
      case 'assignment':
        return 'UserCheck'
      default:
        return 'Bell'
    }
  }

  const getNotificationColor = (type, priority) => {
    if (type === 'overdue') return 'text-red-600 dark:text-red-400'
    if (type === 'due_today') return 'text-amber-600 dark:text-amber-400'
    if (type === 'assignment') return 'text-blue-600 dark:text-blue-400'
    return 'text-slate-600 dark:text-slate-400'
  }

  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return format(date, 'MMM d')
  }

  return (
    <div className="notification-center relative">
      {/* Notification Bell */}
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="notification-bell relative p-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light transition-colors duration-200"
      >
        <ApperIcon name="Bell" className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="notification-badge absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {showPanel && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowPanel(false)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="notification-panel absolute right-0 top-12 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden"
            >
              {/* Panel Header */}
              <div className="notification-panel-header p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Notifications
                  </h3>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <motion.button
                        onClick={markAllAsRead}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-xs text-primary hover:text-primary-dark transition-colors duration-200"
                      >
                        Mark all read
                      </motion.button>
                    )}
                    {notifications.length > 0 && (
                      <motion.button
                        onClick={clearAllNotifications}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors duration-200"
                      >
                        Clear all
                      </motion.button>
                    )}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Notifications List */}
              <div className="notification-list max-h-80 overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="notification-empty p-8 text-center">
                    <ApperIcon name="Bell" className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No notifications yet
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      You'll be notified about due dates and task assignments
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`notification-item p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200 border-l-4 ${
                          notification.isRead ? 'border-l-transparent' : 
                          notification.priority === 'high' ? 'border-l-red-500' :
                          notification.priority === 'medium' ? 'border-l-amber-500' :
                          'border-l-blue-500'
                        } ${
                          !notification.isRead ? 'bg-primary/5 dark:bg-primary/10' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}

                      >
                        <div className="flex items-start space-x-3">
                          <div className={`notification-icon mt-0.5 ${getNotificationColor(notification.type, notification.priority)}`}>
                            <ApperIcon name={getNotificationIcon(notification.type)} className="w-4 h-4" />
                          </div>
                          <div className="notification-content flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`notification-title text-sm font-medium ${
                                notification.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'
                              }`}>
                                {notification.title}
                              </h4>
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeNotification(notification.id)
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="notification-close p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all duration-200"
                              >
                                <ApperIcon name="X" className="w-3 h-3" />
                              </motion.button>
                            </div>
                            <p className={`notification-message text-xs mb-2 ${
                              notification.isRead ? 'text-slate-500 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'
                            }`}>
                              {notification.message}
                            </p>
                            <div className="notification-meta flex items-center justify-between">
                              <span className="notification-assignee text-xs text-slate-400 dark:text-slate-500">
                                {notification.assignee}
                              </span>
                              <span className="notification-time text-xs text-slate-400 dark:text-slate-500">
                                {formatNotificationTime(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notification Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedNotification && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDetailsModal(false)}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md mx-4"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getNotificationColor(selectedNotification.type, selectedNotification.priority)} bg-opacity-20`}>
                    <ApperIcon name={getNotificationIcon(selectedNotification.type)} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {selectedNotification.title}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedNotification.priority)}`}>
                      {selectedNotification.priority} priority
                    </span>
                  </div>
                </div>
                <motion.button
                  onClick={() => setShowDetailsModal(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Notification Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Message
                  </label>
                  <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                    {selectedNotification.message}
                  </p>
                </div>

                {/* Task Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Task
                    </label>
                    <p className="text-sm text-slate-900 dark:text-white font-medium">
                      {selectedNotification.taskTitle}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Assignee
                    </label>
                    <p className="text-sm text-slate-900 dark:text-white">
                      {selectedNotification.assignee}
                    </p>
                  </div>
                </div>

                {/* Timestamp */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Notification Time
                  </label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {new Date(selectedNotification.timestamp).toLocaleString()}
                  </p>
                </div>

                {/* Due Date (if applicable) */}
                {(selectedNotification.type === 'overdue' || selectedNotification.type === 'due_today' || selectedNotification.type === 'due_tomorrow') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Due Date
                    </label>
                    <p className={`text-sm font-medium ${
                      selectedNotification.type === 'overdue' ? 'text-red-600 dark:text-red-400' :
                      selectedNotification.type === 'due_today' ? 'text-amber-600 dark:text-amber-400' :
                      'text-blue-600 dark:text-blue-400'
                    }`}>
                      {selectedNotification.type === 'overdue' && 'Overdue: '}
                      {selectedNotification.type === 'due_today' && 'Due Today: '}
                      {selectedNotification.type === 'due_tomorrow' && 'Due Tomorrow: '}
                      {format(new Date(selectedNotification.timestamp), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}

                {/* Read Status */}
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Status
                  </label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    selectedNotification.isRead 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  }`}>
                    {selectedNotification.isRead ? 'Read' : 'Unread'}
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => handleViewTask(selectedNotification.taskId)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                  >
                    <ApperIcon name="Eye" className="w-4 h-4 mr-1" />
                    View Task
                  </motion.button>
                  
                  {selectedNotification.isRead ? (
                    <motion.button
                      onClick={() => handleMarkAsUnread(selectedNotification.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      <ApperIcon name="Mail" className="w-4 h-4 mr-1" />
                      Mark Unread
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => markAsRead(selectedNotification.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      <ApperIcon name="MailOpen" className="w-4 h-4 mr-1" />
                      Mark Read
                    </motion.button>
                  )}
                </div>
                
                <motion.button
                  onClick={() => handleDeleteFromModal(selectedNotification.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <ApperIcon name="Trash2" className="w-4 h-4 mr-1" />
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default NotificationCenter