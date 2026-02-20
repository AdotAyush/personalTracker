import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip } from 'react-tooltip';
import { useState } from 'react';
import { format, subYears, startOfYear, endOfYear } from 'date-fns';
import 'react-calendar-heatmap/dist/styles.css';

const INTENSITY_CLASSES = [
  'fill-zinc-800',
  'fill-emerald-900',
  'fill-emerald-700',
  'fill-emerald-500',
  'fill-emerald-400',
];

function classForValue(value) {
  if (!value || !value.count) return INTENSITY_CLASSES[0];
  const i = Math.min(value.count, INTENSITY_CLASSES.length - 1);
  return INTENSITY_CLASSES[i];
}

export default function HeatmapCalendar({ data = [], title = 'Activity' }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const currentYear = new Date().getFullYear();

  const start = startOfYear(new Date(year, 0, 1));
  const end   = year === currentYear ? new Date() : endOfYear(new Date(year, 0, 1));

  const totalCount = data.reduce((sum, d) => sum + (d.count || 0), 0);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white">{title} Heatmap</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{totalCount} total completions</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setYear(y => y - 1)}
            disabled={year <= currentYear - 3}
            className="btn btn-ghost p-1.5 text-xs"
          >
            ‹
          </button>
          <span className="text-sm font-medium text-zinc-300 px-2">{year}</span>
          <button
            onClick={() => setYear(y => y + 1)}
            disabled={year >= currentYear}
            className="btn btn-ghost p-1.5 text-xs"
          >
            ›
          </button>
        </div>
      </div>

      <div className="heatmap-wrapper overflow-x-auto pb-2">
        <CalendarHeatmap
          startDate={start}
          endDate={end}
          values={data}
          classForValue={classForValue}
          tooltipDataAttrs={(value) => ({
            'data-tooltip-id': 'heatmap-tooltip',
            'data-tooltip-content': value?.date
              ? `${format(new Date(value.date), 'MMM d, yyyy')}: ${value.count || 0} completion${value.count !== 1 ? 's' : ''}`
              : 'No data',
          })}
          showWeekdayLabels
          gutterSize={2}
        />
        <Tooltip id="heatmap-tooltip" className="!text-xs !bg-zinc-800 !text-zinc-100 !border-zinc-700" />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3">
        <span className="text-xs text-zinc-500">Less</span>
        {INTENSITY_CLASSES.map((cls, i) => (
          <div key={i} className={`w-3.5 h-3.5 rounded-sm ${cls.replace('fill-', 'bg-')}`} />
        ))}
        <span className="text-xs text-zinc-500">More</span>
      </div>
    </div>
  );
}
