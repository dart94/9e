// archivo: BiometricAuthService.ts
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_CONFIG } from '../src/config/config'; 

export class BiometricAuthService {
  // Verifica si el dispositivo soporta autenticación biométrica
  static async isBiometricAvailable(): Promise<boolean> {
    try {
      const isCompatible = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return isCompatible && isEnrolled;
    } catch (error) {
      console.error('Error al verificar soporte biométrico:', error);
      return false;
    }
  }

  // Verifica si hay credenciales guardadas para autenticación biométrica
  static async hasStoredCredentials(): Promise<boolean> {
    try {
      const email = await SecureStore.getItemAsync('userEmail');
      const isGoogleAuth = await SecureStore.getItemAsync('isGoogleAuth') === 'true';
      
      if (isGoogleAuth) {
        const token = await SecureStore.getItemAsync('userToken');
        return !!email && !!token;
      } else {
        const password = await SecureStore.getItemAsync('userPassword');
        return !!email && !!password;
      }
    } catch (error) {
      console.error('Error al verificar credenciales almacenadas:', error);
      return false;
    }
  }

  // Autenticación biométrica completa (verifica, autentica y hace login)
  static async authenticateAndLogin(): Promise<{success: boolean, message?: string, data?: any}> {
    try {
      // 1. Verificar que existan credenciales almacenadas
      const hasCredentials = await this.hasStoredCredentials();
      if (!hasCredentials) {
        return {
          success: false,
          message: 'No hay credenciales guardadas. Por favor inicia sesión manualmente.'
        };
      }

      // 2. Realizar autenticación biométrica
      const biometricResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Iniciar sesión con biometría',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
        fallbackLabel: 'Usar contraseña',
      });

      if (!biometricResult.success) {
        return {
          success: false,
          message: biometricResult.error 
            ? `Error de autenticación: ${biometricResult.error}` 
            : 'Autenticación cancelada'
        };
      }

      // 3. Determinar el tipo de autenticación y obtener credenciales
      const email = await SecureStore.getItemAsync('userEmail');
      const isGoogleAuth = await SecureStore.getItemAsync('isGoogleAuth') === 'true';
      
      try {
        if (isGoogleAuth) {
          // Para autenticación con Google
          const token = await SecureStore.getItemAsync('userToken');
          
          // Verificar token de Google o realizar una autenticación silenciosa
          // Esto dependerá de tu implementación específica en el backend
          const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/google/validate`, {
            email,
            token
          });
          
          if (response.status === 200) {
            const { id, username, token: newToken } = response.data;
            
            // Guardar datos del usuario
            await Promise.all([
              AsyncStorage.setItem('userId', id.toString()),
              AsyncStorage.setItem('user', JSON.stringify({ id, name: username })),
              SecureStore.setItemAsync('userToken', newToken || token)
            ]);
            
            return {
              success: true,
              data: { id, username, token: newToken || token }
            };
          }
        } else {
          // Para autenticación normal con correo y contraseña
          const password = await SecureStore.getItemAsync('userPassword');
          
          // Llamada al API para login normal
          const response = await axios.post(`${API_CONFIG.BASE_URL}/login2`, {
            email,
            password,
          });

          if (response.status === 200) {
            const { id, username, token } = response.data;

            // Guardar datos del usuario
            await Promise.all([
              AsyncStorage.setItem('userId', id.toString()),
              AsyncStorage.setItem('user', JSON.stringify({ id, name: username })),
              SecureStore.setItemAsync('userToken', token)
            ]);

            return {
              success: true,
              data: { id, username, token }
            };
          }
        }
        
        // Si llegamos aquí, algo falló en la autenticación
        return {
          success: false,
          message: 'Error en la respuesta del servidor'
        };
      } catch (error) {
        console.error('Error en login biométrico:', error);
        return {
          success: false,
          message: 'No se pudo completar el inicio de sesión. Por favor, inténtalo de nuevo.'
        };
      }
    } catch (error) {
      console.error('Error en el proceso de autenticación biométrica:', error);
      return {
        success: false,
        message: 'Error en la autenticación biométrica'
      };
    }
  }

  // Guarda las credenciales para uso futuro con biometría
  static async saveCredentials(email: string, passwordOrToken: string, isGoogleAuth: boolean = false): Promise<boolean> {
    try {
      await SecureStore.setItemAsync('userEmail', email);
      await SecureStore.setItemAsync('isGoogleAuth', isGoogleAuth ? 'true' : 'false');
      
      if (isGoogleAuth) {
        await SecureStore.setItemAsync('userToken', passwordOrToken);
      } else {
        await SecureStore.setItemAsync('userPassword', passwordOrToken);
      }
      
      return true;
    } catch (error) {
      console.error('Error al guardar credenciales:', error);
      return false;
    }
  }
}