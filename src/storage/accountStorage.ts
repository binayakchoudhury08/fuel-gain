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

  /**
   * Save daily entries specifically for a user email
   */
  saveUserEntries(email: string, entries: Record<string, any>): void {
    if (!email) return;
    try {
      const emailKey = email.trim().toLowerCase();
      const storageKey = `fuel_gain_entries_${emailKey}`;
      localStorage.setItem(storageKey, JSON.stringify(entries));
    } catch {
      // LocalStorage quota exceeded or disabled
    }
  },

  /**
   * Load daily entries specifically for a user email
   */
  getUserEntries(email: string): Record<string, any> {
    if (!email) return {};
    try {
      const emailKey = email.trim().toLowerCase();
      const storageKey = `fuel_gain_entries_${emailKey}`;
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },
};
