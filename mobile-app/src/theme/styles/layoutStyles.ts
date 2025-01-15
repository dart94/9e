import { StyleSheet } from 'react-native';
import { SIZES, COLORS } from '../theme';

export const layoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    paddingBottom: 80,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  
});