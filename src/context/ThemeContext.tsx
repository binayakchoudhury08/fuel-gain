import React, { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../storage/reduxStore';
import { toggleTheme, setTheme } from '../storage/slices/themeSlice';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleThemeMode: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const themeMode = useSelector((state: RootState) => state.theme.theme);
  const isDarkMode = themeMode === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleThemeMode = () => {
    dispatch(toggleTheme());
  };

  const setThemeMode = (mode: 'light' | 'dark') => {
    dispatch(setTheme(mode));
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleThemeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
