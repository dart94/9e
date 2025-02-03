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
import Constants from 'expo-constants';
import { makeRedirectUri } from 'expo-auth-session';
// Expo Auth imports:
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';


WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = '30060725584-n3hofnkgj935hehk5ot4dcn5o9d8dcr8.apps.googleusercontent.com';
const ANDROID_CLIENT_ID = '30060725584-nuohjfa7tk392bltpl1k0tvs1gebhs7d.apps.googleusercontent.com';
const IOS_CLIENT_ID = '30060725584-i56l4d5oab74g16mbensag5e21qk7rss.apps.googleusercontent.com';

export default function LoginScreen() {
  const isRunningInExpoGo = Constants.appOwnership === 'expo';
  const redirectUri = `${API_CONFIG.BASE_URL}/auth/callback`;;
  console.log(redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: isRunningInExpoGo ? WEB_CLIENT_ID : undefined,
    androidClientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
    responseType: 'id_token',
    redirectUri:redirectUri,
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        handleGoogleLogin(id_token);
      }
    } else if (response?.type === 'error') {
      console.error('Google Login Error:', response.error);
      Alert.alert('Error', 'No se pudo iniciar sesión con Google');
    }
  }, [response]);

  useEffect(() => {
    const checkBiometricSupport = async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
    };
    checkBiometricSupport();
  }, []);

  const handleGoogleLogin = async (idToken: string) => {
    try {
      setLoading(true);
  
      // Enviar el token de Google al backend Flask
      const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/google`, {
        token: idToken
      });
  
      if (response.status !== 200) {
        throw new Error("No se pudo iniciar sesión con Google en el backend");
      }
  
      const { id, username, token } = response.data;
  
      // Guardar información en AsyncStorage
      await AsyncStorage.setItem('userId', String(id));
      await AsyncStorage.setItem('user', JSON.stringify({ id, username }));
      await AsyncStorage.setItem('userToken', token);
  
      // Redirigir al dashboard
      router.replace('/dashboard');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error al iniciar sesión con Google:', error.response?.data || error.message);
      } else {
        console.error('Error al iniciar sesión con Google:', error);
      }
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.error : 'Error desconocido';
      Alert.alert('Error', `No se pudo iniciar sesión: ${errorMessage}`);

    } finally {
      setLoading(false);
    }
  };

  // Valida formato de email
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Handle de autenticación biométrica
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

  // Función de login "tradicional" con email/contraseña
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
        await AsyncStorage.setItem('user', JSON.stringify({ id, name: username }));

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

      {/* Botón de login tradicional */}
      <TouchableOpacity
        style={[buttonStyles.button, loading && buttonStyles.buttonDisabled]}
        onPress={() => handleLogin()}
        disabled={loading}
      >
        <Text style={buttonStyles.buttonText}>
          {loading ? 'Cargando...' : 'Ingresar'}
        </Text>
      </TouchableOpacity>

      {/* Botón de login con Google */}
      <TouchableOpacity
        style={[buttonStyles.button, { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
        onPress={() => promptAsync()}
        disabled={!request} // Desactiva si request no está listo
      >
        <Ionicons
          name="logo-google"
          size={24}
          color={buttonStyles.buttonText.color}
          style={{ marginRight: 8 }}
        />
        <Text style={buttonStyles.buttonText}>Iniciar con Google</Text>
      </TouchableOpacity>

      {/* Botón de autenticación biométrica (huella) */}
      {isBiometricSupported && (
        <TouchableOpacity
          style={[
            buttonStyles.button,
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 10,
            },
          ]}
          onPress={handleBiometricAuth}
        >
          <Ionicons
            name="finger-print-outline"
            size={32}
            color={buttonStyles.buttonText.color}
            style={{ marginRight: 8 }}
          />
          <Text style={buttonStyles.buttonText}>Ingresar con Huella</Text>
        </TouchableOpacity>
      )}

      {/* Opciones de contraseña olvidada y registro */}
      <TouchableOpacity
        style={layoutStyles.touchableContainer}
        onPress={() => router.push('/(auth)/forgotPassword')}
      >
        <Text style={textStyles.link}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={layoutStyles.touchableContainer}
        onPress={() => router.push('/(auth)/register')}
      >
        <Text style={textStyles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}