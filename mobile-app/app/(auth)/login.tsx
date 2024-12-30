import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import { API_CONFIG } from '../config/config';
import { styles as sharedStyles } from '../theme/styles';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/login`, {
        email,
        password,
      });

      console.log('Respuesta del servidor:', response.data);

      if (response.status === 200) {
        console.log('Intentando navegar a Dashboard');
        router.push({
          pathname: "/(auth)/dashboard",
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
          (error.response?.status === 401 ? 'Credenciales inválidas' :
          error.response?.status === 404 ? 'Usuario no encontrado' :
          'No se pudo conectar con el servidor.');
        
        Alert.alert('Error', errorMessage);
      } else {
        Alert.alert('Error', 'Ocurrió un error inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={sharedStyles.container}>
      <Text style={sharedStyles.title}>Iniciar Sesión</Text>
      <TextInput
        style={sharedStyles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={sharedStyles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={[sharedStyles.button, loading && sharedStyles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={sharedStyles.buttonText}>
          {loading ? 'Cargando...' : 'Ingresar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
