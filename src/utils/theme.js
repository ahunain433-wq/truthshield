/**
 * Theme utilities for TruthShield
 * Provides consistent access to design system colors and classes
 */

// Color schemes based on the design system
export const colors = {
  trust: {
    50: 'var(--color-trust-50)',
    100: 'var(--color-trust-100)',
    200: 'var(--color-trust-200)',
    300: 'var(--color-trust-300)',
    400: 'var(--color-trust-400)',
    500: 'var(--color-trust-500)',
    600: 'var(--color-trust-600)',
    700: 'var(--color-trust-700)',
    800: 'var(--color-trust-800)',
    900: 'var(--color-trust-900)',
  },
  verified: {
    50: 'var(--color-verified-50)',
    100: 'var(--color-verified-100)',
    200: 'var(--color-verified-200)',
    300: 'var(--color-verified-300)',
    400: 'var(--color-verified-400)',
    500: 'var(--color-verified-500)',
    600: 'var(--color-verified-600)',
    700: 'var(--color-verified-700)',
    800: 'var(--color-verified-800)',
    900: 'var(--color-verified-900)',
  },
  suspicious: {
    50: 'var(--color-suspicious-50)',
    100: 'var(--color-suspicious-100)',
    200: 'var(--color-suspicious-200)',
    300: 'var(--color-suspicious-300)',
    400: 'var(--color-suspicious-400)',
    500: 'var(--color-suspicious-500)',
    600: 'var(--color-suspicious-600)',
    700: 'var(--color-suspicious-700)',
    800: 'var(--color-suspicious-800)',
    900: 'var(--color-suspicious-900)',
  },
  processing: {
    50: 'var(--color-processing-50)',
    100: 'var(--color-processing-100)',
    200: 'var(--color-processing-200)',
    300: 'var(--color-processing-300)',
    400: 'var(--color-processing-400)',
    500: 'var(--color-processing-500)',
    600: 'var(--color-processing-600)',
    700: 'var(--color-processing-700)',
    800: 'var(--color-processing-800)',
    900: 'var(--color-processing-900)',
  }
};

// Common component classes
export const themeClasses = {
  // Cards
  card: 'bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-lg',
  cardHover: 'hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:border-slate-600/50',

  // Buttons
  btnPrimary: 'btn btn-primary',
  btnSecondary: 'btn btn-secondary',
  btnOutline: 'btn btn-outline',
  btnDanger: 'btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-red-500/25',

  // Form elements
  formInput: 'form-input',
  formLabel: 'form-label',
  formError: 'form-error',

  // Status badges
  badgeVerified: 'badge-verified',
  badgeSuspicious: 'badge-suspicious',
  badgeProcessing: 'badge-processing',
  badgeManipulated: 'badge-manipulated',

  // Gradients
  gradientTrust: 'gradient-trust',
  gradientVerified: 'gradient-verified',
  gradientSuspicious: 'gradient-suspicious',
  gradientProcessing: 'gradient-processing',

  // Common backgrounds
  bgPrimary: 'bg-slate-900/95 backdrop-blur-sm',
  bgSecondary: 'bg-slate-800/50 backdrop-blur-sm',
  bgAccent: 'bg-slate-700/30',

  // Common text colors
  textPrimary: 'text-white',
  textSecondary: 'text-slate-300',
  textMuted: 'text-slate-400',
  textAccent: 'text-[var(--color-trust-400)]',
};

// Status-based styling utilities
export const getStatusColors = (status) => {
  const statusMap = {
    verified: {
      bg: 'bg-[var(--color-verified-900)]',
      text: 'text-[var(--color-verified-300)]',
      border: 'border-[var(--color-verified-700)]',
      icon: 'text-[var(--color-verified-400)]'
    },
    suspicious: {
      bg: 'bg-[var(--color-suspicious-900)]',
      text: 'text-[var(--color-suspicious-300)]',
      border: 'border-[var(--color-suspicious-700)]',
      icon: 'text-[var(--color-suspicious-400)]'
    },
    processing: {
      bg: 'bg-[var(--color-processing-900)]',
      text: 'text-[var(--color-processing-300)]',
      border: 'border-[var(--color-processing-700)]',
      icon: 'text-[var(--color-processing-400)]'
    },
    trust: {
      bg: 'bg-[var(--color-trust-900)]',
      text: 'text-[var(--color-trust-300)]',
      border: 'border-[var(--color-trust-700)]',
      icon: 'text-[var(--color-trust-400)]'
    }
  };

  return statusMap[status] || statusMap.trust;
};

// Confidence score styling
export const getConfidenceColors = (confidence) => {
  if (confidence >= 90) return getStatusColors('verified');
  if (confidence >= 70) return getStatusColors('processing');
  return getStatusColors('suspicious');
};

// Risk level styling
export const getRiskColors = (risk) => {
  if (risk === 'low') return getStatusColors('verified');
  if (risk === 'medium') return getStatusColors('processing');
  return getStatusColors('suspicious');
};
