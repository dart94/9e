import { StyleSheet } from 'react-native';
import { SIZES, COLORS } from '../theme';

export const miscStyles = StyleSheet.create({
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginVertical: SIZES.margin,
    width: '100%',
    marginBottom: SIZES.margin * 2,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginVertical: SIZES.margin,
  },
  input: {
    width: '100%',
    padding: SIZES.padding / 2,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.white,
    minHeight: 48,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin * 3,
    shadowColor: '#000',
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
