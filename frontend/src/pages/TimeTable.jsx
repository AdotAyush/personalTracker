import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TableIcon, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import TimeTableBuilder from '../components/features/timetable/TimeTableBuilder';
import Modal from '../components/common/Modal';
import { timetableService } from '../services';

function NewTableModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');

  const mutation = useMutation({
    mutationFn: () => timetableService.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries(['timetables']);
      toast.success('Table created!');
      setName('');
      onClose();
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Table" size="sm">
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
        <div>
          <label className="label">Table Name</label>
          <input
            className="input"
            placeholder="My Schedule, Workout Plan..."
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={!name.trim() || mutation.isPending}>
            {mutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function TimeTablePage() {
  const queryClient = useQueryClient();
  const [activeId,  setActiveId]  = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { data } = useQuery({
    queryKey: ['timetables'],
    queryFn: () => timetableService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => timetableService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries(['timetables']);
      if (activeId === id) setActiveId(null);
      toast.success('Table deleted');
    },
  });

  const tables = Array.isArray(data?.data?.tables) ? data.data.tables : [];

  return (
    <div className="flex gap-4 h-full">
      {/* Sidebar: table list */}
      <div className="w-52 flex-shrink-0 space-y-1">
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary w-full gap-2 text-sm mb-3"
        >
          <PlusIcon className="w-4 h-4" /> New Table
        </button>

        {tables.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-500 text-center py-4">No tables yet</p>
        ) : (
          tables.map(t => (
            <div
              key={t._id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                activeId === t._id ? 'bg-primary-100 dark:bg-primary-600/20 text-primary-700 dark:text-primary-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              onClick={() => setActiveId(t._id)}
            >
              <TableIcon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 truncate">{t.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(t._id); }}
                className="opacity-0 group-hover:opacity-100 text-zinc-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400"
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Main: builder */}
      <div className="flex-1 overflow-auto">
        <TimeTableBuilder tableId={activeId} />
      </div>

      <NewTableModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
