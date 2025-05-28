import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { formatDistanceToNow, parseISO } from 'date-fns'
import ApperIcon from './ApperIcon'
import MentionInput from './MentionInput'

const TaskComments = ({ taskId, comments = [], onUpdateComments }) => {
  const [teamMembers, setTeamMembers] = useState([])
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [editingComment, setEditingComment] = useState(null)
  const [commentText, setCommentText] = useState('')

  // Load team members for mention functionality
  useEffect(() => {
    const savedMembers = localStorage.getItem('taskflow-team-members')
    if (savedMembers) {
      setTeamMembers(JSON.parse(savedMembers))
    }
  }, [])

  const getCurrentUser = () => {
    // Simulate current user - in real app this would come from auth context
    return {
      id: 'current-user',
      name: 'Current User',
      avatar: null
    }
  }

  const handleSubmitComment = () => {
    if (!commentText.trim()) {
      toast.error('Please enter a comment')
      return
    }

    const currentUser = getCurrentUser()
    
    if (editingComment) {
      // Update existing comment
      const updatedComments = comments.map(comment => 
        comment.id === editingComment.id 
          ? { ...comment, content: commentText, updatedAt: new Date().toISOString() }
          : comment
      )
      onUpdateComments(updatedComments)
      toast.success('Comment updated!')
      setEditingComment(null)
    } else {
      // Add new comment
      const newComment = {
        id: Date.now().toString(),
        content: commentText,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      onUpdateComments([...comments, newComment])
      toast.success('Comment added!')
    }

    setCommentText('')
    setShowCommentForm(false)
  }

  const handleEditComment = (comment) => {
    setCommentText(comment.content)
    setEditingComment(comment)
    setShowCommentForm(true)
  }

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      const updatedComments = comments.filter(comment => comment.id !== commentId)
      onUpdateComments(updatedComments)
      toast.success('Comment deleted!')
    }
  }

  const formatTimestamp = (timestamp) => {
    return formatDistanceToNow(parseISO(timestamp), { addSuffix: true })
  }

  const renderCommentContent = (content) => {
    // Simple mention parsing - replace @username with styled mentions
    return content.replace(/@(\w+)/g, '<span class="mention">@$1</span>')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-slate-900 dark:text-white">
          Comments ({comments.length})
        </h4>
        <motion.button
          onClick={() => {
            setShowCommentForm(true)
            setCommentText('')
            setEditingComment(null)
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-1 text-sm text-primary hover:text-primary-dark transition-colors duration-200"
        >
          <ApperIcon name="MessageCircle" className="w-4 h-4" />
          <span>Add Comment</span>
        </motion.button>
      </div>

      {/* Comments List */}
      <div className="comment-thread">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="comment-item"
            >
              <div className="comment-header">
                <div className="comment-author">
                  <div className="comment-author-avatar placeholder bg-gradient-to-r from-primary to-primary-light text-white flex items-center justify-center text-xs font-semibold w-6 h-6 rounded-full">
                    {comment.authorAvatar ? (
                      <img src={comment.authorAvatar} alt={comment.authorName} className="comment-author-avatar" />
                    ) : (
                      comment.authorName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="comment-author-name">{comment.authorName}</span>
                </div>
                <span className="comment-timestamp">{formatTimestamp(comment.createdAt)}</span>
              </div>
              
              <div 
                className="comment-content"
                dangerouslySetInnerHTML={{ __html: renderCommentContent(comment.content) }}
              />
              
              <div className="comment-actions">
                <span 
                  className="comment-action-btn"
                  onClick={() => handleEditComment(comment)}
                >
                  Edit
                </span>
                <span 
                  className="comment-action-btn"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  Delete
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <div className="text-center py-8">
            <ApperIcon name="MessageCircle" className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No comments yet. Be the first to comment!
            </p>
          </div>
        )}
      </div>

      {/* Comment Form */}
      <AnimatePresence>
        {showCommentForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="comment-form"
          >
            <MentionInput
              value={commentText}
              onChange={setCommentText}
              teamMembers={teamMembers}
              placeholder="Write a comment... Use @username to mention someone"
              className="comment-input"
            />
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCommentForm(false)
                  setCommentText('')
                  setEditingComment(null)
                }}
                className="comment-cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitComment}
                className="comment-submit-btn"
              >
                {editingComment ? 'Update Comment' : 'Add Comment'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TaskComments