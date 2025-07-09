import { Stack } from 'expo-router';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function Layout() {
  usePushNotifications();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/register" options={{ title: 'Crear Cuenta' }} />
      <Stack.Screen name="(auth)/forgotPassword" options={{ title: 'Recuperar Contraseña' }} />
      <Stack.Screen name="(tabs)/index" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="(tabs)/settings" options={{ title: 'Configuración' }} />
      <Stack.Screen name="(tabs)/newPregnancy" options={{ title: 'Nuevo Registro' }} />
      <Stack.Screen name="(tabs)/viewPregnancy" options={{ title: 'Ver Registros' }} />
      <Stack.Screen name="(tabs)/PostParto" options={{ title: 'Seguimiento Postparto' }} />
    </Stack>
  );
}
