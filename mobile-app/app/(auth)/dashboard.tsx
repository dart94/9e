import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, Alert, ScrollView, Image } from 'react-native';
import axios from 'axios';
import { API_CONFIG } from '../config/config';
import { styles } from '../theme/styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressBar } from 'react-native-paper';

export default function DashboardScreen() {
  const [data, setData] = useState<any>(null); // Datos del backend
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Manejo de errores

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Consultando datos del dashboard...');
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          setError('No se pudo obtener el usuario autenticado.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/dashboard`, {
          params: { user_id: userId },
          withCredentials: true,
        });

        setData(response.data);
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('Error al cargar los datos del dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={styles.title.color} />
        <Text style={styles.title}>Cargando datos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const { current_week, progress_percentage, week_info, month } = data;

  return (
    <ScrollView style={styles.container}>
          <View style={styles.card}>
          {/* Información de la Semana */}
          <Text style={styles.title}>Semana {current_week || 'N/A'}</Text>

          <Image
           source={{ uri: `${API_CONFIG.BASE_URL}/static/images/development/month${month}.png` }}
           style={styles.image}
          />
          
          {/* Texto del Progreso */}
          <Text style={styles.subtitle}>
          Progreso: {progress_percentage ? `${progress_percentage.toFixed(0)}%` : 'N/A'}
          </Text>

          {/* Barra de Progreso */}
          <ProgressBar
            progress={progress_percentage ? progress_percentage / 100 : 0}
            color={styles.subtitle.color}
            style={styles.progressBar}
          />


        </View>

      {week_info ? (
        <>
          <View style={styles.card}>
            <Text style={styles.subtitle}>Desarrollo del Bebé</Text>
            <Text style={styles.paragraph}>{week_info.desarrollo_bebe}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.subtitle}>Cambios en la Madre</Text>
            <Text style={styles.paragraph}>{week_info.cambios_madre}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.subtitle}>Síntomas Comunes</Text>
            <FlatList
              data={week_info.sintomas_comunes}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => <Text style={styles.listItem}>- {item}</Text>}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.subtitle}>Consejos</Text>
            <FlatList
              data={week_info.consejos}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => <Text style={styles.listItem}>- {item}</Text>}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.subtitle}>Pruebas Médicas</Text>
            <FlatList
              data={week_info.pruebas_medicas}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => <Text style={styles.listItem}>- {item}</Text>}
            />
          </View>
        </>
      ) : (
        <Text style={styles.errorText}>No hay información disponible para esta semana.</Text>
      )}
    </ScrollView>
  );
}