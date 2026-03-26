export const COLORS = {
  // Paleta principal
  primary: '#5FBFAF',         // Verde-azulado suave
  primaryDark: '#3A7669',     // Versión más oscura del primary
  secondary: '#E8F4F2',       // Fondo claro, complementario
  accent: '#FFB366',          // Naranja suave para detalles
  accentDark: '#FF8C1A',      // Naranja acento oscuro

  // Texto
  text: '#080000',            // Casi negro para texto principal
  textLight: '#555555',       // Gris para subtítulos

  // Fondos
  background: '#FAFBFC',      // Fondo principal claro
  backgroundAlt: '#F5F9F8',   // Fondo alternativo
  surface: '#FFFFFF',         // Superficies de cards/modales
  overlay: 'rgba(0, 0, 0, 0.6)', // Backdrop de modales

  // Estados
  success: '#4CAF50',         // Verde para éxito
  error: '#F44336',           // Rojo para errores
  warning: '#FF9800',         // Naranja para advertencias
  danger: '#F44336',          // Alias de error para destructivos

  // Misceláneos
  white: '#FFFFFF',
  border: '#5FBFAF',          // Borde usa primary (no primaryDark)
  boxshadow: 'rgba(95, 191, 175, 0.15)',
  shadowDark: 'rgba(0, 0, 0, 0.1)',

  // Tab bar
  tabBar: '#3A7669',
  tabBarActive: '#FFFFFF',
  tabBarInactive: '#B2D8D2',
};

export const SIZES = {
  // Espaciado
  padding: 16,
  margin: 10,
  spacingXS: 4,
  spacingSM: 8,
  spacingMD: 16,
  spacingLG: 24,
  spacingXL: 32,

  // Border radius
  borderRadiusSmall: 8,
  borderRadius: 12,           // Alias de medium para compatibilidad
  borderRadiusMedium: 12,
  borderRadiusLarge: 16,
  borderRadiusFull: 9999,

  // Tipografía
  fontSmall: 14,
  fontMedium: 18,
  fontLarge: 24,
  fontExtraLarge: 32,

  // Misc
  shadowOffset: 4,
  lineHeight: 22,
};

export const FONTS = {
  regular: 'Nunito_400Regular',
  semiBold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  // Fallback mientras se cargan las fuentes
  primary: 'System',
};
