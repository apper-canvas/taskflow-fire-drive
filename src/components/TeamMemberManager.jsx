import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'

const TeamMemberManager = ({ showManager, onClose }) => {
  const [teamMembers, setTeamMembers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'member',
    avatar: ''
  })

  // Load team members from localStorage
  useEffect(() => {
    const savedMembers = localStorage.getItem('taskflow-team-members')
    if (savedMembers) {
      setTeamMembers(JSON.parse(savedMembers))
    }
  }, [])

  // Save team members to localStorage
  useEffect(() => {
    localStorage.setItem('taskflow-team-members', JSON.stringify(teamMembers))
  }, [teamMembers])

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'member',
      avatar: ''
    })
    setEditingMember(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required!')
      return
    }

    if (editingMember) {
      // Update existing member
      setTeamMembers(teamMembers.map(member => 
        member.id === editingMember.id 
          ? { ...member, ...formData, updatedAt: new Date().toISOString() }
          : member
      ))
      toast.success('Team member updated successfully!')
    } else {
      // Create new member
      const newMember = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setTeamMembers([newMember, ...teamMembers])
      toast.success('Team member added successfully!')
    }

    resetForm()
    setShowForm(false)
  }

  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      avatar: member.avatar || ''
    })
    setEditingMember(member)
    setShowForm(true)
  }

  const handleDelete = (memberId) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      setTeamMembers(teamMembers.filter(member => member.id !== memberId))
      toast.success('Team member removed successfully!')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const simulateAvatarUpload = () => {
    // Simulate avatar upload with a placeholder URL
    const avatarUrl = `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=100&h=100&fit=crop&crop=face`
    setFormData(prev => ({ ...prev, avatar: avatarUrl }))
    toast.success('Avatar uploaded!')
  }

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'member', label: 'Member' }
  ]

  if (!showManager) return null

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
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Team Members
          </h2>
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => setShowForm(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200 flex items-center space-x-2"
            >
              <ApperIcon name="UserPlus" className="w-4 h-4" />
              <span>Add Member</span>
            </motion.button>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
            >
              <ApperIcon name="X" className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Team Members List */}
        <div className="team-member-grid mb-6">
          <AnimatePresence>
            {teamMembers.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="team-member-item"
              >
                <div className="team-member-avatar placeholder">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="team-member-avatar" />
                  ) : (
                    member.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="team-member-info">
                  <div className="team-member-name">{member.name}</div>
                  <div className="team-member-role">{member.email}</div>
                  <span className={`role-badge role-${member.role}`}>
                    {member.role}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <motion.button
                    onClick={() => handleEdit(member)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 text-slate-400 hover:text-primary transition-colors duration-200"
                  >
                    <ApperIcon name="Edit" className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(member.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {teamMembers.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ApperIcon name="Users" className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                No team members yet
              </h3>
              <p className="text-slate-500 dark:text-slate-500">
                Add your first team member to get started
              </p>
            </div>
          )}
        </div>

        {/* Add/Edit Member Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="team-member-form border-t border-slate-200 dark:border-slate-700 pt-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Role
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    >
                      {roleOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Avatar */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Avatar
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="team-member-avatar placeholder">
                        {formData.avatar ? (
                          <img src={formData.avatar} alt="Avatar" className="team-member-avatar" />
                        ) : (
                          formData.name.charAt(0).toUpperCase() || '?'
                        )}
                      </div>
                      <motion.button
                        type="button"
                        onClick={simulateAvatarUpload}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200 text-sm"
                      >
                        Upload Avatar
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      resetForm()
                    }}
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
                    {editingMember ? 'Update Member' : 'Add Member'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export default TeamMemberManager