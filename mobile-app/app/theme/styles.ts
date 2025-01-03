import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from './theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: SIZES.fontLarge,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: SIZES.margin,
  },
  subtitle: {
    fontSize: SIZES.fontMedium,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SIZES.margin, 
    textAlign: 'center', 
  },
  paragraph: {
    fontSize: SIZES.fontSmall,
    color: COLORS.text,
    marginBottom: SIZES.margin,
    lineHeight: SIZES.lineHeight,
  },
  listItem: {
    fontSize: SIZES.fontSmall,
    color: COLORS.text,
    marginBottom: SIZES.margin / 2,
  },
  errorText: {
    fontSize: SIZES.fontMedium,
    color: COLORS.error || 'red',
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginVertical: SIZES.margin, // Mantén un margen vertical estándar
    width: '100%',
    marginBottom: SIZES.margin * 2, // Aumenta el margen inferior para separar del texto
  },
  input: {
    width: '100%',
    padding: SIZES.padding / 2,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.white,
  },
  button: {
    width: '100%',
    padding: SIZES.padding / 1.5,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    borderRadius: SIZES.borderRadius,
    marginVertical: SIZES.margin,
  },
  buttonDisabled: {
    backgroundColor: COLORS.primary + '88', // Color opaco para botones deshabilitados
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.fontMedium,
    fontWeight: 'bold',
  },
  link: {
    color: COLORS.primaryDark,
    fontSize: SIZES.fontSmall,
    marginTop: SIZES.margin,
    textDecorationLine: 'underline', // Subrayado para destacar el enlace
    alignSelf: 'center', // Asegura que el texto esté centrado
  },
  image: {
    width: '100%', 
    height: 200, 
    resizeMode: 'contain', 
    marginVertical: SIZES.margin, 
  },
  cardTitle: {
    fontSize: SIZES.fontLarge,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: SIZES.margin,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    marginVertical: SIZES.margin / 2,
  },
  infoLabel: {
    fontSize: SIZES.fontMedium,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  infoValue: {
    fontSize: SIZES.fontMedium,
    color: COLORS.text,
    textAlign: 'left',
  },
  floatingButton: {
    position: 'absolute',
    right: SIZES.margin * 2,
    bottom: SIZES.margin * 2,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: COLORS.boxshadow,
    shadowOffset: { width: 0, height: SIZES.shadowOffset },
    shadowOpacity: 0.3,
    shadowRadius: SIZES.shadowOffset,
  },

  // Estilo para el contenedor del modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fondo semitransparente oscuro
  },

  // Estilo para el contenido del modal
  modalContent: {
    backgroundColor: COLORS.white, // Fondo blanco para contraste
    width: '90%',
    maxHeight: '80%',
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    shadowColor: COLORS.boxshadow,
    shadowOffset: { width: 0, height: SIZES.shadowOffset },
    shadowOpacity: 0.3,
    shadowRadius: SIZES.shadowOffset,
    elevation: 10,
    zIndex: 100,
  },

  // Encabezado del modal
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },

  // Título del modal
  modalTitle: {
    fontSize: SIZES.fontLarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  // Botón para cerrar el modal
  closeButton: {
    padding: SIZES.padding / 2,
    backgroundColor: COLORS.error,
    borderRadius: SIZES.borderRadius / 2,
  },

  // Etiqueta general
  label: {
    fontSize: SIZES.fontMedium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.margin / 2,
  },

  // Etiqueta para temas oscuros
  labelLight: {
    fontSize: SIZES.fontMedium,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.margin / 2,
  },
});
