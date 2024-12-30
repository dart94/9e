import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen 
        name="(auth)/login" 
        options={{ 
          title: 'Iniciar Sesión',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="(auth)/dashboard" 
        options={{ 
          title: 'Dashboard',
          headerShown: true 
        }} 
      />
    </Stack>
  );
}