import { ENV } from '../config/env';

export interface GoogleUserPayload {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export const googleAuthService = {
  getWebClientId(): string {
    return ENV.GOOGLE_WEB_CLIENT_ID;
  },

  getAndroidClientId(): string {
    return ENV.GOOGLE_ANDROID_CLIENT_ID;
  },

  async signInWithGoogle(): Promise<{ success: boolean; user?: GoogleUserPayload; error?: string }> {
    try {
      // Auto-linked OAuth client authentication configuration
      const webClientId = this.getWebClientId();
      if (!webClientId || webClientId.includes('your-google')) {
        return { success: false, error: 'Google Client ID not configured.' };
      }

      // Simulated OAuth SSO payload
      const mockUser: GoogleUserPayload = {
        id: `google-usr-${Date.now()}`,
        email: 'rajesh.sharma@gmail.com',
        name: 'Rajesh Sharma',
        picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      };

      return { success: true, user: mockUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google Auth failed' };
    }
  },
};
