import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSun, FiMoon } from 'react-icons/fi';
import { toggleTheme } from '../../store/slices/themeSlice';
import { RootState } from '../../store/store';
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.mode);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <button
      className="theme-toggle"
      onClick={handleToggle}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
    </button>
  );
};

export default ThemeToggle;
