import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/config';
import { layoutStyles } from '../theme/styles/layoutStyles';
import { textStyles } from '../theme/styles/textStyles';
import { buttonStyles } from '../theme/styles/buttonStyles';
import { miscStyles } from '../theme/styles/miscStyles';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '../../utils/storageHelper';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkBiometricSupport = async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
    };
    checkBiometricSupport();
  }, []);

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

      <TextInput
        style={[miscStyles.input, emailError && { borderColor: 'red' }]}
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

      <TextInput
        style={[miscStyles.input, passwordError && { borderColor: 'red' }]}
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

      <TouchableOpacity onPress={() => router.push('/(auth)/forgotPassword')}>
        <Text style={textStyles.link}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
        <Text style={textStyles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}
