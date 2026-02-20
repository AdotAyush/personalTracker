import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  PlayIcon, PauseIcon, RotateCcwIcon, SkipForwardIcon,
  XIcon, VolumeXIcon, Volume2Icon,
} from 'lucide-react';
import clsx from 'clsx';
import { togglePomodoro } from '../../../store/slices/uiSlice';
import usePomodoro from '../../../hooks/usePomodoro';

const PHASE_LABELS = {
  work:  { label: 'Focus',       color: 'text-red-400',    ring: 'stroke-red-500' },
  short: { label: 'Short Break', color: 'text-emerald-400', ring: 'stroke-emerald-500' },
  long:  { label: 'Long Break',  color: 'text-blue-400',    ring: 'stroke-blue-500' },
};

const SIZE    = 120;
const STROKE  = 8;
const RADIUS  = (SIZE - STROKE) / 2;
const CIRCUM  = 2 * Math.PI * RADIUS;

export default function PomodoroWidget() {
  const dispatch       = useDispatch();
  const isVisible      = useSelector(s => s.ui.pomodoroVisible);
  const [soundOn, setSoundOn] = [true, () => {}]; // placeholder; handled inside hook

  const {
    phase, timeLeft, isRunning, sessionCount, progress,
    start, pause, reset, skip, setPhase,
    soundEnabled, toggleSound,
  } = usePomodoro();

  const phaseConfig = PHASE_LABELS[phase];
  const dashOffset  = CIRCUM * (1 - progress);

  const mins  = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs  = String(timeLeft % 60).padStart(2, '0');

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="pomodoro"
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          drag
          dragMomentum={false}
          className="fixed bottom-6 right-6 z-50 select-none"
        >
          <div className="card p-5 w-64 shadow-card-hover">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className={clsx('text-sm font-semibold', phaseConfig.color)}>{phaseConfig.label}</p>
                <p className="text-xs text-zinc-500">Session #{sessionCount}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={toggleSound} className="btn btn-ghost p-1.5">
                  {soundEnabled
                    ? <Volume2Icon className="w-4 h-4 text-zinc-400" />
                    : <VolumeXIcon className="w-4 h-4 text-zinc-600" />
                  }
                </button>
                <button onClick={() => dispatch(togglePomodoro())} className="btn btn-ghost p-1.5">
                  <XIcon className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>

            {/* Circular progress */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <svg width={SIZE} height={SIZE} className="-rotate-90">
                  <circle
                    cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={STROKE}
                    className="text-zinc-800"
                  />
                  <motion.circle
                    cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
                    fill="none"
                    strokeWidth={STROKE}
                    strokeLinecap="round"
                    strokeDasharray={CIRCUM}
                    strokeDashoffset={dashOffset}
                    className={phaseConfig.ring}
                    transition={{ duration: 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-mono font-bold text-white">{mins}:{secs}</span>
                </div>
              </div>
            </div>

            {/* Phase switcher */}
            <div className="flex gap-1 mb-4">
              {Object.entries(PHASE_LABELS).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setPhase(key)}
                  className={clsx(
                    'flex-1 py-1 text-xs rounded-md font-medium transition-colors',
                    phase === key
                      ? `bg-zinc-700 ${cfg.color}`
                      : 'text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  {cfg.label.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button onClick={reset} className="btn btn-ghost p-2">
                <RotateCcwIcon className="w-4 h-4" />
              </button>
              <button
                onClick={isRunning ? pause : start}
                className={clsx(
                  'w-12 h-12 rounded-full flex items-center justify-center text-white transition-all',
                  isRunning ? 'bg-zinc-700 hover:bg-zinc-600' : `bg-${phase === 'work' ? 'red' : phase === 'short' ? 'emerald' : 'blue'}-600 hover:opacity-90 shadow-glow`
                )}
              >
                {isRunning
                  ? <PauseIcon className="w-5 h-5" />
                  : <PlayIcon  className="w-5 h-5 ml-0.5" />
                }
              </button>
              <button onClick={skip} className="btn btn-ghost p-2">
                <SkipForwardIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
