import { StyleSheet } from 'react-native';
import { SIZES, COLORS } from '../theme';

export const modalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: COLORS.overlay,
    padding: SIZES.spacingMD,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    width: '90%',
    maxHeight: '80%',
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.spacingMD,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
    justifyContent: 'space-between',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  modalTitle: {
    fontSize: SIZES.fontLarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});
