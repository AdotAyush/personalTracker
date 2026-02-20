import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners, defaultDropAnimation,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { PlusIcon, GripVerticalIcon } from 'lucide-react';
import { moveTaskInKanban, selectKanbanColumns } from '../../../store/slices/taskSlice';
import { taskService } from '../../../services';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';

const COLUMN_CONFIG = {
  todo:        { label: '📋 To Do',        color: 'bg-zinc-700',    headerColor: 'text-zinc-300' },
  in_progress: { label: '⚡ In Progress',   color: 'bg-blue-600',    headerColor: 'text-blue-400' },
  done:        { label: '✅ Done',           color: 'bg-green-600',   headerColor: 'text-green-400' },
  cancelled:   { label: '🚫 Cancelled',     color: 'bg-red-600',     headerColor: 'text-red-400' },
};

function SortableTask({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={clsx(isDragging && 'opacity-50')}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} compact />
    </div>
  );
}

function Column({ id, tasks, onAddTask }) {
  const config = COLUMN_CONFIG[id];
  return (
    <div className="flex flex-col w-72 flex-shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={clsx('w-2 h-2 rounded-full', config.color)} />
          <span className={clsx('text-sm font-semibold', config.headerColor)}>{config.label}</span>
          <span className="text-xs text-zinc-600 dark:text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">{tasks.length}</span>
        </div>
        <button onClick={() => onAddTask(id)} className="btn-ghost p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800">
          <PlusIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tasks */}
      <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 min-h-[200px]">
          {tasks.map(task => (
            <SortableTask key={task._id} task={task} />
          ))}
          {tasks.length === 0 && (
            <div className="flex-1 flex items-center justify-center py-8 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl">
              <p className="text-xs text-zinc-500 dark:text-zinc-600">Drop tasks here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const columns = useSelector(selectKanbanColumns);
  const [formOpen, setFormOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState('todo');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleAddTask = (columnId) => {
    setDefaultStatus(columnId);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setDefaultStatus('todo');
  };

  const reorderMutation = useMutation({
    mutationFn: (tasks) => taskService.reorderTasks(tasks),
    onError: () => {
      toast.error('Failed to save task order');
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'tasks' });
    },
  });

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    let fromCol, toCol, taskId;

    for (const [colId, tasks] of Object.entries(columns)) {
      if (tasks.some(t => t._id === active.id)) { fromCol = colId; taskId = active.id; }
      if (tasks.some(t => t._id === over.id)) { toCol = colId; }
    }

    if (!toCol) {
      // Dropped on column container
      toCol = over.id;
    }

    if (!fromCol || !toCol) return;

    const newIndex = columns[toCol].findIndex(t => t._id === over.id);
    dispatch(moveTaskInKanban({ taskId, fromCol, toCol, newIndex: Math.max(0, newIndex) }));

    // Persist to backend
    const updatedTasks = Object.entries(columns).flatMap(([colId, tasks]) =>
      tasks.map((t, i) => ({ id: t._id, kanbanColumn: colId, kanbanOrder: i }))
    );
    reorderMutation.mutate(updatedTasks);
  };

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Object.entries(columns).map(([colId, tasks]) => (
            <Column key={colId} id={colId} tasks={tasks} onAddTask={handleAddTask} />
          ))}
        </div>
      </DndContext>
      <TaskForm 
        isOpen={formOpen} 
        onClose={handleCloseForm} 
        task={formOpen ? { status: defaultStatus } : null} 
      />
    </>
  );
}
