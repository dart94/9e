import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import CustomInput from "@/src/components/CustomInput";
import { buttonStyles } from "@/src/theme/styles/buttonStyles";
import { biometricStyles } from "@/src/theme/styles/biometricStyles";
import { textStyles } from "@/src/theme/styles/textStyles";
import { validateEmail } from "@/utils/validations";
import { loginWithEmail } from "@/services/AuthService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { usePushNotifications } from "@/hooks/usePushNotifications";

type LoginFormProps = {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
  onLogin: (email: string, password: string) => void; // <--- CAMBIO
  onGoogleLogin: () => void;
};

export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  onLogin,
  onGoogleLogin,
}) => {
  const [emailError, setEmailError] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(false);
  const router = useRouter();

  const handleLogin = () => {
  if (!validateEmail(email)) {
    setEmailError(true);
    return;
  }
  if (!password) {
    setPasswordError(true);
    return;
  }

  onLogin(email, password); // <--- nuevo
};

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Image
        source={require("../assets/images/pregnancy-logo.png")}
        style={biometricStyles.logo}
        resizeMode="contain"
      />
      <Text style={textStyles.title}>Iniciar Sesión</Text>

      <CustomInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setEmailError(false);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        error={emailError}
      />

      <CustomInput
        placeholder="Contraseña"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setPasswordError(false);
        }}
        secureTextEntry
        error={passwordError}
      />

      <TouchableOpacity
        style={[buttonStyles.button, loading && buttonStyles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={buttonStyles.buttonText}>Ingresar</Text>
        )}
      </TouchableOpacity>

      <View style={biometricStyles.divider}>
        <View style={biometricStyles.dividerLine} />
        <Text style={biometricStyles.dividerText}>o</Text>
        <View style={biometricStyles.dividerLine} />
      </View>

      <TouchableOpacity
        style={[
          biometricStyles.secondaryButton,
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: 12,
            borderRadius: 6,
          },
        ]}
        onPress={onGoogleLogin}
        disabled={loading}
      >
        <Ionicons
          name="logo-google"
          size={20}
          color="#333"
          style={{ marginRight: 8 }}
        />
        <Text style={biometricStyles.secondaryButtonText}>
          Continuar con Google
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={biometricStyles.textLink}
        onPress={() => router.push("/(auth)/forgotPassword")}
        disabled={loading}
      >
        <Text style={textStyles.link}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={biometricStyles.textLink}
        onPress={() => router.push("/(auth)/register")}
        disabled={loading}
      >
        <Text style={textStyles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
};
