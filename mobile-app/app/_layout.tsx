import { useEffect, useState } from 'react';
import { Redirect, Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, View } from 'react-native';

export default function AppLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userToken = await SecureStore.getItemAsync('userToken');
        setIsAuthenticated(!!userToken);
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Mostrar indicador de carga mientras se verifica la autenticación
  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Rutas públicas */}
      <Stack.Screen
        name="(auth)/login"
        options={{ headerShown: false }}
        redirect={isAuthenticated}
      />
      <Stack.Screen
        name="(auth)/register"
        options={{ headerShown: false }}
        redirect={isAuthenticated}
      />
      <Stack.Screen
        name="(auth)/forgotPassword"
        options={{ headerShown: false }}
        redirect={isAuthenticated}
      />
      
      {/* Rutas protegidas */}
      <Stack.Screen
        name="dashboard"
        options={{ headerShown: false }}
        redirect={!isAuthenticated}
      />
      <Stack.Screen
        name="newPregnancy"
        options={{ headerShown: false }}
        redirect={!isAuthenticated}
      />
      <Stack.Screen
        name="viewPregnancy"
        options={{ headerShown: false }}
        redirect={!isAuthenticated}
      />
      <Stack.Screen
        name="(auth)/settings"
        options={{ headerShown: false }}
        redirect={!isAuthenticated}
      />
      
      {/* Página por defecto y manejo de error */}
      <Stack.Screen name="index" initialParams={{ redirect: isAuthenticated ? "/dashboard" : "/(auth)/login" }} />
    </Stack>
  );
}