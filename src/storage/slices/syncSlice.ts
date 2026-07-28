import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type SyncStatusMode = 'synced' | 'syncing' | 'offline' | 'pending';

interface SyncState {
  status: SyncStatusMode;
  isOnline: boolean;
  pendingQueueCount: number;
  lastSyncedAt: string | null;
}

const initialState: SyncState = {
  status: 'synced',
  isOnline: navigator.onLine ?? true,
  pendingQueueCount: 0,
  lastSyncedAt: new Date().toISOString(),
};

export const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      if (!action.payload) {
        state.status = 'offline';
      } else if (state.pendingQueueCount > 0) {
        state.status = 'pending';
      } else {
        state.status = 'synced';
      }
    },
    setSyncStatus: (state, action: PayloadAction<SyncStatusMode>) => {
      state.status = action.payload;
      if (action.payload === 'synced') {
        state.lastSyncedAt = new Date().toISOString();
      }
    },
    setQueueCount: (state, action: PayloadAction<number>) => {
      state.pendingQueueCount = action.payload;
    },
  },
});

export const { setOnlineStatus, setSyncStatus, setQueueCount } = syncSlice.actions;
export default syncSlice.reducer;
