import { StyleSheet } from 'react-native';
import { SIZES, COLORS, FONTS } from '../theme';

export const textStyles = StyleSheet.create({
  title: {
    fontSize: SIZES.fontLarge,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
    color: COLORS.primaryDark,
    marginBottom: SIZES.margin,
  },
  subtitle: {
    fontSize: SIZES.fontMedium,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    color: COLORS.primaryDark,
    marginTop: SIZES.margin,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: SIZES.margin,
    lineHeight: SIZES.lineHeight,
  },
  errorText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.error,
  },
  messageText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.margin,
  },
  successText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.success,
  },
  link: {
    color: COLORS.primaryDark,
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.semiBold,
    marginTop: SIZES.margin,
    textDecorationLine: 'underline',
    alignSelf: 'center',
  },
  infoLabel: {
    fontSize: SIZES.fontMedium,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    color: COLORS.textLight,
  },
  infoValue: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    textAlign: 'left',
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: SIZES.spacingSM / 2,
  },
  label: {
    fontSize: SIZES.fontMedium,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.spacingSM / 2,
  },
  listItem: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: SIZES.spacingSM / 2,
  },
});
