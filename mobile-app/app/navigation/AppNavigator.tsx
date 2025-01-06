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
import NewPregnancyRecordScreen from '../(auth)/newPregnancy';
import ViewPregnancyRecordsScreen from '../(auth)/viewPregnancy';
import LogoutScreen from '../(auth)/logout';

// Tipos de parámetros para navegadores
export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  NewPregnancyRecord: undefined;
  ViewPregnancyRecords: undefined;
  Logout: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Settings: undefined;
  NewPregnancyRecord: undefined;
  ViewPregnancyRecords: undefined;
  Logout: undefined;
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
        headerShown: false,
        tabBarStyle: { backgroundColor: '#A1CEDC' },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#f0f0f0',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'person' : 'person-circle-outline';
          } else if (route.name === 'NewPregnancyRecord') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'ViewPregnancyRecords') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Logout') {
            iconName = focused ? 'log-out' : 'log-out-outline';
          }

          return <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Inicio', tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Configuración', tabBarLabel: 'Perfil' }}
      />
      <Tab.Screen
        name="NewPregnancyRecord"
        component={NewPregnancyRecordScreen}
        options={{ title: 'Nuevo Registro', tabBarLabel: 'Nuevo Registro' }}
      />
      <Tab.Screen
        name="ViewPregnancyRecords"
        component={ViewPregnancyRecordsScreen}
        options={{ title: 'Ver Registros', tabBarLabel: 'Registros' }}
      />
      <Tab.Screen
        name="Logout"
        component={LogoutScreen}
        options={{ title: 'Cerrar Sesión', tabBarLabel: 'Cerrar Sesión' }}
      />
      <Tab.Screen
        name="Logout"
        component={LogoutScreen}
        options={{ title: 'Cerrar Sesión', tabBarLabel: 'Cerrar Sesión' }}
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
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NewPregnancyRecord"
          component={NewPregnancyRecordScreen}
          options={{ title: 'Nuevo Registro' }}
        />
        <Stack.Screen
          name="ViewPregnancyRecords"
          component={ViewPregnancyRecordsScreen}
          options={{ title: 'Ver Registros' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}