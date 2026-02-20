import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeftIcon, ChevronRightIcon, PlusIcon, XIcon,
  CalendarIcon, ClockIcon,
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isToday, isSameDay, addMonths, subMonths,
  startOfWeek, endOfWeek, parseISO,
} from 'date-fns';
import toast from 'react-hot-toast';
import { calendarService } from '../services';
import Modal from '../components/common/Modal';

const EVENT_COLORS = ['indigo', 'violet', 'pink', 'rose', 'orange', 'emerald', 'teal', 'sky'];
const COLOR_BG = {
  indigo: 'bg-indigo-600', violet: 'bg-violet-600', pink: 'bg-pink-600',
  rose: 'bg-rose-600', orange: 'bg-orange-600', emerald: 'bg-emerald-600',
  teal: 'bg-teal-600', sky: 'bg-sky-600',
};

function EventForm({ isOpen, onClose, selectedDate }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: '', type: 'event', color: 'indigo',
    startDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    startTime: '09:00', endDate: '', endTime: '10:00',
  });

  const mutation = useMutation({
    mutationFn: () => calendarService.createEvent({
      title: form.title,
      type: form.type,
      color: form.color,
      startDate: new Date(`${form.startDate}T${form.startTime}`),
      endDate:   new Date(`${form.endDate || form.startDate}T${form.endTime}`),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['calendar']);
      toast.success('Event created!');
      onClose();
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Event" size="md">
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input className="input" placeholder="Event title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date</label>
            <input type="date" className="input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Start Time</label>
            <input type="time" className="input" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">End Date</label>
            <input type="date" className="input" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
          </div>
          <div>
            <label className="label">End Time</label>
            <input type="time" className="input" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="label">Color</label>
          <div className="flex gap-2 flex-wrap">
            {EVENT_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                className={`w-6 h-6 rounded-full ${COLOR_BG[c]} ${form.color === c ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-white' : ''}`}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Create Event'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay,  setSelectedDay]  = useState(null);
  const [showForm,     setShowForm]     = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd   = endOfMonth(currentMonth);
  const calStart   = startOfWeek(monthStart);
  const calEnd     = endOfWeek(monthEnd);
  const days       = eachDayOfInterval({ start: calStart, end: calEnd });

  const { data } = useQuery({
    queryKey: ['calendar', format(currentMonth, 'yyyy-MM')],
    queryFn: () => calendarService.getEvents({
      startDate: calStart.toISOString(),
      endDate:   calEnd.toISOString(),
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => calendarService.deleteEvent(id),
    onSuccess: () => { queryClient.invalidateQueries(['calendar']); toast.success('Event deleted'); },
  });

  const events = data?.data || [];

  const getEventsForDay = (day) =>
    events.filter(e => isSameDay(parseISO(e.startDate), day));

  const dayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Calendar</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{format(currentMonth, 'MMMM yyyy')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="btn btn-ghost p-2">
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <button onClick={() => setCurrentMonth(new Date())} className="btn btn-secondary text-sm px-3 py-1.5">
            Today
          </button>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="btn btn-ghost p-2">
            <ChevronRightIcon className="w-4 h-4" />
          </button>
          <button onClick={() => setShowForm(true)} className="btn btn-primary gap-2">
            <PlusIcon className="w-4 h-4" /> New Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar grid */}
        <div className="lg:col-span-2 card p-4">
          <div className="grid grid-cols-7 mb-2">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-zinc-500 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px">
            {days.map((day) => {
              const dayEvts   = getEventsForDay(day);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[72px] p-1 rounded-lg cursor-pointer transition-colors ${
                    isToday(day) ? 'bg-primary-600/10' : 'hover:bg-zinc-800/50'
                  } ${isSelected ? 'ring-1 ring-primary-500' : ''} ${
                    !isSameMonth(day, currentMonth) ? 'opacity-30' : ''
                  }`}
                >
                  <span className={`text-xs font-medium inline-flex w-6 h-6 items-center justify-center rounded-full ${
                    isToday(day) ? 'bg-primary-600 text-white' : 'text-zinc-300'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  <div className="space-y-0.5 mt-0.5">
                    {dayEvts.slice(0, 2).map(e => (
                      <div key={e._id} className={`text-xs text-white px-1 py-0.5 rounded truncate ${COLOR_BG[e.color] || 'bg-primary-600'}`}>
                        {e.title}
                      </div>
                    ))}
                    {dayEvts.length > 2 && (
                      <div className="text-xs text-zinc-500">+{dayEvts.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        <div className="card p-4">
          <h3 className="font-semibold text-white mb-3">
            {selectedDay ? format(selectedDay, 'EEEE, MMM d') : 'Select a day'}
          </h3>
          {dayEvents.length === 0 ? (
            <div className="text-center py-8 text-zinc-600">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No events</p>
              <button onClick={() => setShowForm(true)} className="btn btn-ghost text-xs mt-2">
                <PlusIcon className="w-3 h-3" /> Add Event
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {dayEvents.map(event => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-3 rounded-lg ${COLOR_BG[event.color] || 'bg-zinc-800'}/10 border border-${event.color || 'zinc'}-700/30 group`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{event.title}</p>
                        {event.startDate && (
                          <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                            <ClockIcon className="w-3 h-3" />
                            {format(parseISO(event.startDate), 'h:mm a')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteMutation.mutate(event._id)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400"
                      >
                        <XIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <EventForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        selectedDate={selectedDay}
      />
    </div>
  );
}
