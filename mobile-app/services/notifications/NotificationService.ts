import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import axios from 'axios';
// import { GoogleAuth } from "google-auth-library";


interface WeeklyMessages {
  [key: number]: string;
}

export class NotificationService {
  /**
   * Inicializa el servicio de notificaciones y solicita permisos
   */
  static async initialize() {
    const permissionGranted = await this.registerForPushNotificationsAsync();
    
    if (!permissionGranted) {
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

  /**
   * Registra la aplicación para notificaciones push y configura canal en Android
   */
  static async registerForPushNotificationsAsync() {
    // Para Android necesitamos crear un canal de notificaciones
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notificaciones de Embarazo',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    // Obtener permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  }

  /**
   * Programa notificaciones semanales para el seguimiento del embarazo
   */
  static async scheduleWeeklyNotifications(lastPeriodDate: Date) {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      const startDate = new Date(lastPeriodDate);
      const notifications = [];
      
      for (let week = 1; week <= 40; week++) {
        const notificationDate = new Date(startDate);
        notificationDate.setDate(notificationDate.getDate() + (week * 7));
        
        if (notificationDate > new Date()) {
          const trigger: Notifications.DateTriggerInput = {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: notificationDate,
          };
          
          const notification = {
            content: {
              title: `¡Semana ${week} de tu embarazo!`,
              body: this.getWeeklyMessage(week),
              data: { week, type: 'weekly_update' },
            },
            trigger,
          };
          
          const id = await Notifications.scheduleNotificationAsync(notification);
          notifications.push({ id, week });
        }
      }
      
      await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(notifications));
      return notifications;
    } catch (error) {
      console.error('Error al programar notificaciones semanales:', error);
      throw error;
    }
  }

  /**
   * Programa un recordatorio para una cita médica
   */
  static async scheduleAppointmentReminder(appointmentDate: Date, description: string) {
    try {
      const reminderDate = new Date(appointmentDate);
      reminderDate.setDate(reminderDate.getDate() - 1);
      
      const trigger: Notifications.DateTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
      };
      
      const notification = {
        content: {
          title: 'Recordatorio de Cita Médica',
          body: `Mañana tienes: ${description}`,
          data: { type: 'appointment', description },
        },
        trigger,
      };
      
      const id = await Notifications.scheduleNotificationAsync(notification);
      return id;
    } catch (error) {
      console.error('Error al programar recordatorio de cita:', error);
      throw error;
    }
  }

  /**
   * Envía una notificación de prueba inmediata
   */
  static async sendTestNotification() {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Prueba de notificación',
        body: 'Si ves esto, las notificaciones están funcionando correctamente',
        data: { type: 'weekly_update', week: 10},
      },
      trigger: null, // Envía inmediatamente
    });
  }

  /**
   * Obtiene y muestra en consola todas las notificaciones programadas
   */
  static async logScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('===== NOTIFICACIONES PROGRAMADAS =====');
      console.log(JSON.stringify(notifications, null, 2));
      console.log('Total de notificaciones:', notifications.length);
      return notifications;
    } catch (error) {
      console.error('Error al obtener notificaciones programadas:', error);
      return [];
    }
  }

  /**
   * Cancela una notificación específica por su ID
   */
  static async cancelNotification(id: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
      return true;
    } catch (error) {
      console.error('Error al cancelar notificación:', error);
      return false;
    }
  }

  /**
   * Configura los listeners para manejar notificaciones recibidas y respuestas
   */
  static async setupNotificationListeners(
    onNotificationReceived: (notification: Notifications.Notification) => void,
    navigation?: any
  ) {
    const subscription = Notifications.addNotificationReceivedListener(onNotificationReceived);
    
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { data } = response.notification.request.content;
      
      console.log('Usuario tocó la notificación:', data);
      
      // Navegar según el tipo de notificación
      if (data && navigation) {
        if (data.type === 'appointment') {
          navigation.navigate('dashboard');
        } else if (data.type === 'weekly_update' && data.week) {
          navigation.navigate('dashboard', { week: data.week });
        }
      }
    });
    
    return {
      remove: () => {
        subscription.remove();
        responseSubscription.remove();
      }
    };
  }

  /**
   * Obtiene el mensaje correspondiente a la semana de embarazo
   */
  private static getWeeklyMessage(week: number): string {
    const messages: WeeklyMessages = {
      4: 'El embrión está del tamaño de una semilla de amapola.',
      8: 'Tu bebé ahora se considera un feto, del tamaño de un frijol.',
      12: '¡Primera ecografía! Es momento de tu control trimestral.',
      16: 'Tu bebé ya puede mover sus dedos y tal vez chuparse el pulgar.',
      20: 'Segunda ecografía morfológica. ¡Podrías saber el sexo del bebé!',
      24: 'Tu bebé ya puede responder a estímulos externos como sonidos.',
      28: 'Comienza el tercer trimestre. ¡Importante control médico!',
      32: 'El bebé gana peso rápidamente y desarrolla más grasa corporal.',
      36: 'Recta final. Prepárate para la llegada de tu bebé.',
      40: '¡Fecha estimada de parto! Tu bebé puede llegar en cualquier momento.'
    };
    
    return messages[week] ?? `Semana ${week}: Revisa los cambios importantes de esta semana en tu bebé.`;
  }
  
  /**
   * Carga notificaciones programadas desde el almacenamiento
   */
  static async loadScheduledNotifications() {
    try {
      const storedData = await AsyncStorage.getItem('scheduledNotifications');
      if (storedData) {
        return JSON.parse(storedData);
      }
      return [];
    } catch (error) {
      console.error('Error al cargar notificaciones programadas:', error);
      return [];
    }
  }
}


