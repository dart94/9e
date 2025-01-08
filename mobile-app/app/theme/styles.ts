import { StyleSheet, Platform } from 'react-native';
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

  linkContainer: {
    marginTop: SIZES.margin,
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
    padding: 20, // Asegura espacio para dispositivos pequeños
  },
  
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    borderRadius: Platform.OS === 'ios' ? 20 : 10, // Diferente para iOS y Android
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Para sombras en Android
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

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#4CAF50', // Verde para editar
    padding: 10,
    marginRight: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#F44336', // Rojo para eliminar
    padding: 10,
    marginLeft: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  biometricButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '80%',
  },
  biometricButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  marginBottom: {
    marginBottom: 20,
  },
});


