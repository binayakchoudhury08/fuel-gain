import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserProfile, DipChartFile, PetrolCompanyCode, TankConfig } from '../../types';
import { accountStorage } from '../accountStorage';

interface UserState {
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  rememberMe: boolean;
  loading: boolean;
}

const initialState: UserState = {
  profile: null,
  isAuthenticated: false,
  isOnboarded: false,
  rememberMe: true,
  loading: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.profile = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isOnboarded = action.payload?.isOnboarded ?? !!action.payload?.pumpName;
      if (action.payload && action.payload.isOnboarded) {
        accountStorage.saveAccountProfile(action.payload);
      }
    },
    updatePersonalDetails: (state, action: PayloadAction<{ fullName: string; email?: string; avatarUrl?: string; isExistingUser?: boolean }>) => {
      const targetEmail = action.payload.email || state.profile?.email || 'user@fuelpump.com';
      const savedAccount = accountStorage.getAccountProfile(targetEmail);

      if (savedAccount) {
        // Restore full saved station setup for this user email
        state.profile = {
          ...savedAccount,
          fullName: action.payload.fullName || savedAccount.fullName,
          email: targetEmail,
          avatarUrl: action.payload.avatarUrl || savedAccount.avatarUrl,
          isOnboarded: true,
        };
        state.isOnboarded = true;
      } else if (state.profile) {
        state.profile.fullName = action.payload.fullName;
        if (action.payload.email) state.profile.email = action.payload.email;
        if (action.payload.avatarUrl) state.profile.avatarUrl = action.payload.avatarUrl;
        state.profile.isOnboarded = state.profile.isOnboarded || !!state.profile.pumpName;
        state.isOnboarded = state.profile.isOnboarded;
      } else {
        state.profile = {
          id: `usr-${Date.now()}`,
          email: targetEmail,
          fullName: action.payload.fullName,
          avatarUrl: action.payload.avatarUrl,
          isOnboarded: action.payload.isExistingUser ?? false,
        };
        state.isOnboarded = state.profile.isOnboarded;
      }

      state.isAuthenticated = true;
      if (state.profile && state.profile.isOnboarded) {
        accountStorage.saveAccountProfile(state.profile);
      }
    },
    updatePumpDetails: (state, action: PayloadAction<{ pumpName: string; pumpCompany: PetrolCompanyCode; pumpAddress?: string }>) => {
      if (state.profile) {
        state.profile.pumpName = action.payload.pumpName;
        state.profile.pumpCompany = action.payload.pumpCompany;
        state.profile.pumpAddress = action.payload.pumpAddress;
        accountStorage.saveAccountProfile(state.profile);
      }
    },
    updateSelectedProducts: (state, action: PayloadAction<string[]>) => {
      if (state.profile) {
        state.profile.selectedProductIds = action.payload;
        accountStorage.saveAccountProfile(state.profile);
      }
    },
    updateTankConfigs: (state, action: PayloadAction<TankConfig[]>) => {
      if (state.profile) {
        state.profile.tankConfigs = action.payload;
        accountStorage.saveAccountProfile(state.profile);
      }
    },
    updateNozzleCounts: (state, action: PayloadAction<Record<string, number>>) => {
      if (state.profile) {
        state.profile.nozzleCounts = {
          ...(state.profile.nozzleCounts || {}),
          ...action.payload,
        };
        accountStorage.saveAccountProfile(state.profile);
      }
    },
    addDipChart: (state, action: PayloadAction<DipChartFile>) => {
      if (state.profile) {
        if (!state.profile.dipChartsUploaded) {
          state.profile.dipChartsUploaded = {};
        }
        state.profile.dipChartsUploaded[action.payload.productId] = action.payload;
        accountStorage.saveAccountProfile(state.profile);
      }
    },
    completeOnboarding: (state) => {
      if (state.profile) {
        state.profile.isOnboarded = true;
        accountStorage.saveAccountProfile(state.profile);
      }
      state.isOnboarded = true;
    },
    setRememberMe: (state, action: PayloadAction<boolean>) => {
      state.rememberMe = action.payload;
    },
    logout: (state) => {
      if (state.profile && state.profile.isOnboarded) {
        accountStorage.saveAccountProfile(state.profile);
      }
      state.isAuthenticated = false;
      // Preserve current user profile so re-logging in automatically remembers the account
    },
  },
});

export const {
  setProfile,
  updatePersonalDetails,
  updatePumpDetails,
  updateSelectedProducts,
  updateTankConfigs,
  updateNozzleCounts,
  addDipChart,
  completeOnboarding,
  setRememberMe,
  logout,
} = userSlice.actions;

export default userSlice.reducer;
