import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  SearchIcon, CheckSquareIcon, FlameIcon, LayoutGridIcon,
  BarChartIcon, CalendarIcon, SettingsIcon, HomeIcon, ArrowRightIcon,
} from 'lucide-react';
import { closeCommandPalette } from '../../../store/slices/uiSlice';
import { taskService, habitService } from '../../../services';

const STATIC_COMMANDS = [
  { id: 'nav-dashboard',  label: 'Go to Dashboard',  icon: HomeIcon,         category: 'Navigation', action: '/dashboard' },
  { id: 'nav-tasks',      label: 'Go to Tasks',       icon: CheckSquareIcon,  category: 'Navigation', action: '/tasks' },
  { id: 'nav-habits',     label: 'Go to Habits',      icon: FlameIcon,        category: 'Navigation', action: '/habits' },
  { id: 'nav-timetable',  label: 'Go to Time Table',  icon: LayoutGridIcon,   category: 'Navigation', action: '/timetable' },
  { id: 'nav-analytics',  label: 'Go to Analytics',   icon: BarChartIcon,     category: 'Navigation', action: '/analytics' },
  { id: 'nav-calendar',   label: 'Go to Calendar',    icon: CalendarIcon,     category: 'Navigation', action: '/calendar' },
  { id: 'nav-settings',   label: 'Go to Settings',    icon: SettingsIcon,     category: 'Navigation', action: '/settings' },
];

function highlight(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.split(regex).map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-primary-500/30 text-primary-300 rounded px-0.5">{part}</mark>
      : part
  );
}

function scoreMatch(text, query) {
  if (!query) return 0;
  const lText = text.toLowerCase();
  const lQuery = query.toLowerCase();
  if (lText.startsWith(lQuery)) return 3;
  if (lText.includes(lQuery)) return 2;
  // Fuzzy: all chars present in order
  let qi = 0;
  for (let i = 0; i < lText.length && qi < lQuery.length; i++) {
    if (lText[i] === lQuery[qi]) qi++;
  }
  return qi === lQuery.length ? 1 : 0;
}

export default function CommandPalette() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const isOpen    = useSelector(s => s.ui.commandPaletteOpen);
  const [query, setQuery]     = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef  = useRef(null);
  const listRef   = useRef(null);

  const { data: tasksData }  = useQuery({
    queryKey: ['tasks-palette'],
    queryFn: () => taskService.getTasks({ limit: 100 }),
    enabled: isOpen,
    staleTime: 30_000,
  });

  const { data: habitsData } = useQuery({
    queryKey: ['habits-palette'],
    queryFn: () => habitService.getHabits(),
    enabled: isOpen,
    staleTime: 30_000,
  });

  const close = useCallback(() => {
    dispatch(closeCommandPalette());
    setQuery('');
    setSelected(0);
  }, [dispatch]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build dynamic items
  const taskItems = (tasksData?.data?.tasks || []).map(t => ({
    id: `task-${t._id}`,
    label: t.title,
    category: 'Tasks',
    icon: CheckSquareIcon,
    action: `/tasks?id=${t._id}`,
    meta: t.status,
  }));

  const habitItems = (habitsData?.data || []).map(h => ({
    id: `habit-${h._id}`,
    label: `${h.icon} ${h.name}`,
    category: 'Habits',
    icon: FlameIcon,
    action: `/habits?id=${h._id}`,
  }));

  const allItems = [...STATIC_COMMANDS, ...taskItems, ...habitItems];

  const filtered = query
    ? allItems
        .map(item => ({ item, score: scoreMatch(item.label, query) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ item }) => item)
    : STATIC_COMMANDS;

  // Group by category
  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const flatList = Object.values(grouped).flat();
  const safeSelected = Math.min(selected, flatList.length - 1);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape')     { close(); return; }
    if (e.key === 'ArrowDown')  { e.preventDefault(); setSelected(s => Math.min(s + 1, flatList.length - 1)); }
    if (e.key === 'ArrowUp')    { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && flatList[safeSelected]) {
      execute(flatList[safeSelected]);
    }
  };

  const execute = (item) => {
    close();
    navigate(item.action);
  };

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-selected="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [safeSelected]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={close}
          />

          {/* Palette */}
          <motion.div
            key="cp-panel"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50"
          >
            <div className="card overflow-hidden shadow-2xl border-zinc-700">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
                <SearchIcon className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-sm"
                  placeholder="Search commands, tasks, habits..."
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSelected(0); }}
                  onKeyDown={handleKeyDown}
                />
                <kbd className="kbd text-xs">Esc</kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-96 overflow-y-auto py-2">
                {flatList.length === 0 ? (
                  <p className="text-center text-zinc-500 text-sm py-8">No results found</p>
                ) : (
                  Object.entries(grouped).map(([category, items]) => {
                    let globalIdx = flatList.indexOf(items[0]);
                    return (
                      <div key={category}>
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-4 py-1.5">
                          {category}
                        </p>
                        {items.map((item, i) => {
                          const idx = globalIdx + i;
                          const isSelected = idx === safeSelected;
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              data-selected={isSelected}
                              onClick={() => execute(item)}
                              onMouseEnter={() => setSelected(idx)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                isSelected ? 'bg-primary-600/20 text-white' : 'text-zinc-300 hover:bg-zinc-800'
                              }`}
                            >
                              <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-primary-400' : 'text-zinc-500'}`} />
                              <span className="flex-1 text-sm">{highlight(item.label, query)}</span>
                              {item.meta && (
                                <span className="badge text-xs">{item.meta}</span>
                              )}
                              {isSelected && <ArrowRightIcon className="w-3.5 h-3.5 text-zinc-500" />}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-zinc-800 px-4 py-2 flex items-center gap-4 text-xs text-zinc-500">
                <span><kbd className="kbd">↑↓</kbd> navigate</span>
                <span><kbd className="kbd">↵</kbd> select</span>
                <span><kbd className="kbd">Esc</kbd> close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
