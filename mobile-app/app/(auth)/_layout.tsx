import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          title: 'Iniciar Sesión',
          headerShown: false, // Oculta el encabezado si no es necesario
        }}
      />
      <Stack.Screen
        name="register"
        options={{ title: 'Crear Cuenta' }}
      />
      <Stack.Screen
        name="forgotPassword"
        options={{ title: 'Recuperar Contraseña' }}
      />
    </Stack>
  );
}
