import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, FilterIcon, SearchIcon, SortAscIcon, CheckSquareIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilter } from '../../../store/slices/taskSlice';
import { taskService } from '../../../services';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { SkeletonList } from '../../common/Skeleton';

const PRIORITY_OPTIONS = ['', 'urgent', 'high', 'medium', 'low'];
const STATUS_OPTIONS   = ['', 'todo', 'in_progress', 'done', 'cancelled'];
const SORT_OPTIONS     = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'createdAt',  label: 'Oldest' },
  { value: 'dueDate',    label: 'Due Date' },
  { value: '-priority',  label: 'Priority' },
  { value: 'title',      label: 'A–Z' },
];

export default function TaskList() {
  const dispatch = useDispatch();
  const filters  = useSelector(s => s.tasks.filters);

  const [formOpen,    setFormOpen]    = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page,        setPage]        = useState(1);
  const [search,      setSearch]      = useState('');
  const [sort,        setSort]        = useState('-createdAt');

  const query = {
    page,
    limit: 20,
    sort,
    ...(search           && { search }),
    ...(filters.priority && { priority: filters.priority }),
    ...(filters.status   && { status: filters.status }),
    ...(filters.tag      && { tags: filters.tag }),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', 'list', query],
    queryFn:  () => taskService.getTasks(query),
    keepPreviousData: true,
  });

  const tasks      = data?.data?.tasks       || [];
  const totalPages = data?.data?.totalPages   || 1;
  const total      = data?.data?.total        || 0;

  const handleEdit = (task) => { setEditingTask(task); setFormOpen(true); };
  const handleClose = () => { setFormOpen(false); setEditingTask(null); };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <input
            className="input pl-9 w-full"
            placeholder="Search tasks..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* Sort */}
        <select
          className="input w-full sm:w-36"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(f => !f)}
          className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} gap-2 w-full sm:w-auto`}
        >
          <FilterIcon className="w-4 h-4" />
          <span className="sm:inline">Filters</span>
        </button>

        {/* New task */}
        <button onClick={() => setFormOpen(true)} className="btn btn-primary gap-2 w-full sm:w-auto">
          <PlusIcon className="w-4 h-4" />
          <span className="hidden sm:inline">New Task</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Filter bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="card p-4 md:p-5 flex flex-wrap gap-3 md:gap-4">
              <div className="flex-1 min-w-[140px]">
                <label className="label text-xs">Priority</label>
                <select
                  className="input text-sm py-2 w-full"
                  value={filters.priority || ''}
                  onChange={e => { dispatch(setFilter({ key: 'priority', value: e.target.value })); setPage(1); }}
                >
                  <option value="">All priorities</option>
                  {PRIORITY_OPTIONS.filter(Boolean).map(p => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className="label text-xs">Status</label>
                <select
                  className="input text-sm py-2 w-full"
                  value={filters.status || ''}
                  onChange={e => { dispatch(setFilter({ key: 'status', value: e.target.value })); setPage(1); }}
                >
                  <option value="">All statuses</option>
                  {STATUS_OPTIONS.filter(Boolean).map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className="label text-xs">Tag</label>
                <input
                  className="input text-sm py-2 w-full"
                  placeholder="Filter by tag..."
                  value={filters.tag || ''}
                  onChange={e => { dispatch(setFilter({ key: 'tag', value: e.target.value })); setPage(1); }}
                />
              </div>

              <button
                className="btn btn-ghost text-xs self-end whitespace-nowrap"
                onClick={() => {
                  dispatch(setFilter({ key: 'priority', value: '' }));
                  dispatch(setFilter({ key: 'status',   value: '' }));
                  dispatch(setFilter({ key: 'tag',      value: '' }));
                  setPage(1);
                }}
              >
                Clear filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats bar */}
      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <CheckSquareIcon className="w-4 h-4" />
        <span className="font-medium">{total} task{total !== 1 ? 's' : ''}</span>
        {(filters.priority || filters.status || filters.tag || search) && (
          <span className="badge bg-primary-100 dark:bg-primary-600/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-500/30">filtered</span>
        )}
      </div>

      {/* Task list */}
      {isLoading ? (
        <SkeletonList count={6} />
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 dark:text-zinc-400">
          <CheckSquareIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">No tasks found</p>
          <p className="text-sm mt-1">Create a new task to get started</p>
          <button onClick={() => setFormOpen(true)} className="btn btn-primary mt-4 gap-2">
            <PlusIcon className="w-4 h-4" />
            Create Task
          </button>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {tasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={() => handleEdit(task)}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            className="btn btn-ghost px-4"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-ghost px-4"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Task form modal */}
      <TaskForm isOpen={formOpen} onClose={handleClose} task={editingTask} />
    </div>
  );
}
