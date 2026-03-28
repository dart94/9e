import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  Animated,
} from 'react-native';
import { haptics } from '../services/haptics';
import { COLORS, SIZES, FONTS } from '../theme/theme';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps {
  onPress: () => void;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export default function AppButton({
  onPress,
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  accessibilityLabel,
}: AppButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, tension: 200, friction: 10 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 10 }).start();
  };

  const handlePress = () => {
    haptics.impact();
    onPress();
  };

  const isDisabled = disabled || loading;

  return (
    <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
    <TouchableOpacity
      style={[
        btnStyles.base,
        variant === 'primary' && btnStyles.primary,
        variant === 'secondary' && btnStyles.secondary,
        variant === 'destructive' && btnStyles.destructive,
        variant === 'ghost' && btnStyles.ghost,
        size === 'sm' && btnStyles.size_sm,
        size === 'lg' && btnStyles.size_lg,
        isDisabled && btnStyles.disabled,
        style,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'ghost' || variant === 'secondary' ? COLORS.primaryDark : COLORS.white}
        />
      ) : (
        <View style={btnStyles.inner}>
          {icon && <View style={btnStyles.iconWrapper}>{icon}</View>}
          <Text style={[
            btnStyles.text,
            variant === 'primary' && btnStyles.text_primary,
            variant === 'secondary' && btnStyles.text_secondary,
            variant === 'destructive' && btnStyles.text_destructive,
            variant === 'ghost' && btnStyles.text_ghost,
            textStyle,
          ]}>
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
    </Animated.View>
  );
}

const btnStyles = StyleSheet.create({
  base: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.borderRadius,
    marginVertical: SIZES.spacingSM,
    minHeight: 48,
  },
  // Variantes
  primary: {
    backgroundColor: COLORS.primaryDark,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.primaryDark,
  },
  destructive: {
    backgroundColor: COLORS.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  // Tamaños
  size_sm: {
    paddingHorizontal: SIZES.spacingMD,
    paddingVertical: SIZES.spacingSM,
    minHeight: 40,
  },
  size_md: {
    paddingHorizontal: SIZES.spacingMD,
    paddingVertical: SIZES.spacingMD / 1.5,
  },
  size_lg: {
    paddingHorizontal: SIZES.spacingLG,
    paddingVertical: SIZES.spacingMD,
  },
  // Texto por variante
  text: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
  },
  text_primary: {
    color: COLORS.white,
  },
  text_secondary: {
    color: COLORS.primaryDark,
  },
  text_destructive: {
    color: COLORS.white,
  },
  text_ghost: {
    color: COLORS.primaryDark,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    marginRight: SIZES.spacingSM,
  },
});
