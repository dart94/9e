import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { styles } from './styles';
import { COLORS } from '../theme/theme';

interface CustomInputProps extends TextInputProps {
  error?: boolean; // Agrega un prop opcional para manejar errores
}

const CustomInput: React.FC<CustomInputProps> = ({
  placeholder,
  value,
  onChangeText,
  error,
  style,
  ...props
}) => {
  return (
    <TextInput
      style={[styles.input, error && styles.inputError, style]} // Combina estilos
      placeholder={placeholder}
      placeholderTextColor={COLORS.text} // Usa el color definido para el placeholder
      value={value}
      onChangeText={onChangeText}
      {...props} // Propiedades adicionales
    />
  );
};

export default CustomInput;
