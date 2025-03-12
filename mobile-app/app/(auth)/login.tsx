import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../src/config/config';
import { layoutStyles } from '../../src/theme/styles/layoutStyles';
import { textStyles } from '../../src/theme/styles/textStyles';
import { buttonStyles } from '../../src/theme/styles/buttonStyles';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '@/src/components/CustomInput';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import * as Google from 'expo-auth-session/providers/google';
import {biometricStyles} from '../../src/theme/styles/biometricStyles';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false);
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '30060725584-geltsl9088hehgclt642pv6t5t60ngo5.apps.googleusercontent.com',

  });

  useEffect(() => {
    const checkBiometricSupport = async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = compatible ? await LocalAuthentication.isEnrolledAsync() : false;
      setIsBiometricSupported(compatible && enrolled);
      
      // Verificar si hay credenciales almacenadas
      const savedEmail = await SecureStore.getItemAsync('userEmail');
      const savedPassword = await SecureStore.getItemAsync('userPassword');
      setHasStoredCredentials(!!savedEmail && !!savedPassword);
    };
    checkBiometricSupport();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication) {
        handleGoogleLogin(authentication.accessToken);
      }
    } else if (response?.type === 'error') {
      console.error('Error de autenticación Google:', response.error);
      Alert.alert('Error', 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.');
    }
  }, [response]);

  interface GoogleLoginResponse {
    id: number;
    username: string;
    token: string;
    email: string;
  }

  const handleGoogleLogin = async (accessToken: string) => {
    if (loading) return; // Evitar múltiples solicitudes
    
    setLoading(true);
    try {
      
      const response = await axios.post<GoogleLoginResponse>(`${API_CONFIG.BASE_URL}/auth/google`, {
        token: accessToken,
      });
      
      if (response.status === 200) {
        const { id, username, token, email } = response.data;
        
        try {
          // Guardar datos del usuario de forma secuencial para asegurar que se completen
          await Promise.all([
            AsyncStorage.setItem('userId', id.toString()),
            AsyncStorage.setItem('user', JSON.stringify({ id, name: username })),
            SecureStore.setItemAsync('userToken', token),
            SecureStore.setItemAsync('userEmail', email)
          ]);
          
          // Una pequeña pausa para asegurar que se completan las operaciones de almacenamiento
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Navegar al dashboard usando push para mejor navegación
          router.push('/dashboard');
        } catch (storageError) {
          console.error('Error al guardar datos:', storageError);
          Alert.alert('Error', 'No se pudieron guardar las credenciales.');
        }
      }
    } catch (error) {
      console.error('Error detallado:', error);
      Alert.alert('Error', 'No se pudo iniciar sesión con Google. Verifica tu conexión.');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);

    }
  };
  
  const validateEmail = (email: string): boolean => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  
  const handleBiometricAuth = async () => {
    try {
      // Verificar email guardado
      const savedEmail = await SecureStore.getItemAsync('userEmail');
      if (!savedEmail) {
        Alert.alert(
          'No hay datos guardados',
          'Por favor, inicia sesión primero con tu correo y contraseña.'
        );
        return;
      }
      
      // Verificar si la contraseña está guardada
      const savedPassword = await SecureStore.getItemAsync('userPassword');
      if (!savedPassword) {
        Alert.alert(
          'Información incompleta',
          'No se encontró la contraseña guardada. Por favor inicia sesión manualmente.'
        );
        return;
      }
      
      // Intentar autenticación biométrica
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Iniciar sesión con biometría',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
        fallbackLabel: 'Usar contraseña',
      });
      
      if (result.success) {
        setEmail(savedEmail);
        setLoading(true);
        
        try {
          // Comunicación directa con el servidor en lugar de usar handleLogin
          const response = await axios.post(`${API_CONFIG.BASE_URL}/login2`, {
            email: savedEmail,
            password: savedPassword,
          });
          
          if (response.status === 200) {
            const { id, username, token } = response.data;
            
            // Guardar o actualizar la información
            await AsyncStorage.setItem('userId', id.toString());
            await AsyncStorage.setItem('user', JSON.stringify({ id, name: username }));
            await SecureStore.setItemAsync('userToken', token);
            
            // Navegar al dashboard
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error en login biométrico:', error);
          Alert.alert('Error', 'No se pudo completar el inicio de sesión. Por favor, inténtalo de nuevo.');
        } finally {
          setLoading(false);
        }
      } else {
        // Si el usuario canceló o falló la autenticación biométrica
        console.log('Autenticación biométrica cancelada o fallida', result);
        if (result.error) {
          Alert.alert('Error', `Error de autenticación: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Error en autenticación biométrica:', error);
      Alert.alert('Error', 'No se pudo completar la autenticación biométrica');
    }
  };
  
  const handleLogin = async (loginEmail = email, loginPassword = password) => {
    if (!loginEmail || !validateEmail(loginEmail)) {
      setEmailError(true);
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido.');
      return;
    }
    
    if (!loginPassword) {
      setPasswordError(true);
      Alert.alert('Error', 'Por favor ingresa tu contraseña.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/login2`, {
        email: loginEmail,
        password: loginPassword,
      });
      
      if (response.status === 200) {
        const { id, username, token } = response.data;
        
        // Guardar datos del usuario
        await AsyncStorage.setItem('userId', id.toString());
        await AsyncStorage.setItem('user', JSON.stringify({ id, name: username }));
        await SecureStore.setItemAsync('userToken', token);
        await SecureStore.setItemAsync('userEmail', loginEmail);
        await SecureStore.setItemAsync('userPassword', loginPassword);
        
        // Navegar al dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error detallado:', error);
      Alert.alert('Error', 'Credenciales incorrectas o problema de conexión.');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar un componente diferente si hay credenciales almacenadas y soporte biométrico
  if (hasStoredCredentials && isBiometricSupported) {
    return (
      <View style={[layoutStyles.container, layoutStyles.center]}>
        <Image 
          source={require('../../assets/images/pregnancy-logo.png')} 
          style={biometricStyles.logo} 
          resizeMode="contain"
        />
        <Text style={textStyles.title}>Bienvenido de nuevo</Text>
        
        <TouchableOpacity
          style={[biometricStyles.biometricButton, { marginBottom: 20 }]}
          onPress={handleBiometricAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="finger-print-outline" size={40} color="white" />
              <Text style={biometricStyles.biometricText}>Ingresar con huella</Text>
            </>
          )}
        </TouchableOpacity>
        
        <Text style={biometricStyles.orText}>o</Text>
        
        <TouchableOpacity 
          style={[buttonStyles.button, biometricStyles.secondaryButton]}
          onPress={() => promptAsync()}
          disabled={!request || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#333" />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color="#333" style={{ marginRight: 8 }} />
              <Text style={biometricStyles.secondaryButtonText}>Continuar con Google</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[biometricStyles.textLink, { marginTop: 15 }]}
          onPress={() => setHasStoredCredentials(false)}
          disabled={loading}
        >
          <Text style={textStyles.link}>Usar otro método de inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[layoutStyles.container, layoutStyles.center]}>
       <Image 
          source={require('../../assets/images/pregnancy-logo.png')} 
          style={biometricStyles.logo} 
          resizeMode="contain"
        />
      <Text style={textStyles.title}>Iniciar Sesión</Text>

      <CustomInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setEmailError(false);
        }}
        onBlur={() => setEmailError(!validateEmail(email) && email !== '')}
        keyboardType="email-address"
        autoCapitalize="none"
        error={emailError}
      />

      <CustomInput
        placeholder="Contraseña"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setPasswordError(false);
        }}
        secureTextEntry
        error={passwordError}
      />

      <TouchableOpacity
        style={[buttonStyles.button, loading && buttonStyles.buttonDisabled]}
        onPress={() => handleLogin()}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={buttonStyles.buttonText}>Ingresar</Text>
        )}
      </TouchableOpacity>

      <View style={biometricStyles.divider}>
        <View style={biometricStyles.dividerLine} />
        <Text style={biometricStyles.dividerText}>o</Text>
        <View style={biometricStyles.dividerLine} />
      </View>

      <TouchableOpacity
        style={[buttonStyles.button, biometricStyles.secondaryButton]}
        onPress={() => promptAsync()}
        disabled={!request || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#333" />
        ) : (
          <>
            <Ionicons
              name="logo-google"
              size={20}
              color="#333"
              style={{ marginRight: 8 }}
            />
            <Text style={biometricStyles.secondaryButtonText}>Continuar con Google</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={biometricStyles.textLink}
        onPress={() => router.push('/(auth)/forgotPassword')}
        disabled={loading}
      >
        <Text style={textStyles.link}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity
       style={biometricStyles.textLink}
       onPress={() => router.push('/(auth)/register')}
       disabled={loading}>
        <Text style={textStyles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}