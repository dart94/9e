import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import AppButton from './AppButton';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  message: string;
  subMessage?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = 'document-outline',
  message,
  subMessage,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={emptyStyles.container}>
      <Ionicons
        name={icon}
        size={64}
        color={COLORS.secondary}
        accessibilityLabel=""
      />
      <Text style={emptyStyles.message}>{message}</Text>
      {subMessage && <Text style={emptyStyles.subMessage}>{subMessage}</Text>}
      {actionLabel && onAction && (
        <AppButton
          label={actionLabel}
          onPress={onAction}
          style={emptyStyles.button}
        />
      )}
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.spacingXL,
    gap: SIZES.spacingMD,
  },
  message: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.semiBold,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  subMessage: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  button: {
    width: 'auto',
    paddingHorizontal: SIZES.spacingLG,
    marginTop: SIZES.spacingSM,
  },
});
