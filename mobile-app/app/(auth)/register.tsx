import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { layoutStyles } from '../../src/theme/styles/layoutStyles';
import { textStyles } from '../../src/theme/styles/textStyles';
import { buttonStyles } from '../../src/theme/styles/buttonStyles';
import axios from 'axios';
import { API_CONFIG } from '../../src/config/config';
import { useRouter } from 'expo-router';
import CustomInput from '@/src/components/CustomInput';
import { useToast } from '../../src/context/ToastContext';
import { getErrorMessage } from '../../src/services/errorHandler';

const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validatePassword = (p: string) => p.length >= 8;

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();
  const toast = useToast();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      toast.error('Por favor completa todos los campos.');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Ingresa un correo electrónico válido');
      return;
    }
    if (!validatePassword(password)) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
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
        toast.success('Cuenta creada. Revisa tu correo para confirmarla.');
        router.push('/(auth)/login');
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'No se pudo crear la cuenta. Inténtalo de nuevo.'));
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
        placeholder="Nombre que verás en la app"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        accessibilityLabel="Campo de nombre de usuario"
      />
      <CustomInput
        label="Correo electrónico"
        placeholder="tu@correo.com"
        value={email}
        onChangeText={(t) => { setEmailError(''); setEmail(t); }}
        onBlur={() => { if (email && !validateEmail(email)) setEmailError('Ingresa un correo electrónico válido'); }}
        keyboardType="email-address"
        autoCapitalize="none"
        error={!!emailError}
        errorMessage={emailError}
        accessibilityLabel="Campo de correo electrónico"
      />
      <CustomInput
        label="Contraseña"
        placeholder="Mínimo 8 caracteres"
        value={password}
        onChangeText={(t) => { setPasswordError(''); setPassword(t); }}
        onBlur={() => { if (password && !validatePassword(password)) setPasswordError('La contraseña debe tener al menos 8 caracteres'); }}
        secureTextEntry
        error={!!passwordError}
        errorMessage={passwordError}
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
