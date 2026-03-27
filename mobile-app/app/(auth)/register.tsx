import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { layoutStyles } from '../../src/theme/styles/layoutStyles';
import { textStyles } from '../../src/theme/styles/textStyles';
import { buttonStyles } from '../../src/theme/styles/buttonStyles';
import axios from 'axios';
import { API_CONFIG } from '../../src/config/config';
import { useRouter } from 'expo-router';
import CustomInput from '@/src/components/CustomInput';

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
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/auth/register`, {
        username,
        email,
        password,
      });

      if (response.status === 201) {
        Alert.alert(
          '¡Registro exitoso!',
          'Revisa tu correo para confirmar tu cuenta.',
          [{ text: 'OK', onPress: () => router.push('/(auth)/login') }]
        );
      } else {
        Alert.alert('Error', 'Hubo un problema al registrar el usuario.');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.error || 'Hubo un problema al registrar el usuario.';
        Alert.alert('Error', msg);
      } else {
        Alert.alert('Error', 'Ocurrió un error inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[layoutStyles.container, layoutStyles.center]}>
      <Text style={textStyles.title} accessibilityRole="header">
        Crear Cuenta
      </Text>

      <CustomInput
        label="Nombre de usuario"
        placeholder="Tu nombre de usuario"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        accessibilityLabel="Campo de nombre de usuario"
      />
      <CustomInput
        label="Correo electrónico"
        placeholder="tu@correo.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        accessibilityLabel="Campo de correo electrónico"
      />
      <CustomInput
        label="Contraseña"
        placeholder="Mínimo 8 caracteres"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        accessibilityLabel="Campo de contraseña"
      />

      <TouchableOpacity
        style={[buttonStyles.button, loading && buttonStyles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel={loading ? 'Registrando...' : 'Registrar nueva cuenta'}
        accessibilityState={{ disabled: loading }}
      >
        <Text style={buttonStyles.buttonText}>
          {loading ? 'Registrando...' : 'Registrar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={layoutStyles.touchableContainer}
        onPress={() => router.push('/(auth)/login')}
        accessibilityRole="link"
        accessibilityLabel="Ir a iniciar sesión"
      >
        <Text style={textStyles.link}>¿Ya tienes una cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
