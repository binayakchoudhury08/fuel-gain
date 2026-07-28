import type { UserProfile, AppSettings, ProductDailyEntry } from '../types';

export interface BackupDataPayload {
  version: string;
  timestamp: string;
  profile: UserProfile | null;
  settings: AppSettings;
  entries: Record<string, ProductDailyEntry>;
}

export function generateBackupJson(
  profile: UserProfile | null,
  settings: AppSettings,
  entries: Record<string, ProductDailyEntry>
): string {
  const payload: BackupDataPayload = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    profile,
    settings,
    entries,
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadBackupFile(jsonString: string, fileName?: string) {
  const dateStr = new Date().toISOString().split('T')[0];
  const name = fileName || `FuelGain_Backup_${dateStr}.json`;
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseAndValidateBackup(jsonString: string): BackupDataPayload {
  const parsed = JSON.parse(jsonString);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid backup file format.');
  }
  if (!parsed.version && !parsed.entries) {
    throw new Error('Missing essential data fields in backup payload.');
  }
  return parsed as BackupDataPayload;
}
