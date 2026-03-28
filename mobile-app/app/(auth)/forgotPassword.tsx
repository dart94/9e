import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { API_CONFIG } from '../../src/config/config';
import { useRouter } from 'expo-router';
import { layoutStyles } from '../../src/theme/styles/layoutStyles';
import { textStyles } from '../../src/theme/styles/textStyles';
import { buttonStyles } from '../../src/theme/styles';
import CustomInput from '@/src/components/CustomInput';
import { useToast } from '../../src/context/ToastContext';
import { getErrorMessage } from '../../src/services/errorHandler';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleForgotPassword = async () => {
    if (!email || !validateEmail(email)) {
      setEmailError(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/auth/forgot-password`, { email });
      if (response.status === 200) {
        const msg =
          typeof response.data?.message === 'string'
            ? response.data.message
            : 'Instrucciones enviadas. Revisa tu correo.';
        toast.success(msg);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'No se pudo procesar tu solicitud. Inténtalo de nuevo.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[layoutStyles.container, layoutStyles.center]}>
      <Text style={textStyles.title} accessibilityRole="header">
        Recuperar Contraseña
      </Text>

      <CustomInput
        label="Correo electrónico"
        placeholder="tu@correo.com"
        value={email}
        onChangeText={(t) => { setEmailError(false); setEmail(t); }}
        onBlur={() => { if (!validateEmail(email)) setEmailError(true); }}
        keyboardType="email-address"
        autoCapitalize="none"
        error={emailError}
        errorMessage="Ingresa un correo electrónico válido"
        accessibilityLabel="Campo de correo electrónico para recuperación"
      />

      <TouchableOpacity
        style={[buttonStyles.button, loading && buttonStyles.buttonDisabled]}
        onPress={handleForgotPassword}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel={loading ? 'Enviando instrucciones' : 'Enviar instrucciones de recuperación'}
        accessibilityState={{ disabled: loading }}
      >
        <Text style={buttonStyles.buttonText}>
          {loading ? 'Enviando...' : 'Enviar instrucciones'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={layoutStyles.touchableContainer}
        onPress={() => router.push('/(auth)/login')}
        accessibilityRole="link"
        accessibilityLabel="Volver a iniciar sesión"
      >
        <Text style={textStyles.link}>← Volver al inicio de sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
