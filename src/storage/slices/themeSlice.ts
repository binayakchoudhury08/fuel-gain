import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppSettings } from '../../types';

const initialState: AppSettings = {
  theme: 'light',
  notificationsEnabled: true,
  language: 'en',
  autoSync: true,
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    toggleAutoSync: (state) => {
      state.autoSync = !state.autoSync;
    }
  }
});

export const { toggleTheme, setTheme, toggleNotifications, setLanguage, toggleAutoSync } = themeSlice.actions;
export default themeSlice.reducer;
