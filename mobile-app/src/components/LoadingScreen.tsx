import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../theme/theme';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Cargando...' }: LoadingScreenProps) {
  return (
    <View style={loadingStyles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={loadingStyles.text}>{message}</Text>
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    gap: SIZES.spacingMD,
  },
  text: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    marginTop: SIZES.spacingSM,
  },
});
