import HabitTracker from '../components/features/habits/HabitTracker';

export default function Habits() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Habits</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Build streaks, track daily rituals</p>
      </div>
      <HabitTracker />
    </div>
  );
}
