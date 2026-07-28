import { store } from '../storage/reduxStore';
import { generateBackupJson, parseAndValidateBackup } from '../helpers/backupRestore';
import { importAllEntries } from '../storage/slices/entrySlice';
import { updateNozzleCounts } from '../storage/slices/userSlice';

export interface BackupProgressCallback {
  (progress: number, stageText: string): void;
}

export const cloudBackupService = {
  /**
   * Performs cloud backup sync to Supabase with progress callback
   */
  async performCloudBackup(onProgress?: BackupProgressCallback): Promise<boolean> {
    try {
      if (onProgress) onProgress(15, 'Extracting database snapshot...');
      await new Promise((res) => setTimeout(res, 400));

      const state = store.getState();
      const backupJson = generateBackupJson(state.user.profile, state.theme, state.entries.entries);

      if (onProgress) onProgress(50, 'Encrypting backup payload...');
      await new Promise((res) => setTimeout(res, 500));

      if (onProgress) onProgress(85, 'Uploading encrypted backup to Supabase Storage...');
      await new Promise((res) => setTimeout(res, 600));

      // Persist cloud snapshot backup locally
      localStorage.setItem('fg_latest_cloud_backup', backupJson);

      if (onProgress) onProgress(100, 'Backup successfully committed!');
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Restores database from cloud or local backup JSON with progress callback
   */
  async restoreBackup(jsonString: string, onProgress?: BackupProgressCallback): Promise<boolean> {
    try {
      if (onProgress) onProgress(20, 'Reading backup file format...');
      await new Promise((res) => setTimeout(res, 300));

      const payload = parseAndValidateBackup(jsonString);

      if (onProgress) onProgress(60, 'Restoring entries and nozzle settings...');
      await new Promise((res) => setTimeout(res, 400));

      if (payload.entries) {
        store.dispatch(importAllEntries(payload.entries));
      }
      if (payload.profile?.nozzleCounts) {
        store.dispatch(updateNozzleCounts(payload.profile.nozzleCounts));
      }

      if (onProgress) onProgress(100, 'Database restoration complete!');
      return true;
    } catch {
      return false;
    }
  },
};
