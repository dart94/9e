import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { API_CONFIG } from '../../src/config/config';
import { useRouter } from 'expo-router';
import { layoutStyles } from '../../src/theme/styles/layoutStyles';
import { textStyles } from '../../src/theme/styles/textStyles';
import { miscStyles } from '../../src/theme/styles/miscStyles';
import { buttonStyles } from '../../src/theme/styles';
import CustomInput from '@/src/components/CustomInput';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const router = useRouter();

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleForgotPassword = async () => {
    if (!email || !validateEmail(email)) {
      setEmailError(true);
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/forgot-password`, { email });
      if (response.status === 200) {
        Alert.alert('Éxito', response.data.message);
      }
    } catch (error) {
      console.error('Error detallado:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          (error.response?.status === 404
            ? 'No se encontró una cuenta con ese correo.'
            : 'Hubo un problema al procesar tu solicitud.');
        Alert.alert('Error', errorMessage);
      } else {
        Alert.alert('Error', 'Ocurrió un error inesperado.');
      }
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
       onPress={() => router.push('/(auth)/login')}>
        <Text style={textStyles.link}>¿Ya tienes una cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
