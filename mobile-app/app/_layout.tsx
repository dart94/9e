import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { NotificationService } from '../services/notifications/NotificationService';
import * as Notifications from 'expo-notifications';

// Configuración global de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function Layout() {
  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const setupNotifications = async () => {
      try {
        const isInitialized = await NotificationService.initialize();
        
        if (isInitialized) {
          subscription = await NotificationService.setupNotificationListeners(
            (notification) => {
              console.log('Notificación recibida:', notification);
            }
          );
        }
      } catch (error) {
        console.error('Error al configurar las notificaciones:', error);
      }
    };

    setupNotifications();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Pantallas de autenticación */}
      <Stack.Screen
        name="(auth)/login"
        options={{
          title: 'Iniciar Sesión',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(auth)/register"
        options={{
          title: 'Crear Cuenta',
        }}
      />
      <Stack.Screen
        name="(auth)/forgotPassword"
        options={{
          title: 'Recuperar Contraseña',
        }}
      />
      {/* Pantallas principales */}
      <Stack.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
        }}
      />
      <Stack.Screen
        name="(auth)/settings"
        options={{
          title: 'Configuración',
        }}
      />
      <Stack.Screen
        name="newPregnancy"
        options={{
          title: 'Nuevo Registro',
        }}
      />
      <Stack.Screen
        name="viewPregnancy"
        options={{
          title: 'Ver Registros',
        }}
      />
    </Stack>
  );
}