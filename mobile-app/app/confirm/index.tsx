// app/confirm/index.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Button } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { API_CONFIG } from '../../src/config/config';
import { layoutStyles } from '../../src/theme/styles/layoutStyles';
import { textStyles } from '../../src/theme/styles/textStyles';

const ConfirmEmail = () => {
  const router = useRouter();
  const { status } = useLocalSearchParams(); // Obtiene el parámetro 'status' de la URL
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    switch (status) {
      case 'success':
        setMessage('¡Tu cuenta ha sido confirmada exitosamente!');
        break;
      case 'invalid_or_expired':
        setMessage('El enlace de confirmación es inválido o ha expirado.');
        break;
      case 'user_not_found':
        setMessage('Usuario no encontrado.');
        break;
      case 'error':
        setMessage('Ocurrió un error al confirmar tu cuenta.');
        break;
      case 'already_verified':
        setMessage('Tu cuenta ya ha sido verificada.');
        break;
      default:
        setMessage('Estado de confirmación desconocido.');
    }
  }, [status]);

  const handleLogin = () => {
    router.replace('/(auth)/login'); // Navega al inicio de sesión
  };

  return (
    <View style={layoutStyles.container}>
      <Text style={textStyles.messageText}>{message}</Text>
      {status === 'success' && (
        <Button title="Iniciar Sesión" onPress={handleLogin} />
      )}
    </View>
  );
};



export default ConfirmEmail;
