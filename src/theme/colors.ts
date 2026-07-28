// Material Design 3 Design System - Color Palette
// Primary: Royal Blue, Secondary: Sky Blue, Accent/Success: Green, Warning: Orange, Error: Red

export const LightThemeColors = {
  primary: '#1E40AF',        // Royal Blue
  primaryGradient: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
  primaryContainer: '#DBEAFE',
  onPrimary: '#FFFFFF',
  
  secondary: '#0EA5E9',      // Sky Blue
  secondaryGradient: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
  secondaryContainer: '#E0F2FE',
  onSecondary: '#FFFFFF',

  accent: '#10B981',         // Green
  accentGradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',

  success: '#10B981',        // Green
  warning: '#F59E0B',        // Orange
  error: '#EF4444',          // Red
  errorContainer: '#FEE2E2',

  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  cards: '#F8FAFC',
  cardBorder: '#E2E8F0',
  
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',

  divider: '#E2E8F0',
  shadowColor: 'rgba(30, 64, 175, 0.08)',
  glassBackground: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
};

export const DarkThemeColors = {
  primary: '#3B82F6',        // Vibrant Blue
  primaryGradient: 'linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)',
  primaryContainer: '#1E3A8A',
  onPrimary: '#FFFFFF',

  secondary: '#38BDF8',      // Bright Sky Blue
  secondaryGradient: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
  secondaryContainer: '#075985',
  onSecondary: '#FFFFFF',

  accent: '#34D399',         // Vibrant Emerald
  accentGradient: 'linear-gradient(135deg, #059669 0%, #34D399 100%)',

  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  errorContainer: '#7F1D1D',

  background: '#0F172A',     // Dark Slate
  surface: '#1E293B',
  surfaceVariant: '#334155',
  cards: '#1E293B',
  cardBorder: '#334155',

  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',

  divider: '#334155',
  shadowColor: 'rgba(0, 0, 0, 0.4)',
  glassBackground: 'rgba(30, 41, 59, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
};

export type ThemeColors = typeof LightThemeColors;
