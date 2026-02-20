import HabitTracker from '../components/features/habits/HabitTracker';

export default function Habits() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white">Habits</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-0.5">Build streaks, track daily rituals</p>
      </div>
      <HabitTracker />
    </div>
  );
}
