import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from '../(auth)/login';
import DashboardScreen from '../(auth)/dashboard';
import ForgotPasswordScreen from '../(auth)/forgotPassword';
import RegisterScreen from '../(auth)/register';
import SettingsScreen from '../(auth)/settings';

// Tipos de parámetros para navegadores
export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined; // Navegador de pestañas anidado
  Register: undefined;
  ForgotPassword: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Settings: undefined;
};

// Instancias de navegadores
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Navegador de Pestañas (Tabs)
function MainTabs() {
  return (
    <Tab.Navigator
    initialRouteName="Dashboard"
    screenOptions={({ route }) => ({
      headerShown: false, // Oculta encabezados propios del Tab.Navigator
      tabBarStyle: { backgroundColor: '#A1CEDC' },
      tabBarActiveTintColor: '#fff',
      tabBarInactiveTintColor: '#f0f0f0',
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: string = 'help-circle-outline';
        if (route.name === 'Dashboard') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Settings') {
          iconName = focused ? 'settings' : 'settings-outline';
        }
        return <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen} 
      options={{ title: 'Inicio', tabBarLabel: 'Inicio' }} 
    />
    <Tab.Screen 
      name="Settings" 
      component={SettingsScreen} 
      options={{ title: 'Configuración', tabBarLabel: 'Perfil' }} 
    />
  </Tab.Navigator>
  );
}

// Navegador Principal (Stack)
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Iniciar Sesión' }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: 'Crear Cuenta' }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ title: 'Recuperar Contraseña' }}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }} // Oculta encabezado del Stack cuando muestra las pestañas
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
