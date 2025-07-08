// notifications/registerPushToken.ts
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Alert } from 'react-native';

export async function registerForPushNotificationsAsync() {
  try {
    console.log("🚀 Iniciando notificaciones");

    if (!Device.isDevice) {
      console.log("❌ No es un dispositivo físico");
      Alert.alert('Error', 'Debes usar un dispositivo físico');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log("🔐 Estado de permisos:", existingStatus);

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log("📥 Nuevo estado de permisos:", finalStatus);
    }

    if (finalStatus !== 'granted') {
      console.log("❌ Permisos denegados");
      Alert.alert('Permiso denegado', 'No se otorgaron permisos para notificaciones');
      return;
    }

    const { data } = await Notifications.getExpoPushTokenAsync();
    console.log("✅ Token generado:", data);
    Alert.alert("Push Token", data);
    return data;

  } catch (error) {
    console.log("🔥 Error al registrar push token:", error);
    Alert.alert("Error", JSON.stringify(error));
  }
}

