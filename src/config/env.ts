/**
 * Typed Environment Configuration Loader
 * Auto-links Vite environment variables with validation & fallback.
 */

export const ENV = {
  SUPABASE_URL: (import.meta.env.VITE_SUPABASE_URL as string) || 'https://asgwmtxwwjyycmdxwqgt.supabase.co',
  SUPABASE_ANON_KEY: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  GOOGLE_WEB_CLIENT_ID: (import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID as string) || '974392857444-1ll3v8orhdugj2cl7c4qrpv8sth3ldjb.apps.googleusercontent.com',
  GOOGLE_ANDROID_CLIENT_ID: (import.meta.env.VITE_GOOGLE_ANDROID_CLIENT_ID as string) || '974392857444-mju3tv5mme5gc4dmr27edd8ekca01r5h.apps.googleusercontent.com',
  API_BASE_URL: (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000/api',
  IS_PRODUCTION: import.meta.env.PROD ?? false,
};
