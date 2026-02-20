import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    sidebarCollapsed: false,
    theme: localStorage.getItem('pt_theme') || 'dark',
    focusMode: false,
    pomodoroVisible: false,
    activeModal: null,
    commandPaletteOpen: false,
    taskView: localStorage.getItem('pt_task_view') || 'list', // list | kanban | calendar
    notifications: [],
  },
  reducers: {
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen(state, { payload }) { state.sidebarOpen = payload; },
    toggleSidebarCollapse(state) { state.sidebarCollapsed = !state.sidebarCollapsed; },
    setTheme(state, { payload }) {
      state.theme = payload;
      localStorage.setItem('pt_theme', payload);
      const root = document.documentElement;
      if (payload === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else if (payload === 'light') {
        root.classList.remove('dark');
        root.classList.add('light');
      } else {
        // System preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
        root.classList.toggle('light', !prefersDark);
      }
    },
    toggleFocusMode(state) { state.focusMode = !state.focusMode; },
    setFocusMode(state, { payload }) { state.focusMode = payload; },
    togglePomodoro(state) { state.pomodoroVisible = !state.pomodoroVisible; },
    openModal(state, { payload }) { state.activeModal = payload; },
    closeModal(state) { state.activeModal = null; },
    toggleCommandPalette(state) { state.commandPaletteOpen = !state.commandPaletteOpen; },
    openCommandPalette(state)  { state.commandPaletteOpen = true; },
    closeCommandPalette(state) { state.commandPaletteOpen = false; },
    setTaskView(state, { payload }) {
      state.taskView = payload;
      localStorage.setItem('pt_task_view', payload);
    },
    addNotification(state, { payload }) {
      state.notifications.unshift({ id: Date.now(), ...payload });
      if (state.notifications.length > 50) state.notifications.pop();
    },
    dismissNotification(state, { payload }) {
      state.notifications = state.notifications.filter(n => n.id !== payload);
    },
    clearNotifications(state) { state.notifications = []; },
  },
});

export const {
  toggleSidebar, setSidebarOpen, toggleSidebarCollapse, setTheme,
  toggleFocusMode, setFocusMode, togglePomodoro, openModal, closeModal,
  toggleCommandPalette, openCommandPalette, closeCommandPalette,
  setTaskView, addNotification, dismissNotification, clearNotifications,
} = uiSlice.actions;

export const selectTheme = (state) => state.ui.theme;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectFocusMode = (state) => state.ui.focusMode;
export const selectPomodoroVisible = (state) => state.ui.pomodoroVisible;
export const selectCommandPaletteOpen = (state) => state.ui.commandPaletteOpen;
export const selectTaskView = (state) => state.ui.taskView;

export default uiSlice.reducer;
