import { NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon, CheckSquareIcon, ZapIcon, TableIcon, CalendarIcon,
  BarChartIcon, SettingsIcon, XIcon, TimerIcon,
} from 'lucide-react';
import clsx from 'clsx';
import { selectSidebarOpen, toggleSidebar, togglePomodoro } from '../../store/slices/uiSlice';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../../services';

const NAV_ITEMS = [
  { to: '/dashboard', icon: HomeIcon, label: 'Dashboard', shortcut: '1' },
  { to: '/tasks', icon: CheckSquareIcon, label: 'Tasks', shortcut: '2' },
  { to: '/habits', icon: ZapIcon, label: 'Habits', shortcut: '3' },
  { to: '/timetable', icon: TableIcon, label: 'TimeTable', shortcut: '4' },
  { to: '/calendar', icon: CalendarIcon, label: 'Calendar', shortcut: '5' },
  { to: '/analytics', icon: BarChartIcon, label: 'Analytics', shortcut: '6' },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector(selectSidebarOpen);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  const { data: dashData } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsService.getDashboard().then(r => r.data.data),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => dispatch(toggleSidebar())}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={clsx(
          'fixed left-0 top-0 h-full w-64 z-50',
          'bg-zinc-900 border-r border-zinc-800',
          'flex flex-col',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <ZapIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm">PersonalTracker</span>
          </div>
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="md:hidden btn-ghost p-1 rounded-lg"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Productivity score */}
        {dashData && (
          <div className="mx-3 my-3 p-3 bg-primary-600/10 border border-primary-500/20 rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-zinc-400">Productivity Score</span>
              <span className="text-xs font-bold text-primary-400">{dashData.productivityScore}/100</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${dashData.productivityScore}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label, shortcut }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(isActive ? 'sidebar-item-active' : 'sidebar-item', 'group')
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              <span className="kbd opacity-0 group-hover:opacity-100 transition-opacity">{shortcut}</span>
            </NavLink>
          ))}

          {/* Pomodoro button */}
          <button
            onClick={() => dispatch(togglePomodoro())}
            className="sidebar-item w-full group"
          >
            <TimerIcon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">Pomodoro</span>
            <span className="kbd opacity-0 group-hover:opacity-100 transition-opacity">P</span>
          </button>
        </nav>

        {/* User profile */}
        <div className="p-3 border-t border-zinc-800">
          <NavLink to="/settings" className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-8 h-8 rounded-full ring-2 ring-primary-500/30"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
            <SettingsIcon className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          </NavLink>
        </div>
      </motion.aside>
    </>
  );
}
