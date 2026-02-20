import { useState } from 'react';
import { motion } from 'framer-motion';
import KanbanBoard from '../components/features/tasks/KanbanBoard';
import TaskList from '../components/features/tasks/TaskList';
import { useSelector, useDispatch } from 'react-redux';
import { setTaskView } from '../store/slices/uiSlice';
import { LayoutGridIcon, ListIcon } from 'lucide-react';

export default function Tasks() {
  const dispatch = useDispatch();
  const view     = useSelector(s => s.ui.taskView) || 'list';

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white">Tasks</h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-0.5">Manage and track your to-dos</p>
        </div>
        {/* View toggle */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 gap-1 shadow-sm">
          {[
            { key: 'list',   icon: ListIcon,        label: 'List' },
            { key: 'kanban', icon: LayoutGridIcon,   label: 'Kanban' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => dispatch(setTaskView(key))}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg font-medium transition-all ${
                view === key
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={view}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        {view === 'kanban' ? <KanbanBoard /> : <TaskList />}
      </motion.div>
    </div>
  );
}
