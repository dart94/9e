import * as Notifications from 'expo-notifications';

// Configuración del manejador de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Función para pedir permisos de notificaciones
export async function requestPermissions() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    return newStatus === 'granted';
  }
  return true;
}

// Función para programar una notificación cada 7 días
export async function scheduleWeeklyNotification(weeks: number) {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Seguimiento del embarazo",
      body: `¡Has avanzado a la semana ${weeks + 1} del embarazo!`,
      sound: true,
    },
    trigger: {
      seconds: 7 * 24 * 60 * 60, // 7 días en segundos
      repeats: true,
    } as Notifications.TimeIntervalTriggerInput, 
  });
}
