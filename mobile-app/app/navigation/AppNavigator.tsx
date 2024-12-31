import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../(auth)/login';
import DashboardScreen from '../(auth)/dashboard';
import ForgotPasswordScreen from '../(auth)/forgotPassword';
import RegisterScreen from '../(auth)/register';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: {
      user: {
        id: number | string;
        name: string;
      };
    };
    Register: undefined;
    ForgotPassword: undefined;
  };
  


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ title: 'Iniciar Sesión' }}
      />
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: 'Dashboard' }}
      />,
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: 'Recuperar Contraseña' }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ title: 'Crear Cuenta' }} 
      />
    </Stack.Navigator>

    
  );
}