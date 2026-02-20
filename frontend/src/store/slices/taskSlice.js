import { createSlice } from '@reduxjs/toolkit';

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    filters: {
      status: '',
      priority: '',
      search: '',
      tags: [],
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
    kanbanColumns: { todo: [], in_progress: [], done: [], cancelled: [] },
    selectedTaskId: null,
  },
  reducers: {
    setFilter(state, { payload: { key, value } }) {
      state.filters[key] = value;
    },
    resetFilters(state) {
      state.filters = { status: '', priority: '', search: '', tags: [], sortBy: 'createdAt', sortOrder: 'desc' };
    },
    setKanbanColumns(state, { payload }) {
      state.kanbanColumns = payload;
    },
    moveTaskInKanban(state, { payload: { taskId, fromCol, toCol, newIndex } }) {
      const task = state.kanbanColumns[fromCol]?.find(t => t._id === taskId);
      if (!task) return;
      state.kanbanColumns[fromCol] = state.kanbanColumns[fromCol].filter(t => t._id !== taskId);
      state.kanbanColumns[toCol] = [
        ...state.kanbanColumns[toCol].slice(0, newIndex),
        { ...task, kanbanColumn: toCol },
        ...state.kanbanColumns[toCol].slice(newIndex),
      ];
    },
    setSelectedTask(state, { payload }) { state.selectedTaskId = payload; },
  },
});

export const { setFilter, resetFilters, setKanbanColumns, moveTaskInKanban, setSelectedTask } = taskSlice.actions;
export const selectTaskFilters = (state) => state.tasks.filters;
export const selectKanbanColumns = (state) => state.tasks.kanbanColumns;

export default taskSlice.reducer;
