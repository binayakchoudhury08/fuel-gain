import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import themeReducer from './slices/themeSlice';
import entryReducer from './slices/entrySlice';
import syncReducer from './slices/syncSlice';

const LOCAL_STORAGE_KEY = 'fuel_gain_app_state_v2';

// Helper to load persisted state from localStorage
const loadPersistedState = () => {
  try {
    const serialized = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!serialized) return undefined;
    const parsed = JSON.parse(serialized);
    return parsed;
  } catch {
    return undefined;
  }
};

// Helper to save state to localStorage
const savePersistedState = (state: { user?: unknown; theme?: unknown; entries?: unknown }) => {
  try {
    const stateToSave = {
      user: state.user,
      theme: state.theme,
      entries: state.entries,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
  } catch {
    // LocalStorage quota exceeded or disabled
  }
};

const preloadedState = loadPersistedState();

export const store = configureStore({
  reducer: {
    user: userReducer,
    theme: themeReducer,
    entries: entryReducer,
    sync: syncReducer,
  },
  preloadedState,
} as any);

// Auto-subscribe to store changes to save state permanently in LocalStorage
store.subscribe(() => {
  savePersistedState(store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
