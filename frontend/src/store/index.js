import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import taskReducer from './slices/taskSlice';
import habitReducer from './slices/habitSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    tasks: taskReducer,
    habits: habitReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: import.meta.env.DEV,
});
