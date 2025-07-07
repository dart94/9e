import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { NotificationService } from '../services/notifications/NotificationService';

export default function Layout() {
  const router = useRouter();

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const setupNotifications = async () => {
      try {
        const isInitialized = await NotificationService.initialize();
        if (isInitialized) {
          // Aquí definimos un callback para cuando se recibe una notificación
          subscription = await NotificationService.setupNotificationListeners(
            (notification) => {
              console.log('Notificación recibida:', notification);
            },
            router // Pasamos router como segundo parámetro para la navegación
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
  }, [router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
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
      <Stack.Screen
        name="(tabs)/index"
        options={{
          title: 'Dashboard',
        }}
      />
      <Stack.Screen
        name="(tabs)/settings"
        options={{
          title: 'Configuración',
        }}
      />
      <Stack.Screen
        name="(tabs)/newPregnancy"
        options={{
          title: 'Nuevo Registro',
        }}
      />
      <Stack.Screen
        name="(tabs)/viewPregnancy"
        options={{
          title: 'Ver Registros',
        }}
      />
      <Stack.Screen
        name="(tabs)/PostParto"
        options={{
          title: 'Seguimiento Postparto',
        }}
      />
    </Stack>
    
  );
}

