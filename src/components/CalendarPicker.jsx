import { useState, forwardRef } from 'react'
import DatePicker from 'react-datepicker'
import { motion } from 'framer-motion'
import ApperIcon from './ApperIcon'
import { format, isValid, parseISO } from 'date-fns'
import 'react-datepicker/dist/react-datepicker.css'

const CalendarInput = forwardRef(({ value, onClick, placeholder, className }, ref) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    className={`flex items-center cursor-pointer ${className}`}
    onClick={onClick}
    ref={ref}
  >
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      readOnly
      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 cursor-pointer"
    />
    <ApperIcon 
      name="Calendar" 
      className="w-5 h-5 text-slate-400 dark:text-slate-500 ml-3 -mr-10 z-10" 
    />
  </motion.div>
))

CalendarInput.displayName = 'CalendarInput'

const CalendarPicker = ({ 
  selectedDate, 
  onDateChange, 
  placeholder = "Select date...",
  className = "",
  minDate = null,
  maxDate = null 
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleDateChange = (date) => {
    if (typeof onDateChange === 'function') {
      onDateChange(date)
    }
    setIsOpen(false)
  }


  const formatDisplayDate = (date) => {
    if (!date) return ''
    
    // Handle string dates
    if (typeof date === 'string') {
      const parsedDate = parseISO(date)
      return isValid(parsedDate) ? format(parsedDate, 'MMM dd, yyyy') : ''
    }
    
    // Handle Date objects
    return isValid(date) ? format(date, 'MMM dd, yyyy') : ''
  }

  const parseSelectedDate = (date) => {
    if (!date) return null
    
    // Handle string dates
    if (typeof date === 'string') {
      const parsedDate = parseISO(date)
      return isValid(parsedDate) ? parsedDate : null
    }
    
    // Handle Date objects
    return isValid(date) ? date : null
  }

  return (
    <div className={`calendar-picker-container ${className}`}>
      <DatePicker
        selected={parseSelectedDate(selectedDate)}
        onChange={handleDateChange}
        onCalendarOpen={() => setIsOpen(true)}
        onCalendarClose={() => setIsOpen(false)}
        customInput={
          <CalendarInput 
            placeholder={placeholder}
            className="w-full"
          />
        }
        dateFormat="MMM dd, yyyy"
        minDate={minDate}
        maxDate={maxDate}
        popperClassName="calendar-popper"
        calendarClassName="custom-calendar"
        showPopperArrow={false}
        popperPlacement="bottom-start"
        value={formatDisplayDate(selectedDate)}
      />
    </div>
  )
}

export default CalendarPicker