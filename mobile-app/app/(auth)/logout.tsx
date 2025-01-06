import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { styles } from '../theme/styles';

export default function LogoutScreen() {
  const navigation = useNavigation();
  
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
              await AsyncStorage.removeItem('userId');
              // Obtener el navegador raíz
              const rootNavigation = navigation.getParent()?.getParent();
              if (rootNavigation) {
                rootNavigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  })
                );
              }
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