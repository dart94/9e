import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
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
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Application from 'expo-application';
import { COLORS, SIZES } from '../../src/theme/theme';
import { useToast } from '../../src/context/ToastContext';
import { getErrorMessage } from '../../src/services/errorHandler';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!;
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!;

export default function LoginScreen() {
  const isRunningInExpoGo = Constants.appOwnership === 'expo';

  const redirectUri = makeRedirectUri({
    scheme: 'embrace',
    path: 'auth/callback',
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: Platform.select({
      ios: IOS_CLIENT_ID,
      android: ANDROID_CLIENT_ID,
      default: WEB_CLIENT_ID,
    }),
    webClientId: WEB_CLIENT_ID,
    redirectUri,
    scopes: ['profile', 'email'],
    responseType: 'code',
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      if (code) handleGoogleLogin(code);
    } else if (response?.type === 'error') {
      toast.error('No se pudo iniciar sesión con Google. Inténtalo de nuevo.');
    }
  }, [response]);

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then(setIsBiometricSupported);
  }, []);

  const handleGoogleLogin = async (code: string) => {
    try {
      setLoading(true);
      const resp = await axios.post(`${API_CONFIG.BASE_URL}/auth/google`, {
        code,
        redirectUri,
      });
      if (resp.status !== 200) throw new Error('google_login_failed');
      const { id, username, token, refresh_token } = resp.data;
      await storage.setItem('userId', String(id));
      await storage.setItem('user', JSON.stringify({ id, username }));
      await storage.setItem('userToken', token);
      if (refresh_token) await storage.setItem('refreshToken', refresh_token);
      router.replace('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error, 'No se pudo iniciar sesión con Google.'));
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleBiometricAuth = async () => {
    try {
      const savedEmail = await storage.getItem('userEmail');
      if (!savedEmail) {
        toast.info('Inicia sesión primero con tu correo y contraseña para habilitar la huella.');
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autenticación biométrica',
        disableDeviceFallback: false,
        cancelLabel: 'Cancelar',
      });
      if (result.success) {
        const savedRefreshToken = await storage.getItem('refreshToken');
        if (!savedRefreshToken) {
          toast.info('Tu sesión expiró. Inicia sesión con tu correo y contraseña.');
          return;
        }
        router.replace('/dashboard');
      }
    } catch {
      toast.error('No se pudo completar la autenticación biométrica.');
    }
  };

  const handleLogin = async (loginEmail = email, loginPassword = password) => {
    let hasError = false;
    if (!loginEmail || !validateEmail(loginEmail)) {
      setEmailError(true);
      hasError = true;
    }
    if (!loginPassword) {
      setPasswordError(true);
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);
    try {
      const resp = await axios.post(`${API_CONFIG.BASE_URL}/api/auth/login`, {
        email: loginEmail,
        password: loginPassword,
      });
      if (resp.status === 200) {
        const { id, username, token, refresh_token } = resp.data;
        await storage.setItem('userId', id.toString());
        await storage.setItem('user', JSON.stringify({ id, name: username }));
        await storage.setItem('userToken', token);
        if (refresh_token) await storage.setItem('refreshToken', refresh_token);
        await storage.setItem('userEmail', loginEmail);
        router.replace('/dashboard');
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'No se pudo iniciar sesión. Verifica tus datos.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[layoutStyles.container, layoutStyles.center]}>
      <Text style={textStyles.title} accessibilityRole="header">
        Iniciar Sesión
      </Text>

      <CustomInput
        label="Correo electrónico"
        placeholder="tu@correo.com"
        value={email}
        onChangeText={(t) => { setEmailError(false); setEmail(t); }}
        onBlur={() => { if (!validateEmail(email)) setEmailError(true); }}
        keyboardType="email-address"
        autoCapitalize="none"
        error={emailError}
        errorMessage="Ingresa un correo electrónico válido"
        accessibilityLabel="Campo de correo electrónico"
      />

      <CustomInput
        label="Contraseña"
        placeholder="Escribe tu contraseña"
        value={password}
        onChangeText={(t) => { setPasswordError(false); setPassword(t); }}
        secureTextEntry
        error={passwordError}
        errorMessage="La contraseña no puede estar vacía"
        accessibilityLabel="Campo de contraseña"
      />

      <TouchableOpacity
        style={[buttonStyles.button, loading && buttonStyles.buttonDisabled]}
        onPress={() => handleLogin()}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel={loading ? 'Iniciando sesión' : 'Ingresar'}
        accessibilityState={{ disabled: loading }}
      >
        <Text style={buttonStyles.buttonText}>
          {loading ? 'Iniciando sesión...' : 'Ingresar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[buttonStyles.button, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
        onPress={() => promptAsync()}
        disabled={!request || loading}
        accessibilityRole="button"
        accessibilityLabel="Iniciar sesión con Google"
        accessibilityState={{ disabled: !request || loading }}
      >
        <Ionicons name="logo-google" size={22} color={COLORS.white} style={{ marginRight: SIZES.spacingSM }} accessibilityLabel="" />
        <Text style={buttonStyles.buttonText}>Iniciar con Google</Text>
      </TouchableOpacity>

      {isBiometricSupported && (
        <TouchableOpacity
          style={[buttonStyles.button, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
          onPress={handleBiometricAuth}
          accessibilityRole="button"
          accessibilityLabel="Ingresar con huella digital"
        >
          <Ionicons name="finger-print-outline" size={28} color={COLORS.white} style={{ marginRight: SIZES.spacingSM }} accessibilityLabel="" />
          <Text style={buttonStyles.buttonText}>Ingresar con Huella</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={layoutStyles.touchableContainer}
        onPress={() => router.push('/(auth)/forgotPassword')}
        accessibilityRole="link"
        accessibilityLabel="¿Olvidaste tu contraseña?"
      >
        <Text style={textStyles.link}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={layoutStyles.touchableContainer}
        onPress={() => router.push('/(auth)/register')}
        accessibilityRole="link"
        accessibilityLabel="Ir a registrarse"
      >
        <Text style={textStyles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}
