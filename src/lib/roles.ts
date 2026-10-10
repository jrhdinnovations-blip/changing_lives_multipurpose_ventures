export const ROLE_OVERRIDES: Record<string, string> = {
  'plangnansamson@gmail.com': 'super_admin',
  'bimaeteng4@gmail.com': 'accountant',
};

export function resolveUserRole(
  email?: string | null,
  metaRole?: string | null,
  profileRole?: string | null
): string {
  const userEmail = email?.trim().toLowerCase() || '';
  if (ROLE_OVERRIDES[userEmail]) {
    return ROLE_OVERRIDES[userEmail];
  }
  if (profileRole && profileRole !== 'member') {
    return profileRole;
  }
  if (metaRole && metaRole !== 'member') {
    return metaRole;
  }
  return profileRole || metaRole || 'member';
}
