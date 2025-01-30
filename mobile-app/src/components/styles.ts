import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../theme/theme'; 

export const styles = StyleSheet.create({
  input: {
    width: '100%',
    padding: SIZES.padding / 2,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.white,
    minHeight: 48,
    fontSize: 16,
  },
  inputError: {
    borderColor: COLORS.error, // Color rojo para errores
  },
  placeholderTextColor: {
    color: COLORS.text, // Color del placeholder
  },
});
