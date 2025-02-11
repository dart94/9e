import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
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
import { storage } from '../../utils/storageHelper';
import CustomInput from '@/src/components/CustomInput';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: '30060725584-geltsl9088hehgclt642pv6t5t60ngo5.apps.googleusercontent.com',
  });

  useEffect(() => {
    const checkBiometricSupport = async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
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

  const handleGoogleLogin = async (accessToken: string) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/google`, {
        token: accessToken,
      });

      if (response.status === 200) {
        const { id, username, token } = response.data;

        // Guardar datos de usuario
        await AsyncStorage.setItem('userId', id.toString());
        await AsyncStorage.setItem(
          'user',
          JSON.stringify({ id, name: username })
        );

        // Guardar token y credenciales
        await storage.setItem('userToken', token);
        await storage.setItem('userEmail', response.data.email);

        // Configurar interceptor de Axios
        axios.interceptors.request.use(
          async (config) => {
            const token = await storage.getItem('userToken');
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
          },
          (error) => Promise.reject(error)
        );

        // Navegar al Dashboard
        router.replace('/dashboard');
      }
    } catch (error) {
      console.error('Error detallado:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          (error.response?.status === 401
            ? 'Credenciales inválidas.'
            : 'Ocurrió un error. Inténtalo de nuevo más tarde.');
        Alert.alert('Error', errorMessage);
      } else {
        Alert.alert('Error', 'Ocurrió un error inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleBiometricAuth = async () => {
    try {
      const savedEmail = await storage.getItem('userEmail');
      if (!savedEmail) {
        Alert.alert(
          'No hay datos guardados',
          'Por favor, inicia sesión primero con tu correo y contraseña.'
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autenticación biométrica',
        disableDeviceFallback: false,
        cancelLabel: 'Cancelar',
      });

      if (result.success) {
        const savedPassword = await storage.getItem('userPassword');
        setEmail(savedEmail);
        setPassword(savedPassword || '');
        await handleLogin(savedEmail, savedPassword || '');
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

        // Guardar datos de usuario
        await AsyncStorage.setItem('userId', id.toString());
        await AsyncStorage.setItem(
          'user',
          JSON.stringify({ id, name: username })
        );

        // Guardar token y credenciales
        await storage.setItem('userToken', token);
        await storage.setItem('userEmail', loginEmail);
        await storage.setItem('userPassword', loginPassword);

        // Configurar interceptor de Axios
        axios.interceptors.request.use(
          async (config) => {
            const token = await storage.getItem('userToken');
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
          },
          (error) => Promise.reject(error)
        );

        // Navegar al Dashboard
        router.replace('/dashboard');
      }
    } catch (error) {
      console.error('Error detallado:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          (error.response?.status === 401
            ? 'Credenciales inválidas.'
            : 'Ocurrió un error. Inténtalo de nuevo más tarde.');
        Alert.alert('Error', errorMessage);
      } else {
        Alert.alert('Error', 'Ocurrió un error inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[layoutStyles.container, layoutStyles.center]}>
      <Text style={textStyles.title}>Iniciar Sesión</Text>

      <CustomInput
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

      <CustomInput
        placeholder="Contraseña"
        value={password}
        onChangeText={(text) => {
          setPasswordError(false);
          setPassword(text);
        }}
        secureTextEntry
      />

      <TouchableOpacity
        style={[buttonStyles.button, loading && buttonStyles.buttonDisabled]}
        onPress={() => handleLogin()}
        disabled={loading}
      >
        <Text style={buttonStyles.buttonText}>
          {loading ? 'Cargando...' : 'Ingresar'}
        </Text>
      </TouchableOpacity>

      {isBiometricSupported && (
        <TouchableOpacity
          style={[
            buttonStyles.button,
            { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
          ]}
          onPress={handleBiometricAuth}
        >
          <Ionicons name="finger-print-outline" size={32} color={buttonStyles.buttonText.color} />
          <Text style={buttonStyles.buttonText}>Ingresar con Huella</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[buttonStyles.button, { marginTop: 20 }]}
        onPress={() => promptAsync()}
        disabled={!request}
      >
        <Text style={buttonStyles.buttonText}>Ingresar con Google</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={layoutStyles.touchableContainer}
        onPress={() => router.push('/(auth)/forgotPassword')}
      >
        <Text style={textStyles.link}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity
       style={layoutStyles.touchableContainer}
       onPress={() => router.push('/(auth)/register')}>
        <Text style={textStyles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}