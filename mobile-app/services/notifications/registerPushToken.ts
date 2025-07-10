// notifications/registerPushToken.ts
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_CONFIG } from "@/src/config/config";

export async function registerForPushNotificationsAsync() {
  try {
    console.log("🚀 Iniciando notificaciones");

    if (!Device.isDevice) {
      console.log("❌ No es un dispositivo físico");
      Alert.alert("Error", "Debes usar un dispositivo físico");
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log("🔐 Estado de permisos:", existingStatus);

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log("📥 Nuevo estado de permisos:", finalStatus);
    }

    if (finalStatus !== "granted") {
      console.log("❌ Permisos denegados");
      Alert.alert("Permiso denegado", "No se otorgaron permisos para notificaciones");
      return;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync();
    console.log("✅ Token generado:", token);

    await AsyncStorage.setItem("expoPushToken", token);

    const jwt = await AsyncStorage.getItem("jwt");

    console.log("📦 Enviando a backend:", {
      token,
      jwt,
      url: `${API_CONFIG.BASE_URL}/api/save_push_token`,
    });

    if (!jwt) {
      console.log("🔑 No hay JWT guardado, abortando envío de token");
      return;
    }

    const res = await axios.post(
      `${API_CONFIG.BASE_URL}/api/save_push_token`,
      { token }, // ✅ No necesitas usar JSON.stringify
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("🎯 Token enviado al backend:", res.data);
    return token;

  } catch (error: any) {
    console.log("🔥 Error al registrar push token:", error);
    Alert.alert("Error", error?.message || "Error desconocido");
  }
}
