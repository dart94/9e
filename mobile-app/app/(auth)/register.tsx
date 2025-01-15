import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { layoutStyles } from '../../src/theme/styles/layoutStyles';
import { textStyles } from '../../src/theme/styles/textStyles';
import { buttonStyles } from '../../src/theme/styles/buttonStyles';
import { miscStyles } from '../../src/theme/styles/miscStyles';
import axios from 'axios';
import { API_CONFIG } from '../../src/config/config';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/register2`, {
        username,
        email,
        password,
      });

      if (response.status === 201) {
        Alert.alert(
          '¡Registro exitoso!',
          'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/(auth)/login'),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Hubo un problema al registrar el usuario.');
      }
    } catch (error) {
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
    <View style={[layoutStyles.container, layoutStyles.center]}>
      <Text style={textStyles.title}>Crear Cuenta</Text>
      <TextInput
        style={miscStyles.input}
        placeholder="Nombre de usuario"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={miscStyles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={miscStyles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={[buttonStyles.button, loading && buttonStyles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={buttonStyles.buttonText}>
          {loading ? 'Registrando...' : 'Registrar'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={textStyles.link}>¿Ya tienes una cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
