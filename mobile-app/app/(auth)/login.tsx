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
      setIsBiometricSupported(compatible);
      
      // Verificar si hay credenciales almacenadas
      const savedEmail = await SecureStore.getItemAsync('userEmail');
      setHasStoredCredentials(!!savedEmail);
    };
    checkBiometricSupport();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication) {
        handleGoogleLogin(authentication.accessToken);
      }
    }
  }, [response]);

  interface GoogleLoginResponse {
    id: number;
    username: string;
    token: string;
    email: string;
  }

  const handleGoogleLogin = async (accessToken: string) => {
    setLoading(true);
    try {
      const response = await axios.post<GoogleLoginResponse>(`${API_CONFIG.BASE_URL}/auth/google`, {
        token: accessToken,
      });
      if (response.status === 200) {
        const { id, username, token, email } = response.data;
        // Guardar datos del usuario de forma secuencial para asegurar que se completen
        await AsyncStorage.setItem('userId', id.toString());
        await AsyncStorage.setItem('user', JSON.stringify({ id, name: username }));
        await SecureStore.setItemAsync('userToken', token);
        await SecureStore.setItemAsync('userEmail', email);
        // Desactivar loading antes de navegar
        setLoading(false);
        router.replace('/dashboard');
        return; // Evita que se ejecute el finally
      }
    } catch (error) {
      console.error('Error detallado:', error);
      Alert.alert('Error', 'No se pudo iniciar sesión con Google.');
    } 
    setLoading(false);
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
        promptMessage: 'Autenticación biométrica',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });
      
      if (result.success) {
        setEmail(savedEmail);
        // Llamar a handleLogin con los valores almacenados
        await handleLogin(savedEmail, savedPassword);
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
        await AsyncStorage.setItem('userId', id.toString());
        await AsyncStorage.setItem('user', JSON.stringify({ id, name: username }));
        await SecureStore.setItemAsync('userToken', token);
        await SecureStore.setItemAsync('userEmail', loginEmail);
        // Guardar la contraseña de forma segura para el inicio de sesión biométrico
        await SecureStore.setItemAsync('userPassword', loginPassword);
        
        // Usar replace para evitar problemas de navegación
        router.replace('/dashboard');
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
        >
          <Ionicons name="finger-print-outline" size={40} color="white" />
          <Text style={biometricStyles.biometricText}>Ingresar con huella</Text>
        </TouchableOpacity>
        
        <Text style={biometricStyles.orText}>o</Text>
        
        <TouchableOpacity 
          style={[buttonStyles.button, biometricStyles.secondaryButton]}
          onPress={() => promptAsync()}
          disabled={!request}
        >
          <Ionicons name="logo-google" size={20} color="#333" style={{ marginRight: 8 }} />
          <Text style={biometricStyles.secondaryButtonText}>Continuar con Google</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[biometricStyles.textLink, { marginTop: 15 }]}
          onPress={() => setHasStoredCredentials(false)}
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
        onChangeText={(text) => setEmail(text)}
        onBlur={() => setEmailError(!validateEmail(email))}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <CustomInput
        placeholder="Contraseña"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
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
        disabled={!request}
      >
        <Ionicons
          name="logo-google"
          size={20}
          color="#333"
          style={{ marginRight: 8 }}
        />
        <Text style={biometricStyles.secondaryButtonText}>Continuar con Google</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={biometricStyles.textLink}
        onPress={() => router.push('/(auth)/forgotPassword')}
      >
        <Text style={textStyles.link}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity
       style={biometricStyles.textLink}
       onPress={() => router.push('/(auth)/register')}>
        <Text style={textStyles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}


  