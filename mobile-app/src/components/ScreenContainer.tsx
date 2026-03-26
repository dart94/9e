import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../theme/theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  centered?: boolean;
  scrollable?: boolean;
  padded?: boolean;
  style?: ViewStyle;
}

export default function ScreenContainer({
  children,
  centered = false,
  scrollable = false,
  padded = true,
  style,
}: ScreenContainerProps) {
  const containerStyle = [
    containerStyles.base,
    padded && containerStyles.padded,
    centered && containerStyles.centered,
    style,
  ];

  const content = scrollable ? (
    <ScrollView
      style={containerStyles.base}
      contentContainerStyle={[padded && containerStyles.padded, centered && containerStyles.centered]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={containerStyle}>{children}</View>
  );

  return (
    <SafeAreaView style={containerStyles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={containerStyles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const containerStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  base: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  padded: {
    padding: SIZES.padding,
    paddingBottom: SIZES.spacingXL + SIZES.spacingLG,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
