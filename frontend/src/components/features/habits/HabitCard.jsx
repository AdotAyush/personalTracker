import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FlameIcon, CheckIcon, TrophyIcon, TargetIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { habitService } from '../../../services';

const FREQUENCY_LABELS = { daily: 'Daily', weekly: 'Weekly', custom: 'Custom' };

const COLOR_MAP = {
  indigo:  'bg-indigo-500',
  violet:  'bg-violet-500',
  pink:    'bg-pink-500',
  rose:    'bg-rose-500',
  orange:  'bg-orange-500',
  amber:   'bg-amber-500',
  emerald: 'bg-emerald-500',
  teal:    'bg-teal-500',
  sky:     'bg-sky-500',
};

export default function HabitCard({ habit, onClick }) {
  const queryClient = useQueryClient();
  const isCompleted = habit.isCompletedToday;
  const color = COLOR_MAP[habit.color] || 'bg-indigo-500';

  const completeMutation = useMutation({
    mutationFn: () => isCompleted
      ? habitService.removeCompletion(habit._id, { date: new Date().toISOString() })
      : habitService.logCompletion(habit._id, { date: new Date().toISOString(), value: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries(['habits']);
      queryClient.invalidateQueries(['habits-today']);
      if (!isCompleted) toast.success(`🔥 ${habit.name} completed!`);
    },
    onError: () => toast.error('Failed to update habit'),
  });

  const progress = habit.todayProgress
    ? Math.min((habit.todayProgress / (habit.targetValue || 1)) * 100, 100)
    : isCompleted ? 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="card card-hover p-4 cursor-pointer relative overflow-hidden"
      onClick={onClick}
    >
      {/* Color accent bar */}
      <div className={clsx('absolute left-0 top-0 bottom-0 w-1 rounded-l-xl', color)} />

      <div className="pl-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="text-xl">{habit.icon || '✨'}</span>
            <div>
              <h3 className="font-semibold text-white text-sm leading-tight truncate">{habit.name}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {FREQUENCY_LABELS[habit.frequency]}
                {habit.targetValue && ` · ${habit.targetValue} ${habit.unit || ''}`}
              </p>
            </div>
          </div>

          {/* Progress ring / bar */}
          {habit.targetValue > 1 ? (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>{habit.todayProgress || 0} / {habit.targetValue} {habit.unit}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className={clsx('h-full rounded-full', color)}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          ) : null}

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1 text-xs">
              <FlameIcon className={clsx('w-3.5 h-3.5', habit.currentStreak > 0 ? 'text-orange-400' : 'text-zinc-600')} />
              <span className={habit.currentStreak > 0 ? 'text-orange-400 font-semibold' : 'text-zinc-500'}>
                {habit.currentStreak}
              </span>
              <span className="text-zinc-500">streak</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <TrophyIcon className="w-3.5 h-3.5 text-yellow-500/60" />
              <span>Best {habit.longestStreak}</span>
            </div>
            {habit.completionRate != null && (
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <TargetIcon className="w-3.5 h-3.5" />
                <span>{Math.round(habit.completionRate)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Complete button */}
        <button
          onClick={(e) => { e.stopPropagation(); completeMutation.mutate(); }}
          disabled={completeMutation.isPending}
          className={clsx(
            'flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200',
            isCompleted
              ? `${color} border-transparent text-white shadow-glow`
              : 'border-zinc-600 text-zinc-500 hover:border-zinc-400'
          )}
        >
          {isCompleted ? <CheckIcon className="w-5 h-5" /> : <CheckIcon className="w-5 h-5 opacity-0 group-hover:opacity-100" />}
        </button>
      </div>
    </motion.div>
  );
}
