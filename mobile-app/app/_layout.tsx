import { Stack } from 'expo-router';


export default function Layout() {
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
