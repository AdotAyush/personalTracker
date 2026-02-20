import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon, TrashIcon, GripIcon, ChevronDownIcon,
  TypeIcon, HashIcon, CalendarIcon, ToggleLeftIcon, TagIcon, ListIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { timetableService } from '../../../services';

const COLUMN_TYPE_CONFIG = {
  text:     { label: 'Text',     icon: TypeIcon },
  number:   { label: 'Number',   icon: HashIcon },
  date:     { label: 'Date',     icon: CalendarIcon },
  boolean:  { label: 'Checkbox', icon: ToggleLeftIcon },
  select:   { label: 'Select',   icon: ListIcon },
  tags:     { label: 'Tags',     icon: TagIcon },
  url:      { label: 'URL',      icon: TypeIcon },
  email:    { label: 'Email',    icon: TypeIcon },
};

function CellEditor({ col, value, onChange, onBlur }) {
  switch (col.type) {
    case 'boolean':
      return (
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={e => onChange(e.target.checked)}
          className="w-4 h-4 rounded border-zinc-600 text-primary-500 bg-zinc-800 focus:ring-primary-500"
        />
      );
    case 'number':
      return (
        <input
          type="number"
          value={value || ''}
          onChange={e => onChange(Number(e.target.value))}
          onBlur={onBlur}
          className="w-full bg-transparent text-sm text-white outline-none focus:ring-0"
        />
      );
    case 'date':
      return (
        <input
          type="date"
          value={value ? value.split('T')[0] : ''}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          className="w-full bg-transparent text-sm text-zinc-300 outline-none"
        />
      );
    case 'select':
      return (
        <select
          value={value || ''}
          onChange={e => { onChange(e.target.value); onBlur(); }}
          className="w-full bg-zinc-900 text-sm text-zinc-200 outline-none rounded px-1"
        >
          <option value="">—</option>
          {(col.options || []).map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    case 'tags':
      return (
        <input
          type="text"
          value={Array.isArray(value) ? value.join(', ') : (value || '')}
          onChange={e => onChange(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
          onBlur={onBlur}
          placeholder="tag1, tag2"
          className="w-full bg-transparent text-sm text-zinc-300 outline-none"
        />
      );
    default:
      return (
        <input
          type={col.type === 'url' ? 'url' : col.type === 'email' ? 'email' : 'text'}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          className="w-full bg-transparent text-sm text-white outline-none"
        />
      );
  }
}

function AddColumnModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [options, setOptions] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      type,
      options: type === 'select' ? options.split(',').map(o => o.trim()).filter(Boolean) : [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <form onSubmit={submit} className="card p-5 w-80 space-y-4">
        <h3 className="font-semibold text-white">Add Column</h3>
        <div>
          <label className="label">Name</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} autoFocus />
        </div>
        <div>
          <label className="label">Type</label>
          <select className="input" value={type} onChange={e => setType(e.target.value)}>
            {Object.entries(COLUMN_TYPE_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        {type === 'select' && (
          <div>
            <label className="label">Options (comma-separated)</label>
            <input
              className="input"
              placeholder="Option 1, Option 2"
              value={options}
              onChange={e => setOptions(e.target.value)}
            />
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button type="submit" className="btn btn-primary">Add</button>
        </div>
      </form>
    </div>
  );
}

export default function TimeTableBuilder({ tableId }) {
  const queryClient = useQueryClient();
  const [showAddCol, setShowAddCol] = useState(false);
  const [editCell, setEditCell] = useState(null); // { rowId, colId }
  const [cellValues, setCellValues] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['timetable', tableId],
    queryFn: () => timetableService.getById(tableId),
    enabled: Boolean(tableId),
  });

  const addColumnMutation = useMutation({
    mutationFn: (col) => timetableService.addColumn(tableId, col),
    onSuccess: () => { queryClient.invalidateQueries(['timetable', tableId]); toast.success('Column added'); },
  });

  const deleteColumnMutation = useMutation({
    mutationFn: (colId) => timetableService.deleteColumn(tableId, colId),
    onSuccess: () => queryClient.invalidateQueries(['timetable', tableId]),
  });

  const addRowMutation = useMutation({
    mutationFn: (cells) => timetableService.addRow(tableId, { cells }),
    onSuccess: () => queryClient.invalidateQueries(['timetable', tableId]),
  });

  const updateCellMutation = useMutation({
    mutationFn: ({ rowId, colId, value }) =>
      timetableService.updateRow(tableId, rowId, { cells: { [colId]: value } }),
    onSuccess: () => queryClient.invalidateQueries(['timetable', tableId]),
  });

  const deleteRowMutation = useMutation({
    mutationFn: (rowId) => timetableService.deleteRow(tableId, rowId),
    onSuccess: () => queryClient.invalidateQueries(['timetable', tableId]),
  });

  const table = data?.data;
  const columns = table?.columnDefs || [];
  const rows    = table?.rows || [];

  const handleCellBlur = (rowId, colId) => {
    const key = `${rowId}-${colId}`;
    if (cellValues[key] !== undefined) {
      updateCellMutation.mutate({ rowId, colId, value: cellValues[key] });
    }
    setEditCell(null);
  };

  const getCellValue = (row, colId) => {
    const key = `${row._id}-${colId}`;
    return cellValues[key] !== undefined ? cellValues[key] : (row.cells?.[colId] ?? '');
  };

  if (!tableId) {
    return (
      <div className="text-center py-16 text-zinc-500">
        <ListIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Select a table to get started</p>
      </div>
    );
  }

  if (isLoading) return <div className="text-zinc-400 p-4">Loading table...</div>;

  return (
    <div className="space-y-4">
      {/* Table name */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{table?.name || 'Untitled Table'}</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowAddCol(true)} className="btn btn-secondary gap-2 text-sm">
            <PlusIcon className="w-4 h-4" /> Add Column
          </button>
          <button
            onClick={() => addRowMutation.mutate({})}
            className="btn btn-primary gap-2 text-sm"
          >
            <PlusIcon className="w-4 h-4" /> Add Row
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900">
                <th className="w-8 px-3 py-2" />
                {columns.map(col => {
                  const Icon = COLUMN_TYPE_CONFIG[col.type]?.icon || TypeIcon;
                  return (
                    <th
                      key={col.id}
                      className="text-left px-3 py-2 font-medium text-zinc-400 whitespace-nowrap"
                      style={{ minWidth: col.width || 160 }}
                    >
                      <div className="flex items-center gap-2 group">
                        <Icon className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{col.name}</span>
                        <button
                          onClick={() => deleteColumnMutation.mutate(col.id)}
                          className="opacity-0 group-hover:opacity-100 ml-auto text-zinc-600 hover:text-red-400"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </th>
                  );
                })}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {rows.map((row, ri) => (
                  <motion.tr
                    key={row._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${
                      ri % 2 === 0 ? '' : 'bg-zinc-900/30'
                    }`}
                  >
                    <td className="px-3 py-2 text-zinc-600">
                      <GripIcon className="w-3.5 h-3.5 cursor-grab" />
                    </td>
                    {columns.map(col => {
                      const key = `${row._id}-${col.id}`;
                      const isEditing = editCell?.rowId === row._id && editCell?.colId === col.id;
                      const val = getCellValue(row, col.id);
                      return (
                        <td
                          key={col.id}
                          className="px-3 py-2 cursor-text"
                          onClick={() => setEditCell({ rowId: row._id, colId: col.id })}
                        >
                          {isEditing || col.type === 'boolean' ? (
                            <CellEditor
                              col={col}
                              value={cellValues[key] !== undefined ? cellValues[key] : val}
                              onChange={(v) => setCellValues(prev => ({ ...prev, [key]: v }))}
                              onBlur={() => handleCellBlur(row._id, col.id)}
                            />
                          ) : (
                            <span className="text-zinc-300 line-clamp-1">
                              {Array.isArray(val) ? val.join(', ') : String(val || '—')}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-2 py-2">
                      <button
                        onClick={() => deleteRowMutation.mutate(row._id)}
                        className="text-zinc-700 hover:text-red-400 transition-colors"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 2} className="text-center py-10 text-zinc-600">
                    No rows yet. Click "Add Row" to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddCol && (
        <AddColumnModal
          onAdd={(col) => addColumnMutation.mutate(col)}
          onClose={() => setShowAddCol(false)}
        />
      )}
    </div>
  );
}
