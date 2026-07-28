export type UserRole = 'Owner' | 'Manager' | 'Staff';

export type UserPermission =
  | 'ViewEntries'
  | 'CreateEntries'
  | 'EditEntries'
  | 'DeleteEntries'
  | 'ViewReports'
  | 'GenerateReports'
  | 'DownloadReports'
  | 'ManageSettings'
  | 'ManageUsers';

const ROLE_PERMISSIONS_MAP: Record<UserRole, UserPermission[]> = {
  Owner: [
    'ViewEntries',
    'CreateEntries',
    'EditEntries',
    'DeleteEntries',
    'ViewReports',
    'GenerateReports',
    'DownloadReports',
    'ManageSettings',
    'ManageUsers',
  ],
  Manager: [
    'ViewEntries',
    'CreateEntries',
    'EditEntries',
    'ViewReports',
    'GenerateReports',
    'DownloadReports',
    'ManageSettings',
  ],
  Staff: [
    'ViewEntries',
    'CreateEntries',
    'ViewReports',
    'DownloadReports',
  ],
};

export const rbacService = {
  hasPermission(role: UserRole = 'Owner', permission: UserPermission): boolean {
    const allowed = ROLE_PERMISSIONS_MAP[role] || ROLE_PERMISSIONS_MAP.Owner;
    return allowed.includes(permission);
  },

  getPermissionsForRole(role: UserRole = 'Owner'): UserPermission[] {
    return ROLE_PERMISSIONS_MAP[role] || ROLE_PERMISSIONS_MAP.Owner;
  },
};
