import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router'; // Cambiado para expo-router
import { layoutStyles } from '../app/theme/styles/layoutStyles';
import { textStyles } from '../app/theme/styles/textStyles';
import { buttonStyles } from '../app/theme/styles/buttonStyles';

export default function LogoutScreen() {
  const router = useRouter(); // Usar router para redirigir

  const handleLogout = async () => {
    Alert.alert(
      'Confirmación',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              // Eliminar datos del AsyncStorage
              await AsyncStorage.removeItem('userId');
              await AsyncStorage.removeItem('user');

              // Redirigir al inicio de sesión
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[layoutStyles.container, layoutStyles.center]}>
      <Text style={textStyles.title}>Cerrar Sesión</Text>
      <TouchableOpacity
        style={buttonStyles.button}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Text style={buttonStyles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
