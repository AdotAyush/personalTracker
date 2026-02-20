import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme, selectTheme } from '../store/slices/uiSlice';

const useTheme = () => {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
      root.classList.toggle('light', !prefersDark);
    }
  }, [theme]);

  const toggleTheme = () => {
    dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'));
  };

  const applyTheme = (newTheme) => dispatch(setTheme(newTheme));

  return { theme, toggleTheme, applyTheme };
};

export default useTheme;
