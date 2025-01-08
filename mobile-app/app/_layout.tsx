import { Stack } from 'expo-router';
import { COLORS, SIZES } from '../app/theme/theme';

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
<<<<<<< HEAD
        }}
=======
          headerShown: false 
        }} 
>>>>>>> origin/main
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Configuración',
        }}
      />
      <Stack.Screen
        name="newPregnancyRecord"
        options={{
          title: 'Nuevo Registro',
        }}
        />
      <Stack.Screen
        name="viewPregnancyRecords"
        options={{
          title: 'Ver Registros',
        }}
      />
      <Stack.Screen
        name="Logout"
        options={{
          title: 'Cerrar Sesión',
          headerShown: true,
        }}
        />
    </Stack>
    
  );
}
