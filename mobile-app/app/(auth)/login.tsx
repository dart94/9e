import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/config';
import { styles } from '../theme/styles';


export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setEmailError(true);
      Alert.alert('Error', 'Por favor ingresa tu correo.');
      return;
    }

    if (!emailRegex.test(email)) {
      setEmailError(true);
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (!password) {
      setPasswordError(true);
      Alert.alert('Error', 'Por favor ingresa tu contraseña.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/login2`, {
        email,
        password,
      });
  
      if (response.status === 200) {
        console.log('Usuario autenticado:', response.data);
  
        const userId = response.data.id;
  
        // Guarda el `userId` en AsyncStorage
        await AsyncStorage.setItem('userId', userId.toString());
  
        // Guarda el objeto completo del usuario en AsyncStorage
        await AsyncStorage.setItem(
          'user',
          JSON.stringify({ id: response.data.id, name: response.data.username })
        );
        
        // Navega al Dashboard con los datos del usuario guardados en AsyncStorage
        router.push({
          pathname: '/(auth)/dashboard',
          params: {
            id: response.data.id,
            name: response.data.username,
          },
        });
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
    <View style={[styles.container, styles.center]}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput
        style={[
          styles.input,
          emailError && { borderColor: 'red', borderWidth: 2 },
        ]}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={(text) => {
          setEmailError(false);
          setEmail(text);
        }}
        onBlur={() => {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError(true);
          }
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[
          styles.input,
          passwordError && { borderColor: 'red', borderWidth: 2 },
        ]}
        placeholder="Contraseña"
        value={password}
        onChangeText={(text) => {
          setPasswordError(false);
          setPassword(text);
        }}
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Cargando...' : 'Ingresar'}
        </Text>
      </TouchableOpacity>

      {/* Botones para recuperar contraseña y registrarse */}
      <TouchableOpacity
        onPress={() => router.push('/(auth)/forgotPassword')}
      >
        <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push('/(auth)/register')}
      >
        <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}
