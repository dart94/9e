import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../theme/theme';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: boolean;
  errorMessage?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  errorMessage,
  style,
  ...props
}) => {
  return (
    <View style={inputStyles.wrapper}>
      {label && <Text style={inputStyles.label}>{label}</Text>}
      <TextInput
        style={[inputStyles.input, error && inputStyles.inputError, style]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textLight}
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
      {error && errorMessage && (
        <Text style={inputStyles.errorText}>{errorMessage}</Text>
      )}
    </View>
  );
};

const inputStyles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: SIZES.margin,
  },
  label: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: SIZES.spacingXS,
  },
  input: {
    width: '100%',
    padding: SIZES.spacingSM,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.surface,
    minHeight: 48,
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    marginTop: SIZES.spacingXS,
  },
});

export default CustomInput;
