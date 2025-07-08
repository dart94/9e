// notifications/registerPushToken.ts
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  let token;

  if (!Device.isDevice) {
    alert('Debes usar un dispositivo físico para recibir notificaciones push');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Permiso para notificaciones denegado');
    return;
  }

  const { data } = await Notifications.getExpoPushTokenAsync();
  token = data;
  console.log('📲 Expo Push Token:', token);

  // Si quieres guardarlo en backend, podrías hacer un fetch aquí.
  return token;
}
