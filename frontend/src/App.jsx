import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Suspense, lazy, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/common/LoadingScreen';
import useTheme from './hooks/useTheme';
import { selectIsAuthenticated } from './store/slices/authSlice';

// Lazy loaded pages
const Dashboard   = lazy(() => import('./pages/Dashboard'));
const Tasks       = lazy(() => import('./pages/Tasks'));
const Habits      = lazy(() => import('./pages/Habits'));
const TimeTable   = lazy(() => import('./pages/TimeTable'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const Analytics   = lazy(() => import('./pages/Analytics'));
const Settings    = lazy(() => import('./pages/Settings'));
const Login       = lazy(() => import('./pages/Login'));
const Register    = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

export default function App() {
  useTheme();

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="habits" element={<Habits />} />
              <Route path="timetable" element={<TimeTable />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </BrowserRouter>
  );
}
