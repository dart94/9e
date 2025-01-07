import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router'; // Cambiado para expo-router
import { styles } from '../app/theme/styles';

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
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={styles.title}>¿Quieres cerrar sesión?</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
