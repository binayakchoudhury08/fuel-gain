import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ProductDailyEntry } from '../../types';

interface EntryState {
  entries: Record<string, ProductDailyEntry>;
}

const initialState: EntryState = {
  entries: {},
};

export const entrySlice = createSlice({
  name: 'entries',
  initialState,
  reducers: {
    saveProductEntry: (state, action: PayloadAction<ProductDailyEntry>) => {
      const email = (action.payload.userEmail || 'default').toLowerCase().trim();
      const scopedKey = `${email}_${action.payload.date}_${action.payload.productId}`;
      const legacyKey = `${action.payload.date}_${action.payload.productId}`;
      const entryData = { ...action.payload, userEmail: email };
      delete state.entries[legacyKey];
      state.entries[scopedKey] = entryData;
    },
    deleteProductEntry: (state, action: PayloadAction<{ date: string; productId: string; userEmail?: string }>) => {
      const email = (action.payload.userEmail || 'default').toLowerCase().trim();
      delete state.entries[`${email}_${action.payload.date}_${action.payload.productId}`];
      delete state.entries[`${action.payload.date}_${action.payload.productId}`];
    },
    clearAllEntries: (state) => {
      state.entries = {};
    },
    importAllEntries: (state, action: PayloadAction<Record<string, ProductDailyEntry>>) => {
      state.entries = action.payload;
    },
  },
});

export const { saveProductEntry, deleteProductEntry, clearAllEntries, importAllEntries } = entrySlice.actions;
export default entrySlice.reducer;
