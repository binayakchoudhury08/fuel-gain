import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ProductDailyEntry } from '../../types';

interface EntryState {
  entries: Record<string, ProductDailyEntry>; // Key format: `${date}_${productId}`
}

const initialState: EntryState = {
  entries: {},
};

export const entrySlice = createSlice({
  name: 'entries',
  initialState,
  reducers: {
    saveProductEntry: (state, action: PayloadAction<ProductDailyEntry>) => {
      const entryKey = `${action.payload.date}_${action.payload.productId}`;
      state.entries[entryKey] = action.payload;
    },
    deleteProductEntry: (state, action: PayloadAction<{ date: string; productId: string }>) => {
      const entryKey = `${action.payload.date}_${action.payload.productId}`;
      delete state.entries[entryKey];
    },
    importAllEntries: (state, action: PayloadAction<Record<string, ProductDailyEntry>>) => {
      state.entries = action.payload;
    },
  },
});

export const { saveProductEntry, deleteProductEntry, importAllEntries } = entrySlice.actions;
export default entrySlice.reducer;
