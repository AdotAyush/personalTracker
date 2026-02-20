import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { XIcon, PlusIcon, TrashIcon, CalendarIcon, FlagIcon, TagIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../common/Modal';
import { taskService } from '../../../services';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUSES = ['todo', 'in_progress', 'done', 'cancelled'];

const defaultForm = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'todo',
  dueDate: '',
  dueTime: '',
  tags: [],
  subtasks: [],
  pomodoroEstimate: 1,
};

export default function TaskForm({ isOpen, onClose, task = null }) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(task && task._id);
  const [form, setForm] = useState(defaultForm);
  const [tagInput, setTagInput] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');

  useEffect(() => {
    if (task && task._id) {
      // Editing existing task
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        dueTime: task.dueDate ? task.dueDate.split('T')[1]?.slice(0, 5) : '',
        tags: task.tags || [],
        subtasks: task.subtasks?.map(s => ({ title: s.title, isCompleted: s.isCompleted })) || [],
        pomodoroEstimate: task.pomodoroEstimate || 1,
      });
    } else if (task && task.status) {
      // New task with default status from Kanban column
      setForm({ ...defaultForm, status: task.status });
    } else {
      // New task with default values
      setForm(defaultForm);
    }
  }, [task, isOpen]);

  const mutation = useMutation({
    mutationFn: (data) => (isEditing && task?._id)
      ? taskService.updateTask(task._id, data)
      : taskService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'tasks' });
      toast.success(isEditing ? 'Task updated!' : 'Task created!');
      onClose();
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Something went wrong'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');

    const payload = {
      ...form,
      dueDate: form.dueDate
        ? new Date(`${form.dueDate}${form.dueTime ? 'T' + form.dueTime : ''}`)
        : undefined,
    };
    delete payload.dueTime;
    mutation.mutate(payload);
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      setForm(f => ({ ...f, tags: [...f.tags, tag] }));
    }
    setTagInput('');
  };

  const removeTag = (tag) => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));

  const addSubtask = () => {
    const title = subtaskInput.trim();
    if (title) {
      setForm(f => ({ ...f, subtasks: [...f.subtasks, { title, isCompleted: false }] }));
      setSubtaskInput('');
    }
  };

  const removeSubtask = (i) =>
    setForm(f => ({ ...f, subtasks: f.subtasks.filter((_, idx) => idx !== i) }));

  const toggleSubtask = (i) =>
    setForm(f => ({
      ...f,
      subtasks: f.subtasks.map((s, idx) => idx === i ? { ...s, isCompleted: !s.isCompleted } : s),
    }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Task' : 'New Task'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="label">Title *</label>
          <input
            className="input"
            placeholder="What needs to be done?"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea
            className="input min-h-[80px] resize-none"
            placeholder="Add details..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>

        {/* Priority + Status row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center gap-1"><FlagIcon className="w-3 h-3" />Priority</label>
            <select
              className="input"
              value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Due date + time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center gap-1"><CalendarIcon className="w-3 h-3" />Due Date</label>
            <input
              type="date"
              className="input"
              value={form.dueDate}
              onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Due Time</label>
            <input
              type="time"
              className="input"
              value={form.dueTime}
              onChange={e => setForm(f => ({ ...f, dueTime: e.target.value }))}
            />
          </div>
        </div>

        {/* Pomodoro estimate */}
        <div>
          <label className="label">🍅 Pomodoro Estimate</label>
          <input
            type="number"
            min="1"
            max="20"
            className="input w-24"
            value={form.pomodoroEstimate}
            onChange={e => setForm(f => ({ ...f, pomodoroEstimate: Number(e.target.value) }))}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="label flex items-center gap-1"><TagIcon className="w-3 h-3" />Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.tags.map(tag => (
              <span key={tag} className="badge bg-primary-600/20 text-primary-400 flex items-center gap-1">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400">
                  <XIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Add tag..."
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            />
            <button type="button" onClick={addTag} className="btn btn-secondary">Add</button>
          </div>
        </div>

        {/* Subtasks */}
        <div>
          <label className="label">Subtasks</label>
          <div className="space-y-2 mb-2">
            {form.subtasks.map((s, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg">
                <input
                  type="checkbox"
                  checked={s.isCompleted}
                  onChange={() => toggleSubtask(i)}
                  className="rounded border-zinc-300 dark:border-zinc-600 text-primary-500 bg-white dark:bg-zinc-800 focus:ring-primary-500"
                />
                <span className={`flex-1 text-sm ${s.isCompleted ? 'line-through text-zinc-500 dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-200'}`}>
                  {s.title}
                </span>
                <button type="button" onClick={() => removeSubtask(i)} className="text-zinc-500 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400">
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Add subtask..."
              value={subtaskInput}
              onChange={e => setSubtaskInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
            />
            <button type="button" onClick={addSubtask} className="btn btn-secondary">
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
