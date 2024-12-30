import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function DashboardScreen() {
  const params = useLocalSearchParams();
  const { id, name } = params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido, {name}</Text>
      <Text>ID de Usuario: {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
    },
  });
  
  