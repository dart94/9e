// services/hooks/usePushNotifications.ts
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '@/services/notifications/registerPushToken';
import { NotificationService } from '@/services/notifications/NotificationService';
import { useRouter } from 'expo-router';

export const usePushNotifications = () => {
  const router = useRouter();

  useEffect(() => {
    console.log('🚀 Iniciando notificaciones');
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const setupNotifications = async () => {
      try {
        const isInitialized = await NotificationService.initialize();
        if (isInitialized) {
          subscription = await NotificationService.setupNotificationListeners(
            (notification) => {
              console.log('🔔 Notificación recibida:', notification);
            },
            router
          );
        }
      } catch (error) {
        console.error('🔥 Error al configurar las notificaciones:', error);
      }
    };

    setupNotifications();

    return () => {
      subscription?.remove();
    };
  }, [router]);
};
