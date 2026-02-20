import { useState, useEffect, useRef, useCallback } from 'react';

const PHASES = { work: 'work', short: 'short', long: 'long' };
const PHASE_LABELS = { work: '🍅 Focus', short: '☕ Short Break', long: '🛀 Long Break' };

const usePomodoro = ({
  workDuration = 25,
  shortBreak = 5,
  longBreak = 15,
  sessionsBeforeLong = 4,
  onSessionComplete,
  soundEnabled = true,
} = {}) => {
  const [phase, setPhase] = useState(PHASES.work);
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const getDurationForPhase = useCallback((p) => {
    if (p === PHASES.work) return workDuration * 60;
    if (p === PHASES.short) return shortBreak * 60;
    return longBreak * 60;
  }, [workDuration, shortBreak, longBreak]);

  const playSound = useCallback((type = 'complete') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = type === 'complete' ? 880 : 440;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.8);
    } catch {}
  }, [soundEnabled]);

  const complete = useCallback(() => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    playSound('complete');

    if (phase === PHASES.work) {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      setTotalFocusTime(prev => prev + workDuration);
      onSessionComplete?.({ sessionCount: newCount, totalMinutes: (sessionCount + 1) * workDuration });

      const nextPhase = newCount % sessionsBeforeLong === 0 ? PHASES.long : PHASES.short;
      setPhase(nextPhase);
      setTimeLeft(getDurationForPhase(nextPhase));
    } else {
      setPhase(PHASES.work);
      setTimeLeft(getDurationForPhase(PHASES.work));
    }
  }, [phase, sessionCount, workDuration, sessionsBeforeLong, onSessionComplete, getDurationForPhase, playSound]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { complete(); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, complete]);

  // Update document title
  useEffect(() => {
    if (isRunning) {
      const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
      const secs = (timeLeft % 60).toString().padStart(2, '0');
      document.title = `${mins}:${secs} | ${PHASE_LABELS[phase]} — PersonalTracker`;
    } else {
      document.title = 'PersonalTracker — Productivity System';
    }
    return () => { document.title = 'PersonalTracker — Productivity System'; };
  }, [timeLeft, isRunning, phase]);

  const start = () => setIsRunning(true);
  const pause = () => { setIsRunning(false); clearInterval(intervalRef.current); };
  const reset = () => { pause(); setTimeLeft(getDurationForPhase(phase)); };
  const skip = () => complete();
  const setManualPhase = (p) => { pause(); setPhase(p); setTimeLeft(getDurationForPhase(p)); };

  const progress = 1 - timeLeft / getDurationForPhase(phase);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return {
    phase, timeLeft, isRunning, sessionCount, totalFocusTime, progress,
    minutes, seconds, PHASES, PHASE_LABELS,
    start, pause, reset, skip, setPhase: setManualPhase,
  };
};

export default usePomodoro;
