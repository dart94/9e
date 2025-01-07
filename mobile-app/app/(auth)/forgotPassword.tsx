import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { styles } from '../theme/styles';
import axios from 'axios';
import { API_CONFIG } from '../config/config';
import { useRouter } from 'expo-router';

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
    <View style={[styles.container, styles.center]}>
      <Text style={styles.title}>Recuperar Contraseña</Text>
      <TextInput
        style={[styles.input, emailError && { borderColor: 'red', borderWidth: 2 }]}
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
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleForgotPassword}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Enviando...' : 'Enviar instrucciones'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.link}>¿Ya tienes una cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
