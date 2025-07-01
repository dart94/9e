import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { layoutStyles } from "../../src/theme/styles/layoutStyles";
import { textStyles } from "../../src/theme/styles/textStyles";
import { buttonStyles } from "../../src/theme/styles/buttonStyles";
import { miscStyles } from "../../src/theme/styles/miscStyles";
import axios from "axios";
import { API_CONFIG } from "../../src/config/config";
import { useRouter } from "expo-router";
import CustomInput from "@/src/components/CustomInput";
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/utils/validations";
import { registerUser } from "@/services/AuthService";
import { configureProps } from "react-native-reanimated/lib/typescript/ConfigHelper";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (loading) return;

    if (!username || !email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }

    if (!validateUsername(username)) {
      Alert.alert(
        "Error",
        "El nombre de usuario debe tener al menos 3 caracteres."
      );
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Ingresa un correo electrónico válido.");
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser(username, email, password);
      if (response.success) {
        Alert.alert("Éxito", "Cuenta creada exitosamente.");
        router.push("/(auth)/login");
        
      } else {
        Alert.alert("Error", response.message || "Error al crear la cuenta.");
      }
    } catch (error) {
      console.error("Error en handleRegister:", error);
      Alert.alert(
        "Error",
        "Ocurrió un error al crear la cuenta. Inténtalo de nuevo más tarde."
      );
    } finally {
      setLoading(false); 
    }
  };


  return (
    <View style={[layoutStyles.container, layoutStyles.center]}>
      <Text style={textStyles.title}>Crear Cuenta</Text>
      <CustomInput
        style={miscStyles.input}
        placeholder="Nombre de usuario"
        value={username}
        onChangeText={(text) => setUsername(text.trim())}
        autoCapitalize="none"
      />
      <CustomInput
        style={miscStyles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={(text) => setEmail(text.trim().toLowerCase())}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <CustomInput
        style={miscStyles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        secureTextEntry
      />
      <TouchableOpacity
        style={[buttonStyles.button, loading && buttonStyles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={buttonStyles.buttonText}>
          {loading ? "Registrando..." : "Registrar"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={layoutStyles.touchableContainer}
        onPress={() => router.push("/(auth)/login")}
      >
        <Text style={textStyles.link}>
          ¿Ya tienes una cuenta? Inicia sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
}
