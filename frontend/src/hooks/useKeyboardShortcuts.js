import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { toggleCommandPalette, togglePomodoro, toggleFocusMode } from '../store/slices/uiSlice';

const isMac = navigator.platform.toUpperCase().includes('MAC');
const modKey = isMac ? 'metaKey' : 'ctrlKey';

export const useKeyboardShortcuts = () => {
  const dispatch = useDispatch();

  const handleKeyDown = useCallback((e) => {
    const tag = document.activeElement.tagName.toLowerCase();
    const isEditing = ['input', 'textarea', 'select'].includes(tag) || document.activeElement.isContentEditable;

    // Global shortcuts (work even when editing)
    if (e[modKey] && e.key === 'k') {
      e.preventDefault();
      dispatch(toggleCommandPalette());
      return;
    }

    if (e.key === 'Escape') {
      dispatch({ type: 'ui/closeModal' });
      return;
    }

    // Non-editing shortcuts
    if (isEditing) return;

    const shortcuts = {
      'p': () => dispatch(togglePomodoro()),
      'f': () => dispatch(toggleFocusMode()),
      '1': () => window.location.href = '/dashboard',
      '2': () => window.location.href = '/tasks',
      '3': () => window.location.href = '/habits',
      '4': () => window.location.href = '/timetable',
      '5': () => window.location.href = '/calendar',
      '6': () => window.location.href = '/analytics',
    };

    if (shortcuts[e.key] && !e[modKey]) {
      e.preventDefault();
      shortcuts[e.key]();
    }
  }, [dispatch]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
