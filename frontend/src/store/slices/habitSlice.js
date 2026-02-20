import { createSlice } from '@reduxjs/toolkit';

const habitSlice = createSlice({
  name: 'habits',
  initialState: {
    todaySummary: null,
    filter: { category: '', isActive: true },
  },
  reducers: {
    setTodaySummary(state, { payload }) { state.todaySummary = payload; },
    setHabitFilter(state, { payload }) { state.filter = { ...state.filter, ...payload }; },
  },
});

export const { setTodaySummary, setHabitFilter } = habitSlice.actions;
export const selectTodaySummary = (state) => state.habits.todaySummary;

export default habitSlice.reducer;
