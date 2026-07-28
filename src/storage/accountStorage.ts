import type { UserProfile } from '../types';

const ACCOUNTS_STORAGE_KEY = 'fuel_gain_accounts_v2';

export const accountStorage = {
  /**
   * Save a user profile indexed by lowercase email
   */
  saveAccountProfile(profile: UserProfile): void {
    if (!profile.email) return;
    try {
      const emailKey = profile.email.trim().toLowerCase();
      const existingAccountsStr = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      const accounts: Record<string, UserProfile> = existingAccountsStr ? JSON.parse(existingAccountsStr) : {};

      accounts[emailKey] = {
        ...profile,
        isOnboarded: true,
      };

      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
      console.info(`Saved account profile for ${emailKey} in LocalStorage registry.`);
    } catch (err) {
      console.warn('Failed to save account profile to registry:', err);
    }
  },

  /**
   * Retrieve a saved user profile by email
   */
  getAccountProfile(email: string): UserProfile | null {
    if (!email) return null;
    try {
      const emailKey = email.trim().toLowerCase();
      const existingAccountsStr = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (!existingAccountsStr) return null;

      const accounts: Record<string, UserProfile> = JSON.parse(existingAccountsStr);
      return accounts[emailKey] || null;
    } catch (err) {
      console.warn('Failed to load account profile from registry:', err);
      return null;
    }
  },

  /**
   * Get all registered accounts
   */
  getAllAccounts(): Record<string, UserProfile> {
    try {
      const existingAccountsStr = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      return existingAccountsStr ? JSON.parse(existingAccountsStr) : {};
    } catch {
      return {};
    }
  },
};
