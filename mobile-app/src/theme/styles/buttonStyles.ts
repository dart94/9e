import { StyleSheet } from 'react-native';
import { SIZES, COLORS } from '../theme';

export const buttonStyles = StyleSheet.create({
  button: {
    width: '100%',
    padding: SIZES.padding / 1.5,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    borderRadius: SIZES.borderRadius,
    marginVertical: SIZES.margin,
    minHeight: 48,
  },
  buttonDisabled: {
    backgroundColor: COLORS.primary + '88',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.fontMedium,
    fontWeight: 'bold',
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
  deleteButton: {
    flex: 1,
    backgroundColor: '#F44336', // Rojo para eliminar
    padding: 10,
    marginLeft: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
});
