import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import * as LocalAuthentication from "expo-local-authentication";
import { BiometricLogin } from "@/components/BiometricLogin";
import { LoginForm } from "@/components/LoginForm";
import { loginWithGoogle } from "@/services/AuthService";
import { BiometricAuthService } from "@/services/BiometricAuthService";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { registerForPushNotificationsAsync } from "@/services/notifications/registerPushToken";
import { loginWithEmail } from "@/services/AuthService";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "android-client-id.apps.googleusercontent.com",
    webClientId: "web-client-id.apps.googleusercontent.com",
  });

  useEffect(() => {
    const checkBiometricSupport = async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled =
        compatible && (await LocalAuthentication.isEnrolledAsync());
      setIsBiometricSupported(compatible && enrolled);

      const hasCredentials = await BiometricAuthService.hasStoredCredentials();
      setHasStoredCredentials(hasCredentials);
    };
    checkBiometricSupport();
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (authentication) {
        handleGoogleLogin(authentication.accessToken);
      }
    }
  }, [response]);

  const handleGoogleLogin = async (accessToken: string) => {
    setLoading(true);
    try {
      const user = await loginWithGoogle(accessToken);
      await BiometricAuthService.saveCredentials(user.email, user.token, true);
      usePushNotifications();
      router.replace("/(tabs)");
    } catch (e) {
      alert("Error al iniciar sesión con Google");
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    setLoading(true);
    try {
      const result = await BiometricAuthService.authenticateAndLogin();
      if (result.success) usePushNotifications();
      if (result.success) router.replace("/(tabs)");
      else alert(result.message);
    } catch {
      alert("Error con autenticación biométrica");
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      await loginWithEmail(email, password); // login exitoso → guarda JWT adentro

      await registerForPushNotificationsAsync();
      router.replace("/home");
    } catch (error) {
      alert("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  if (hasStoredCredentials && isBiometricSupported) {
    return (
      <BiometricLogin
        loading={loading}
        onBiometricAuth={handleBiometricAuth}
        onGoogleLogin={() => promptAsync()}
        onUseOther={() => setHasStoredCredentials(false)}
      />
    );
  }

  return (
    <LoginForm
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      loading={loading}
      onLogin={onLogin}
      onGoogleLogin={() => promptAsync()}
    />
  );
}
