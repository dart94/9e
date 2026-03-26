import { StyleSheet } from 'react-native';
import { SIZES, COLORS } from '../theme';

export const miscStyles = StyleSheet.create({
  progressBar: {
    height: 10,
    borderRadius: SIZES.borderRadiusSmall,
    marginVertical: SIZES.margin,
    width: '100%',
    marginBottom: SIZES.spacingLG,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginVertical: SIZES.margin,
  },
  input: {
    width: '100%',
    padding: SIZES.spacingSM,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.surface,
    minHeight: 48,
    fontSize: SIZES.fontSmall,
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin * 3,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    paddingBottom: SIZES.margin,
  },
  cardTitle: {
    fontSize: SIZES.fontLarge,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: SIZES.margin,
    textAlign: 'center',
  },
});
