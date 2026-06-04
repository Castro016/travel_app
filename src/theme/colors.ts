export const colors = {
  primary: '#4F46E5', // Indigo
  primaryLight: '#EEF2FF',
  secondary: '#64748B', // Slate
  background: '#F8FAFC', // Slate 50 (Very light gray/blue)
  card: '#FFFFFF',
  border: '#E2E8F0', // Slate 200
  text: {
    primary: '#0F172A', // Slate 900
    secondary: '#475569', // Slate 600
    muted: '#94A3B8', // Slate 400
    light: '#FFFFFF',
  },
  success: '#10B981', // Emerald
  successLight: '#ECFDF5',
  danger: '#EF4444', // Red
  dangerLight: '#FEF2F2',
  warning: '#F59E0B', // Amber
  warningLight: '#FEF3C7',
  info: '#3B82F6', // Blue
  infoLight: '#EFF6FF',
  
  // Gradientes premium para os cards de viagem
  gradients: {
    purpleIndigo: ['#6366F1', '#4F46E5'] as [string, string],
    coralOrange: ['#FF6B6B', '#FF8E53'] as [string, string],
    emeraldTeal: ['#10B981', '#059669'] as [string, string],
    oceanBlue: ['#0EA5E9', '#2563EB'] as [string, string],
    rosePink: ['#EC4899', '#BE185D'] as [string, string],
    slateDark: ['#334155', '#1E293B'] as [string, string],
  }
};

export type ThemeColors = typeof colors;
