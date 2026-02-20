import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, FlameIcon, CheckCircleIcon, XIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { habitService } from '../../../services';
import HabitCard from './HabitCard';
import HeatmapCalendar from './HeatmapCalendar';
import { SkeletonCard } from '../../common/Skeleton';
import Modal from '../../common/Modal';

const COLORS   = ['indigo', 'violet', 'pink', 'rose', 'orange', 'amber', 'emerald', 'teal', 'sky'];
const ICONS    = ['✨', '💪', '📚', '🏃', '🧘', '💧', '🥗', '😴', '✍️', '🎯', '🎸', '💻'];
const FREQS    = ['daily', 'weekly', 'custom'];

const defaultHabit = {
  name: '', description: '', icon: '✨', color: 'indigo',
  frequency: 'daily', targetDays: [0, 1, 2, 3, 4, 5, 6],
  targetValue: 1, unit: '',
};

function HabitFormModal({ isOpen, onClose, habit = null }) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(habit);
  const [form, setForm] = useState(habit ? { ...habit } : { ...defaultHabit });

  const mutation = useMutation({
    mutationFn: (data) => isEditing
      ? habitService.updateHabit(habit._id, data)
      : habitService.createHabit(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['habits']);
      toast.success(isEditing ? 'Habit updated!' : 'Habit created! 🎉');
      onClose();
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Error'),
  });

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (d) =>
    setForm(f => ({
      ...f,
      targetDays: f.targetDays.includes(d)
        ? f.targetDays.filter(x => x !== d)
        : [...f.targetDays, d].sort(),
    }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Habit' : 'New Habit'} size="lg">
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-5">
        {/* Icon + Name */}
        <div className="flex gap-3">
          <div>
            <label className="label">Icon</label>
            <select
              className="input w-20 text-2xl"
              value={form.icon}
              onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
            >
              {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="label">Name *</label>
            <input
              className="input"
              placeholder="e.g. Read for 30 minutes"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              autoFocus
            />
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="label">Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setForm(f => ({ ...f, color: c }))}
                className={`w-7 h-7 rounded-full bg-${c}-500 transition-all ${
                  form.color === c ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-white scale-110' : ''
                }`}
              />
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Frequency</label>
            <select
              className="input"
              value={form.frequency}
              onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
            >
              {FREQS.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
            </select>
          </div>
          {(form.frequency === 'daily' || form.frequency === 'custom') && (
            <div>
              <label className="label">Target Days</label>
              <div className="flex gap-1 flex-wrap">
                {DAY_LABELS.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                      form.targetDays.includes(i)
                        ? 'bg-primary-600 border-primary-500 text-white'
                        : 'border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Target value */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Target Value</label>
            <input
              type="number" min="1" max="1000"
              className="input"
              value={form.targetValue}
              onChange={e => setForm(f => ({ ...f, targetValue: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="label">Unit (optional)</label>
            <input
              className="input"
              placeholder="e.g. pages, minutes, km"
              value={form.unit}
              onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
          <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : isEditing ? 'Update' : 'Create Habit'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function HabitTracker() {
  const queryClient = useQueryClient();
  const [formOpen,     setFormOpen]     = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [heatmapHabit, setHeatmapHabit] = useState(null);
  const [showHeatmap,  setShowHeatmap]  = useState(false);

  const { data: habitsData, isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: () => habitService.getHabits(),
  });

  const { data: todayData } = useQuery({
    queryKey: ['habits-today'],
    queryFn: () => habitService.getTodaySummary(),
    refetchInterval: 60_000,
  });

  const { data: heatmapData } = useQuery({
    queryKey: ['habit-heatmap', heatmapHabit?._id],
    queryFn: () => habitService.getHeatmap(heatmapHabit._id),
    enabled: Boolean(heatmapHabit),
  });

  const habits = Array.isArray(habitsData?.data) ? habitsData.data : [];
  const today  = todayData?.data  || {};

  const handleEdit  = (habit) => { setEditingHabit(habit); setFormOpen(true); };
  const handleClose = () => { setFormOpen(false); setEditingHabit(null); };
  const handleHeatmap = (habit) => { setHeatmapHabit(habit); setShowHeatmap(true); };

  return (
    <div className="space-y-6">
      {/* Today's summary */}
      {today && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Completed', value: `${today.completed || 0}/${today.total || 0}`, icon: CheckCircleIcon, color: 'text-emerald-400' },
            { label: 'Active Streaks', value: today.activeStreaks || 0, icon: FlameIcon, color: 'text-orange-400' },
            { label: 'Completion Rate', value: `${Math.round(today.completionRate || 0)}%`, icon: null, color: 'text-primary-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4 text-center">
              {Icon && <Icon className={`w-6 h-6 mx-auto mb-1 ${color}`} />}
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Your Habits</h2>
        <button onClick={() => setFormOpen(true)} className="btn btn-primary gap-2">
          <PlusIcon className="w-4 h-4" />
          <span className="hidden sm:inline">New Habit</span>
        </button>
      </div>

      {/* Habit grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 dark:text-zinc-400">
          <FlameIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">No habits yet</p>
          <p className="text-sm mt-1">Start building positive habits today</p>
          <button onClick={() => setFormOpen(true)} className="btn btn-primary mt-4 gap-2">
            <PlusIcon className="w-4 h-4" /> Create First Habit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {habits.map(habit => (
              <div key={habit._id} className="relative group">
                <HabitCard
                  habit={habit}
                  onClick={() => handleHeatmap(habit)}
                />
                <button
                  onClick={() => handleEdit(habit)}
                  className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 btn btn-ghost p-1.5 text-xs transition-opacity"
                >
                  Edit
                </button>
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Heatmap modal */}
      <Modal
        isOpen={showHeatmap}
        onClose={() => setShowHeatmap(false)}
        title={`${heatmapHabit?.icon || ''} ${heatmapHabit?.name || ''}`}
        size="xl"
      >
        {heatmapData && (
          <HeatmapCalendar
            data={heatmapData.data || []}
            title={heatmapHabit?.name}
          />
        )}
      </Modal>

      {/* Habit form */}
      <HabitFormModal isOpen={formOpen} onClose={handleClose} habit={editingHabit} />
    </div>
  );
}
