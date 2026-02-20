import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import {
  CalendarIcon, FlagIcon, CheckCircleIcon, CircleIcon, TagIcon,
  ClockIcon, ChevronRightIcon, TrashIcon, GripIcon,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { taskService } from '../../../services';

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', class: 'priority-urgent' },
  high:   { label: 'High',   class: 'priority-high' },
  medium: { label: 'Medium', class: 'priority-medium' },
  low:    { label: 'Low',    class: 'priority-low' },
};

const formatDueDate = (dueDate) => {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  if (isToday(d)) return { label: 'Today', className: 'text-yellow-400' };
  if (isTomorrow(d)) return { label: 'Tomorrow', className: 'text-blue-400' };
  if (isPast(d)) return { label: format(d, 'MMM d'), className: 'text-red-400' };
  return { label: format(d, 'MMM d'), className: 'text-zinc-400' };
};

export default function TaskCard({ task, compact = false, onClick }) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: () => taskService.updateTask(task._id, {
      status: task.status === 'done' ? 'todo' : 'done',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      if (task.status !== 'done') toast.success('Task completed! 🎉');
    },
    onError: () => toast.error('Failed to update task'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => taskService.deleteTask(task._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success('Task deleted');
    },
  });

  const priority = PRIORITY_CONFIG[task.priority];
  const dueInfo = formatDueDate(task.dueDate);
  const isDone = task.status === 'done';

  const subtaskProgress = task.subtasks?.length
    ? { done: task.subtasks.filter(s => s.isCompleted).length, total: task.subtasks.length }
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -1 }}
      className={clsx(
        'card p-3 group cursor-pointer hover:border-zinc-700 transition-all duration-200',
        isDone && 'opacity-60'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Complete toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleMutation.mutate(); }}
          className="flex-shrink-0 mt-0.5 text-zinc-500 hover:text-primary-400 transition-colors"
          disabled={toggleMutation.isPending}
        >
          {isDone
            ? <CheckCircleIcon className="w-5 h-5 text-green-500" />
            : <CircleIcon className="w-5 h-5" />
          }
        </button>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className={clsx(
            'text-sm font-medium text-white leading-snug',
            isDone && 'line-through text-zinc-500'
          )}>
            {task.title}
          </p>

          {/* Description (non-compact) */}
          {!compact && task.description && (
            <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{task.description}</p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {priority && (
              <span className={priority.class}>
                <FlagIcon className="w-3 h-3" />
                {priority.label}
              </span>
            )}

            {dueInfo && (
              <span className={clsx('badge text-xs gap-1', dueInfo.className)}>
                <CalendarIcon className="w-3 h-3" />
                {dueInfo.label}
              </span>
            )}

            {subtaskProgress && (
              <span className="badge bg-zinc-800 text-zinc-400">
                {subtaskProgress.done}/{subtaskProgress.total}
              </span>
            )}

            {task.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="badge bg-primary-600/10 text-primary-400">
                <TagIcon className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>

          {/* Subtask progress bar */}
          {subtaskProgress && subtaskProgress.total > 0 && (
            <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 rounded-full transition-all"
                style={{ width: `${(subtaskProgress.done / subtaskProgress.total) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(); }}
          className="opacity-0 group-hover:opacity-100 flex-shrink-0 btn-ghost p-1 rounded-lg text-red-400 hover:text-red-300 transition-all"
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
