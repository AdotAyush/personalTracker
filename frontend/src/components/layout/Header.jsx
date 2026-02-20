import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { MenuIcon, SearchIcon, SunIcon, MoonIcon, BellIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { toggleSidebar, toggleCommandPalette, selectTheme, setTheme } from '../../store/slices/uiSlice';
import clsx from 'clsx';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/tasks': 'Tasks',
  '/habits': 'Habits',
  '/timetable': 'TimeTable',
  '/calendar': 'Calendar',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export default function Header() {
  const dispatch = useDispatch();
  const location = useLocation();
  const theme = useSelector(selectTheme);
  const title = PAGE_TITLES[location.pathname] || 'PersonalTracker';

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 flex items-center h-16 px-3 md:px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shadow-sm transition-colors duration-300"
    >
      {/* Menu toggle */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="btn-ghost p-2 mr-2 md:mr-3 rounded-xl"
        aria-label="Toggle sidebar"
      >
        <MenuIcon className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h1 className="font-semibold text-zinc-900 dark:text-white text-lg md:text-xl">{title}</h1>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Search */}
        <button
          onClick={() => dispatch(toggleCommandPalette())}
          className="hidden sm:flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-700/50 transition-all duration-200"
        >
          <SearchIcon className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Search...</span>
          <kbd className="hidden lg:inline-flex kbd ml-2">⌘K</kbd>
        </button>

        {/* Mobile search icon */}
        <button
          onClick={() => dispatch(toggleCommandPalette())}
          className="sm:hidden btn-ghost p-2 rounded-xl"
          aria-label="Search"
        >
          <SearchIcon className="w-5 h-5" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))}
          className="btn-ghost p-2 rounded-xl transition-transform hover:scale-110 active:scale-95"
          aria-label="Toggle theme"
        >
          {theme === 'dark'
            ? <SunIcon className="w-5 h-5 text-yellow-500" />
            : <MoonIcon className="w-5 h-5 text-indigo-600" />
          }
        </button>

        {/* Notifications */}
        <button className="btn-ghost p-2 rounded-xl relative" aria-label="Notifications">
          <BellIcon className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full ring-2 ring-white dark:ring-zinc-950 animate-pulse" />
        </button>
      </div>
    </motion.header>
  );
}
