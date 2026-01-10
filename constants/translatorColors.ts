/**
 * SnapNot Translator - Apple-Inspired Red Theme Color Palette
 * Design System Colors for Modern UI
 */

export const translatorColors = {
  // Primary Red Colors
  primary: {
    brightRed: '#FF3B30',      // Main CTA, active states
    deepRed: '#D70015',         // Hover states
    softRed: '#FF6B6B',         // Accents, badges
    rosePink: '#FFE5E5',        // Backgrounds, highlights
  },

  // Supporting Colors
  neutral: {
    white: '#FFFFFF',           // Main background
    warmGray: '#F5F5F7',        // Card backgrounds (Apple gray)
    lightGray: '#FAFAFA',       // Subtle backgrounds
    border: '#D2D2D7',          // Dividers, borders
    borderLight: '#E5E5E5',     // Lighter borders
  },

  // Text Colors
  text: {
    dark: '#1D1D1F',            // Primary text (Apple near-black)
    gray: '#86868B',            // Secondary text
    light: '#999999',           // Tertiary text
  },

  // Accent Colors
  accent: {
    successGreen: '#34C759',    // Success states (Apple green)
    warningOrange: '#FF9500',   // Alerts, warnings
    errorRed: '#EF4444',        // Errors
  },

  // Interactive States
  interactive: {
    hover: 'rgba(255, 59, 48, 0.08)',     // Subtle red tint on hover
    pressed: 'rgba(255, 59, 48, 0.12)',   // Pressed state
    focus: 'rgba(255, 59, 48, 0.1)',      // Focus ring/glow
  },

  // Shadows
  shadow: {
    light: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
    heavy: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
    focusRed: '0 0 0 4px rgba(255, 59, 48, 0.1)',
  },
} as const;

// Type-safe color access
export type TranslatorColors = typeof translatorColors;
