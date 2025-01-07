import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { styles } from '../app/theme/styles';
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
    <View style={styles.container}>
      <Text style={styles.title}>Autenticación Biométrica</Text>
      {isBiometricAvailable ? (
        <TouchableOpacity style={styles.button} onPress={handleBiometricAuth}>
        <Ionicons name="finger-print-outline" size={32} color={styles.buttonText.color} />
        <Text style={styles.buttonText}>Ingresar con Huella</Text>
      </TouchableOpacity>
      ) : (
        <Text style={styles.errorText}>
          La autenticación biométrica no está disponible en este dispositivo.
        </Text>
      )}
    </View>
  );
}
