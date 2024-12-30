import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from './theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.fontLarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.margin * 2,
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
    padding: SIZES.padding,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    marginVertical: SIZES.margin,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.fontMedium,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: COLORS.primaryDark, // Asegúrate de que esta propiedad exista en `theme`
  },
});
