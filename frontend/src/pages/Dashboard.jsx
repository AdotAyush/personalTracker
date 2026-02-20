import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  CheckSquareIcon, FlameIcon, ClockIcon, TrendingUpIcon,
  TargetIcon, ZapIcon,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { analyticsService } from '../services';
import { SkeletonStats } from '../components/common/Skeleton';

const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07 } }),
};

function StatCard({ label, value, sub, icon: Icon, color, index }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="card p-5 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-1.5 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 ${color} transition-transform hover:scale-110`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 text-xs shadow-xl">
      <p className="text-zinc-600 dark:text-zinc-400 font-medium">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const user = useSelector(s => s.auth.user);

  const { data, isLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => analyticsService.getDashboard(),
    refetchInterval: 5 * 60_000,
  });

  const { data: trendData } = useQuery({
    queryKey: ['analytics-trend'],
    queryFn: () => analyticsService.getSevenDayTrend(),
  });

  const analytics = data?.data || {};
  const trend     = trendData?.data || [];

  const stats = [
    {
      label: 'Tasks Today',
      value: analytics.tasksToday ?? '—',
      sub: `${analytics.tasksDoneWeek ?? 0} this week`,
      icon: CheckSquareIcon,
      color: 'text-blue-400',
    },
    {
      label: 'Active Streaks',
      value: analytics.activeStreaks ?? '—',
      sub: `${analytics.habitsToday ?? 0} habits today`,
      icon: FlameIcon,
      color: 'text-orange-400',
    },
    {
      label: 'Productivity Score',
      value: analytics.productivityScore != null ? `${analytics.productivityScore}%` : '—',
      sub: 'Weighted average',
      icon: TrendingUpIcon,
      color: 'text-primary-400',
    },
    {
      label: 'Pomodoros',
      value: analytics.pomodorosToday ?? '—',
      sub: `${analytics.pomodoroMinutes ?? 0} min focused`,
      icon: ClockIcon,
      color: 'text-red-400',
    },
    {
      label: 'Habit Rate',
      value: analytics.habitCompletionRate != null ? `${Math.round(analytics.habitCompletionRate)}%` : '—',
      sub: 'Last 7 days',
      icon: TargetIcon,
      color: 'text-emerald-400',
    },
    {
      label: 'Overdue Tasks',
      value: analytics.overdueTasks ?? '—',
      sub: 'Need attention',
      icon: ZapIcon,
      color: analytics.overdueTasks > 0 ? 'text-red-400' : 'text-zinc-400',
    },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
          {greeting}, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">Here's what's happening today.</p>
      </motion.div>

      {/* Stats grid */}
      {isLoading ? (
        <SkeletonStats />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
        </div>
      )}

      {/* 7-day trend chart */}
      {trend.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-5 md:p-6"
        >
          <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">7-Day Productivity Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trend} margin={{ left: -10, right: 10, top: 5 }}>
              <defs>
                <linearGradient id="taskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="habitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-zinc-500 dark:text-zinc-400" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} className="text-zinc-500 dark:text-zinc-400" axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="tasksDone"        name="Tasks"  stroke="#6366f1" fill="url(#taskGrad)"  strokeWidth={2} />
              <Area type="monotone" dataKey="habitsCompleted"  name="Habits" stroke="#f97316" fill="url(#habitGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Priority distribution */}
      {analytics.priorityDistribution && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-5 md:p-6"
        >
          <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">Tasks by Priority</h2>
          <div className="space-y-3">
            {Object.entries(analytics.priorityDistribution).map(([priority, count]) => {
              const total = Object.values(analytics.priorityDistribution).reduce((a, b) => a + b, 0);
              const pct   = total > 0 ? (count / total) * 100 : 0;
              const colors = { urgent: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-500', low: 'bg-emerald-500' };
              return (
                <div key={priority} className="flex items-center gap-3">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 w-14 capitalize font-medium">{priority}</span>
                  <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${colors[priority] || 'bg-primary-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 w-8 text-right font-semibold">{count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
