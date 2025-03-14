import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { layoutStyles } from '../src/theme/styles/layoutStyles';
import { textStyles } from '../src/theme/styles/textStyles';
import { buttonStyles } from '../src/theme/styles/buttonStyles';
import { Ionicons } from '@expo/vector-icons';
import { BiometricAuthService } from '../services/BiometricAuthService'; 

export default function BiometricLogin() {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkBiometricSupport = async () => {
      // Verificar soporte biométrico
      const isAvailable = await BiometricAuthService.isBiometricAvailable();
      setIsBiometricAvailable(isAvailable);
      
      // Verificar si hay credenciales almacenadas
      const hasStoredCreds = await BiometricAuthService.hasStoredCredentials();
      setHasCredentials(hasStoredCreds);
    };
    
    checkBiometricSupport();
  }, []);

  const handleBiometricAuth = async () => {
    setLoading(true);
    try {
      const result = await BiometricAuthService.authenticateAndLogin();
      
      if (result.success) {
        // Esperar un momento antes de navegar para asegurar que todo se guardó
        await new Promise(resolve => setTimeout(resolve, 500));
        router.replace('/dashboard');
      } else {
        Alert.alert('Error', result.message || 'No se pudo autenticar');
        if (!hasCredentials) {
          router.replace('/(auth)/login');
        }
      }
    } catch (error) {
      console.error('Error en autenticación biométrica:', error);
      Alert.alert('Error', 'No se pudo autenticar. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isBiometricAvailable || !hasCredentials) {
    // Si no hay soporte biométrico o credenciales, redirigir al login normal
    return (
      <View style={[layoutStyles.container, layoutStyles.center]}>
        <Text style={textStyles.title}>
          {!isBiometricAvailable 
            ? 'La autenticación biométrica no está disponible en este dispositivo.' 
            : 'No hay credenciales guardadas. Por favor inicia sesión.'}
        </Text>
        <TouchableOpacity 
          style={[buttonStyles.button, { marginTop: 20 }]} 
          onPress={() => router.replace('/(auth)/login')}>
          <Text style={buttonStyles.buttonText}>Ir a Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[layoutStyles.container, layoutStyles.center]}>
      <Text style={textStyles.title}>Autenticación Biométrica</Text>
      
      <TouchableOpacity 
        style={[buttonStyles.button, loading && buttonStyles.buttonDisabled]} 
        onPress={handleBiometricAuth}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color={buttonStyles.buttonText.color} />
        ) : (
          <>
            <Ionicons 
              name="finger-print-outline" 
              size={32} 
              color={buttonStyles.buttonText.color} 
              style={{ marginRight: 8 }} 
            />
            <Text style={buttonStyles.buttonText}>Ingresar con Huella</Text>
          </>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={{ marginTop: 20 }} 
        onPress={() => router.replace('/(auth)/login')}
        disabled={loading}>
        <Text style={textStyles.link}>Usar otro método de inicio de sesión</Text>
      </TouchableOpacity>
    </View>
  );
}