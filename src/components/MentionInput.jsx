import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MentionInput = ({ value, onChange, teamMembers = [], placeholder, className }) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionStart, setMentionStart] = useState(-1)
  const textareaRef = useRef(null)
  const suggestionsRef = useRef(null)

  useEffect(() => {
    if (mentionQuery && teamMembers.length > 0) {
      const filtered = teamMembers.filter(member => 
        member.name.toLowerCase().includes(mentionQuery.toLowerCase())
      )
      setSuggestions(filtered)
      setSelectedIndex(0)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
      setSuggestions([])
    }
  }, [mentionQuery, teamMembers])

  const handleInputChange = (e) => {
    const newValue = e.target.value
    const cursorPosition = e.target.selectionStart
    
    // Check for @ symbol and extract mention query
    const textBeforeCursor = newValue.substring(0, cursorPosition)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)
    
    if (mentionMatch) {
      setMentionStart(mentionMatch.index)
      setMentionQuery(mentionMatch[1])
    } else {
      setShowSuggestions(false)
      setMentionQuery('')
      setMentionStart(-1)
    }
    
    onChange(newValue)
  }

  const handleKeyDown = (e) => {
    if (showSuggestions && suggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          )
          break
        case 'Enter':
        case 'Tab':
          e.preventDefault()
          insertMention(suggestions[selectedIndex])
          break
        case 'Escape':
          setShowSuggestions(false)
          break
      }
    }
  }

  const insertMention = (member) => {
    const textarea = textareaRef.current
    const start = mentionStart
    const end = start + mentionQuery.length + 1 // +1 for @ symbol
    
    const newValue = value.substring(0, start) + `@${member.name} ` + value.substring(end)
    onChange(newValue)
    
    // Reset mention state
    setShowSuggestions(false)
    setMentionQuery('')
    setMentionStart(-1)
    
    // Focus back to textarea
    setTimeout(() => {
      textarea.focus()
      const newCursorPosition = start + member.name.length + 2 // +2 for @ and space
      textarea.setSelectionRange(newCursorPosition, newCursorPosition)
    }, 0)
  }

  const getSuggestionPosition = () => {
    if (!textareaRef.current || mentionStart === -1) return { top: 0, left: 0 }
    
    const textarea = textareaRef.current
    const style = window.getComputedStyle(textarea)
    const lineHeight = parseInt(style.lineHeight)
    
    // Simple approximation - in a real app you'd use a more sophisticated method
    const lines = value.substring(0, mentionStart).split('\n').length
    const top = (lines - 1) * lineHeight + 30
    const left = 0
    
    return { top, left }
  }

  const suggestionPosition = getSuggestionPosition()

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        rows={3}
      />
      
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mention-dropdown"
            style={{
              top: suggestionPosition.top,
              left: suggestionPosition.left
            }}
          >
            {suggestions.map((member, index) => (
              <div
                key={member.id}
                className={`mention-option ${
                  index === selectedIndex ? 'selected' : ''
                }`}
                onClick={() => insertMention(member)}
              >
                <div className="mention-option-avatar placeholder bg-gradient-to-r from-primary to-primary-light text-white flex items-center justify-center text-xs font-semibold w-6 h-6 rounded-full">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="mention-option-avatar" />
                  ) : (
                    member.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="mention-option-name">{member.name}</span>
                <span className="text-xs text-slate-500">({member.role})</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MentionInput