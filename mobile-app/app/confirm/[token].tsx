import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Button, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { API_CONFIG } from '../../src/config/config';
import { layoutStyles } from '../../src/theme/styles/layoutStyles';
import { textStyles } from '../../src/theme/styles/textStyles';

const ConfirmEmail = () => {
  const router = useRouter();
  const { token } = useLocalSearchParams(); // Obtiene el token de la URL
  const [status, setStatus] = useState<'confirming' | 'success' | 'error'>('confirming');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/confirm_email/${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Cuenta confirmada exitosamente.');
      } catch (error: any) {
        setStatus('error');
        if (error.response && error.response.data && error.response.data.error) {
          setMessage(error.response.data.error);
        } else {
          setMessage('Ocurrió un error al confirmar la cuenta.');
        }
      }
    };

    if (token) {
      confirmEmail();
    } else {
      setStatus('error');
      setMessage('Token de confirmación no proporcionado.');
    }
  }, [token]);

  const handleLogin = () => {
    router.replace('/(auth)/login'); // Ajusta según tu estructura de rutas
  };

  return (
    <View style={layoutStyles.container}>
      {status === 'confirming' && <ActivityIndicator size="large" color="#0000ff" />}
      {status === 'success' && (
        <>
          <Text style={textStyles.successText}>{message}</Text>
          <Button title="Iniciar Sesión" onPress={handleLogin} />
        </>
      )}
      {status === 'error' && <Text style={textStyles.errorText}>{message}</Text>}
    </View>
  );
};
