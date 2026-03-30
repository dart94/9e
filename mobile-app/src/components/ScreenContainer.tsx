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
import { useScreenSize } from '../hooks/useScreenSize';

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
  const { contentMaxWidth, horizontalPadding, isTablet } = useScreenSize();

  const containerStyle = [
    containerStyles.base,
    padded && { padding: horizontalPadding, paddingBottom: SIZES.spacingXL + SIZES.spacingLG },
    centered && containerStyles.centered,
    style,
  ];

  // En tablets, centramos el contenido con un ancho máximo
  const innerWrapperStyle: ViewStyle = isTablet
    ? { width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center' }
    : { flex: 1 };

  const content = scrollable ? (
    <ScrollView
      style={containerStyles.base}
      contentContainerStyle={[
        padded && { padding: horizontalPadding, paddingBottom: SIZES.spacingXL + SIZES.spacingLG },
        centered && containerStyles.centered,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={innerWrapperStyle}>{children}</View>
    </ScrollView>
  ) : (
    <View style={containerStyle}>
      <View style={innerWrapperStyle}>{children}</View>
    </View>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
