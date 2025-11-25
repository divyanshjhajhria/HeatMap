/**
 * Theme colors for light and dark modes
 * Prime Video inspired color scheme
 */

export const lightTheme = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  primary: '#00A8E1', // Prime Video blue
  primaryDark: '#0073AA',
  secondary: '#1A1A1A',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
  error: '#E50914', // Netflix red (for errors)
  success: '#00C853',
  card: '#FFFFFF',
  cardHover: '#F9F9F9',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

export const darkTheme = {
  background: '#0A0A0A',
  surface: '#1A1A1A',
  primary: '#00A8E1',
  primaryDark: '#0073AA',
  secondary: '#FFFFFF',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textTertiary: '#808080',
  border: '#333333',
  error: '#E50914',
  success: '#00C853',
  card: '#1A1A1A',
  cardHover: '#252525',
  shadow: 'rgba(0, 0, 0, 0.5)',
};

export type Theme = typeof lightTheme;

