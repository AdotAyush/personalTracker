import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { analyticsService, habitService } from '../services';
import HeatmapCalendar from '../components/features/habits/HeatmapCalendar';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 text-xs border border-zinc-700">
      <p className="text-zinc-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { data: dashData } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => analyticsService.getDashboard(),
  });

  const { data: trendData } = useQuery({
    queryKey: ['analytics-trend'],
    queryFn: () => analyticsService.getSevenDayTrend(),
  });

  const { data: pomData } = useQuery({
    queryKey: ['analytics-pomodoro'],
    queryFn: () => analyticsService.getPomodoroStats(),
  });

  const { data: heatmapData } = useQuery({
    queryKey: ['analytics-heatmap'],
    queryFn: () => analyticsService.getHeatmap(),
  });

  const analytics = dashData?.data || {};
  const trend     = trendData?.data || [];
  const pomodoro  = pomData?.data   || {};
  const heatmap   = heatmapData?.data || [];

  const scoreData = [
    { name: 'Score', value: analytics.productivityScore || 0, fill: '#6366f1' },
  ];

  const priorityData = analytics.priorityDistribution
    ? Object.entries(analytics.priorityDistribution).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Analytics</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Your productivity insights</p>
      </div>

      {/* Score + stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Productivity score ring */}
        <div className="card p-5 flex flex-col items-center justify-center">
          <p className="text-sm text-zinc-400 mb-2">Productivity Score</p>
          <ResponsiveContainer width={140} height={140}>
            <RadialBarChart
              cx="50%" cy="50%"
              innerRadius="65%" outerRadius="90%"
              startAngle={90} endAngle={90 - 360 * ((analytics.productivityScore || 0) / 100)}
              data={scoreData}
            >
              <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#27272a' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <p className="text-3xl font-bold text-primary-400 -mt-20">
            {analytics.productivityScore ?? '—'}%
          </p>
          <p className="mt-14 text-xs text-zinc-500">Weekly average</p>
        </div>

        {/* Quick stats */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {[
            { label: 'Tasks Completed (Week)', value: analytics.tasksDoneWeek ?? 0,        color: 'text-blue-400' },
            { label: 'Tasks Overdue',          value: analytics.overdueTasks ?? 0,          color: analytics.overdueTasks > 0 ? 'text-red-400' : 'text-zinc-400' },
            { label: 'Habit Completion Rate',  value: `${Math.round(analytics.habitCompletionRate || 0)}%`, color: 'text-emerald-400' },
            { label: 'Total Pomodoro Sessions',value: pomodoro.totalSessions ?? 0,          color: 'text-red-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-4">
              <p className="text-xs text-zinc-500">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 7-day trend */}
      {trend.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5"
        >
          <h2 className="font-semibold text-white mb-4">7-Day Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="tasksDone"       name="Tasks Done"     fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="habitsCompleted" name="Habits Done"    fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Priority distribution */}
      {priorityData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5"
        >
          <h2 className="font-semibold text-white mb-4">Tasks by Priority</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={priorityData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Tasks" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Overall activity heatmap */}
      {heatmap.length > 0 && (
        <HeatmapCalendar data={heatmap} title="Overall Activity" />
      )}

      {/* Pomodoro stats */}
      {pomodoro.dailyBreakdown?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5"
        >
          <h2 className="font-semibold text-white mb-4">🍅 Pomodoro Sessions (7 days)</h2>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={pomodoro.dailyBreakdown} margin={{ left: -10, right: 10 }}>
              <defs>
                <linearGradient id="pomGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#ef4444" fill="url(#pomGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
