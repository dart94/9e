// screens/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { API_CONFIG } from '@/src/config/config';
import { layoutStyles } from '@/src/theme/styles/layoutStyles';
import { textStyles } from '@/src/theme/styles/textStyles';
import { buttonStyles } from '@/src/theme/styles/buttonStyles';
import { miscStyles } from '@/src/theme/styles/miscStyles';
import CustomInput from '@/src/components/CustomInput';
import { validateEmail } from '@/utils/validations';
import { forgotPassword } from '@/services/AuthService';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);

const handleForgotPassword = async () => {
  if (!validateEmail(email)) {
    setEmailError(true);
    Alert.alert('Error', 'Por favor ingresa un correo electrónico válido.');
    return;
  }

  setLoading(true);
  try {
    const response = await forgotPassword(email); 
    Alert.alert('Resultado', response.message);   

    // Reset UI en caso de éxito
    setEmail('');
    setEmailError(false);
  } catch (error: any) {
    const message = error?.response?.data?.message || 'No se pudo enviar las instrucciones de recuperación. Inténtalo más tarde.';
    Alert.alert('Error', message);
    console.error('Error en forgotPassword:', error);
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={[layoutStyles.container, layoutStyles.center]}>
      <Text style={textStyles.title}>Recuperar Contraseña</Text>

      <CustomInput
        style={[miscStyles.input, emailError && { borderColor: 'red', borderWidth: 2 }]}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={(text) => {
          setEmailError(false);
          setEmail(text);
        }}
        onBlur={() => {
          if (!validateEmail(email)) setEmailError(true);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        error={emailError}
      />

      <TouchableOpacity
        style={[buttonStyles.button, loading && buttonStyles.buttonDisabled]}
        onPress={handleForgotPassword}
        disabled={loading}
      >
        <Text style={buttonStyles.buttonText}>
          {loading ? 'Enviando...' : 'Enviar instrucciones'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={layoutStyles.touchableContainer}
        onPress={() => router.push('/(auth)/login')}
      >
        <Text style={textStyles.link}>¿Ya tienes una cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
