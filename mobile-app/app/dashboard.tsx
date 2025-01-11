import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  SectionList,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ProgressBar } from 'react-native-paper';
import { API_CONFIG } from '../app/config/config';
import { layoutStyles } from '../app/theme/styles/layoutStyles';
import { textStyles } from '../app/theme/styles/textStyles';
import { miscStyles } from '../app/theme/styles/miscStyles';

function DashboardContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
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

  if (loading)
    return (
      <View style={[layoutStyles.container, layoutStyles.center]}>
        <ActivityIndicator size="large" color={textStyles.title.color} />
        <Text style={textStyles.title}>Cargando datos...</Text>
      </View>
    );

  if (error)
    return (
      <View style={[layoutStyles.container, layoutStyles.center]}>
        <Text style={textStyles.errorText}>{error}</Text>
      </View>
    );

  const { current_week, progress_percentage, week_info, month } = data;

  const normalizedProgress = progress_percentage
    ? Math.min(100, Math.max(0, Math.floor(progress_percentage)))
    : 0;

  const safeProgress = normalizedProgress / 100;

  // Transformar los datos para la lista seccionada
  const sections = week_info
    ? [
        {
          title: 'Desarrollo del Bebé',
          data: [week_info.desarrollo_bebe],
        },
        {
          title: 'Cambios en la Madre',
          data: [week_info.cambios_madre],
        },
        {
          title: 'Síntomas Comunes',
          data: week_info.sintomas_comunes,
        },
        {
          title: 'Consejos',
          data: week_info.consejos,
        },
        {
          title: 'Pruebas Médicas',
          data: week_info.pruebas_medicas,
        },
      ]
    : [];

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item, index) => index.toString()}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={textStyles.subtitle}>{title}</Text>
      )}
      renderItem={({ item }) => <Text style={textStyles.paragraph}>- {item}</Text>}
      ListHeaderComponent={() => (
        <View style={miscStyles.card}>
          <Text style={textStyles.title}>Semana {current_week || 'N/A'} de 40</Text>
          <Image
            source={{
              uri: `${API_CONFIG.BASE_URL}/static/images/development/month${month}.png`,
            }}
            style={miscStyles.image}
          />
          <Text style={textStyles.subtitle}>Progreso: {normalizedProgress}%</Text>
          <ProgressBar
            progress={safeProgress}
            color={textStyles.subtitle.color}
            style={[miscStyles.progressBar, { height: 8 }]}
          />
        </View>
      )}
      ListEmptyComponent={() => (
        <Text style={textStyles.errorText}>No hay información disponible para esta semana.</Text>
      )}
      contentContainerStyle={layoutStyles.container}
    />
  );
}

export default DashboardContent;
