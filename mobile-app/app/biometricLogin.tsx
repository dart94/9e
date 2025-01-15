import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { layoutStyles } from '../src/theme/styles/layoutStyles';
import { textStyles } from '../src/theme/styles/textStyles';
import { buttonStyles } from '../src/theme/styles/buttonStyles';
import { Ionicons } from '@expo/vector-icons';

export default function BiometricLogin() {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkBiometricSupport = async () => {
      const isCompatible = await LocalAuthentication.hasHardwareAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      setIsBiometricAvailable(isCompatible && types.length > 0);
    };

    checkBiometricSupport();
  }, []);

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autenticación Biométrica',
        fallbackLabel: 'Usar Contraseña',
        disableDeviceFallback: true,
      });

      if (result.success) {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          Alert.alert('Éxito', 'Autenticado con huella.');
          router.replace('/dashboard');
        } else {
          Alert.alert('Error', 'No se encontraron credenciales. Por favor, inicia sesión.');
          router.replace('/(auth)/login');
        }
      } else {
        Alert.alert('Error', 'Autenticación cancelada.');
      }
    } catch (error) {
      console.error('Error en autenticación biométrica:', error);
      Alert.alert('Error', 'No se pudo autenticar. Intenta nuevamente.');
    }
  };

  return (
    <View style={layoutStyles.container}>
      <Text style={textStyles.title}>Autenticación Biométrica</Text>
      {isBiometricAvailable ? (
        <TouchableOpacity style={buttonStyles.button} onPress={handleBiometricAuth}>
          <Ionicons name="finger-print-outline" size={32} color={buttonStyles.buttonText.color} />
          <Text style={buttonStyles.buttonText}>Ingresar con Huella</Text>
        </TouchableOpacity>
      ) : (
        <Text style={textStyles.errorText}>
          La autenticación biométrica no está disponible en este dispositivo.
        </Text>
      )}
    </View>
  );
}
