import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WeeklyMessages {
  [key: number]: string;
}

export class NotificationService {
  static async initialize() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return false;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    return true;
  }

  static async scheduleWeeklyNotifications(lastPeriodDate: Date) {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const startDate = new Date(lastPeriodDate);
    const notifications = [];

    for (let week = 1; week <= 40; week++) {
      const notificationDate = new Date(startDate);
      notificationDate.setDate(notificationDate.getDate() + (week * 7));

      if (notificationDate > new Date()) {
        const trigger: Notifications.DateTriggerInput = {
          type: 'calendar',
          date: notificationDate
        };

        const notification = {
          content: {
            title: `¡Semana ${week} de tu embarazo!`,
            body: this.getWeeklyMessage(week),
            data: { week },
          },
          trigger,
        };

        const id = await Notifications.scheduleNotificationAsync(notification);
        notifications.push({ id, week });
      }
    }

    await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(notifications));
  }

  static async scheduleAppointmentReminder(appointmentDate: Date, description: string) {
    const reminderDate = new Date(appointmentDate);
    reminderDate.setDate(reminderDate.getDate() - 1);

    const trigger: Notifications.DateTriggerInput = {
      type: 'calendar',
      date: reminderDate
    };

    const notification = {
      content: {
        title: 'Recordatorio de Cita Médica',
        body: `Mañana tienes: ${description}`,
        data: { type: 'appointment' },
      },
      trigger,
    };

    return await Notifications.scheduleNotificationAsync(notification);
  }

  private static getWeeklyMessage(week: number): string {
    const messages: WeeklyMessages = {
      12: '¡Primera ecografía! Es momento de tu control trimestral.',
      20: 'Segunda ecografía morfológica. ¡Podrías saber el sexo del bebé!',
      28: 'Comienza el tercer trimestre. ¡Importante control médico!',
      36: 'Recta final. Prepárate para la llegada de tu bebé.',
    };

    return messages[week] ?? `Revisa los cambios importantes de esta semana en tu bebé.`;
  }

  static async setupNotificationListeners(onNotificationReceived: (notification: Notifications.Notification) => void) {
    const subscription = Notifications.addNotificationReceivedListener(onNotificationReceived);
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { data } = response.notification.request.content;
      // Manejar la navegación o acción específica según el tipo de notificación
    });

    return {
      remove: () => {
        subscription.remove();
        responseSubscription.remove();
      }
    };
  }
}
