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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Tasks</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Manage and track your to-dos</p>
        </div>
        {/* View toggle */}
        <div className="flex items-center bg-zinc-800 rounded-lg p-1 gap-1">
          {[
            { key: 'list',   icon: ListIcon,        label: 'List' },
            { key: 'kanban', icon: LayoutGridIcon,   label: 'Kanban' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => dispatch(setTaskView(key))}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                view === key
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
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
