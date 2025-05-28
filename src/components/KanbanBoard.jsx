import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, DragOverlay, closestCorners, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'react-toastify'
import TaskCard from './TaskCard'
import ApperIcon from './ApperIcon'

const SortableTask = ({ task, onEdit, onDelete, onStatusChange, statusOptions, priorityOptions, categoryOptions }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
        categoryOptions={categoryOptions}
        isDragging={isDragging}
      />
    </div>
  )
}

const KanbanColumn = ({ column, tasks, onEdit, onDelete, onStatusChange, statusOptions, priorityOptions, categoryOptions }) => {
  const columnTasks = tasks.filter(task => task.status === column.value)
  const taskIds = columnTasks.map(task => task.id)

  return (
    <div className="kanban-column">
      <div className="kanban-column-header">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full bg-${column.color}-500`}></div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {column.label}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${column.color}-100 text-${column.color}-700 dark:bg-${column.color}-900/30 dark:text-${column.color}-400`}>
            {columnTasks.length}
          </span>
        </div>
        <ApperIcon name={column.icon} className={`w-5 h-5 text-${column.color}-600 dark:text-${column.color}-400`} />
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 min-h-[400px]">
          <AnimatePresence>
            {columnTasks.map(task => (
              <SortableTask
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                statusOptions={statusOptions}
                priorityOptions={priorityOptions}
                categoryOptions={categoryOptions}
              />
            ))}
          </AnimatePresence>
          
          {columnTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className={`w-12 h-12 bg-${column.color}-100 dark:bg-${column.color}-900/30 rounded-xl flex items-center justify-center mb-3`}>
                <ApperIcon name={column.icon} className={`w-6 h-6 text-${column.color}-400`} />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No {column.label.toLowerCase()} tasks
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Drag tasks here or create new ones
              </p>
            </motion.div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

const KanbanBoard = ({ 
  tasks, 
  onEdit, 
  onDelete, 
  onStatusChange, 
  statusOptions, 
  priorityOptions, 
  categoryOptions,
  onTaskMove 
}) => {
  const [activeTask, setActiveTask] = useState(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 8,
      },
    })
  )

  const handleDragStart = (event) => {
    const { active } = event
    const task = tasks.find(t => t.id === active.id)
    setActiveTask(task)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeTask = tasks.find(t => t.id === active.id)
    if (!activeTask) return

    // Check if dropped on a different column
    const targetStatus = statusOptions.find(status => 
      over.id.includes(status.value) || tasks.find(t => t.id === over.id)?.status === status.value
    )

    if (targetStatus && activeTask.status !== targetStatus.value) {
      onTaskMove(activeTask.id, targetStatus.value)
      toast.success(`Task moved to ${targetStatus.label}!`)
    } else if (over.id !== active.id) {
      // Handle reordering within the same column
      const overTask = tasks.find(t => t.id === over.id)
      if (overTask && overTask.status === activeTask.status) {
        // You can implement reordering logic here if needed
        toast.info('Task reordered within column')
      }
    }
  }

  const handleDragOver = (event) => {
    const { active, over } = event
    
    if (!over) return

    const activeTask = tasks.find(t => t.id === active.id)
    const overTask = tasks.find(t => t.id === over.id)
    
    if (!activeTask) return

    // If dragging over a task in a different column, move to that column
    if (overTask && activeTask.status !== overTask.status) {
      onTaskMove(activeTask.id, overTask.status)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statusOptions.map(column => (
          <KanbanColumn
            key={column.value}
            column={column}
            tasks={tasks}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            statusOptions={statusOptions}
            priorityOptions={priorityOptions}
            categoryOptions={categoryOptions}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="transform rotate-2 scale-105">
            <TaskCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
              onStatusChange={() => {}}
              statusOptions={statusOptions}
              priorityOptions={priorityOptions}
              categoryOptions={categoryOptions}
              isDragging={true}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

export default KanbanBoard