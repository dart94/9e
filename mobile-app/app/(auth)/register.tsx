import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { styles } from '../theme/styles';
import axios from 'axios';
import { API_CONFIG } from '../config/config';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    console.log('Intentando registrar...');
    if (!username || !email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      console.log('Enviando datos al servidor...');
      const response = await axios.post(`${API_CONFIG.BASE_URL}/register2`, {
        username,
        email,
        password,
      });

      console.log('Respuesta del servidor:', response.data);

      if (response.status === 201) {
        console.log('Registro exitoso. Mostrando alerta...');
        Alert.alert(
          '¡Registro exitoso!',
          'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('Redirigiendo al login...');
                router.push('/(auth)/login');
              },
            },
          ]
        );
      } else {
        console.error('Estado inesperado del servidor:', response.status);
        Alert.alert('Error', 'Hubo un problema al registrar el usuario.');
      }
    } catch (error) {
      console.error('Error detallado:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error || 'Hubo un problema al registrar el usuario.';
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
      <Text style={styles.title}>Crear Cuenta</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Registrando...' : 'Registrar'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => router.push('/(auth)/login')}
      >
        <Text style={styles.link}>¿Ya tienes una cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
