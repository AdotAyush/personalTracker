import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import PomodoroWidget from '../features/pomodoro/PomodoroWidget';
import CommandPalette from '../features/command-palette/CommandPalette';
import ErrorBoundary from '../common/ErrorBoundary';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { selectPomodoroVisible, selectCommandPaletteOpen, selectSidebarOpen } from '../../store/slices/uiSlice';
import clsx from 'clsx';

export default function Layout() {
  useKeyboardShortcuts();
  const pomodoroVisible = useSelector(selectPomodoroVisible);
  const commandPaletteOpen = useSelector(selectCommandPaletteOpen);
  const sidebarOpen = useSelector(selectSidebarOpen);

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className={clsx(
        'flex flex-col flex-1 min-w-0 transition-all duration-300',
        sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
      )}>
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Floating widgets */}
      <AnimatePresence>
        {pomodoroVisible && <PomodoroWidget />}
        {commandPaletteOpen && <CommandPalette />}
      </AnimatePresence>
    </div>
  );
}
