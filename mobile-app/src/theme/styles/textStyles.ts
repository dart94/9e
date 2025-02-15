import { StyleSheet } from 'react-native';
import { SIZES, COLORS } from '../theme';

export const textStyles = StyleSheet.create({
  title: {
    fontSize: SIZES.fontLarge,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: SIZES.margin,
  },
  subtitle: {
    fontSize: SIZES.fontMedium,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginTop: SIZES.margin,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: SIZES.fontSmall,
    color: COLORS.text,
    marginBottom: SIZES.margin,
    lineHeight: SIZES.lineHeight,
  },
  errorText: {
    fontSize: SIZES.fontMedium,
    color: COLORS.error || 'red',
  },
  messageText: {
    fontSize: SIZES.fontMedium,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.margin,
  },
  successText: {
    fontSize: SIZES.fontMedium,
    color: COLORS.success || 'green',
  },
  link: {
    color: COLORS.primaryDark,
    fontSize: SIZES.fontSmall,
    marginTop: SIZES.margin,
    textDecorationLine: 'underline',
    alignSelf: 'center',
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
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: SIZES.margin / 2,
  },
  label: {
    fontSize: SIZES.fontMedium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.margin / 2,
  },
  listItem: {
    fontSize: SIZES.fontSmall,
    color: COLORS.text,
    marginBottom: SIZES.margin / 2,
  },
});
