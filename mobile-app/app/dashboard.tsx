import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/services/api';
import { API_CONFIG } from '../src/config/config';
import { layoutStyles } from '../src/theme/styles/layoutStyles';
import { textStyles } from '../src/theme/styles/textStyles';
import { miscStyles } from '../src/theme/styles/miscStyles';
import { ProgressBar } from 'react-native-paper';
import SettingsScreen from './(auth)/settings';
import ViewPregnancyRecordsScreen from './viewPregnancy';
import NewPregnancyRecordScreen from './newPregnancy';
import { COLORS } from '../src/theme/theme';
import { LoadingScreen } from '../src/components';

const Tab = createBottomTabNavigator();

function DashboardContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setError('No se pudo obtener el usuario autenticado.');
        return;
      }

      const response = await api.get('/api/pregnancy/dashboard', {
        params: { user_id: userId },
      });

      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      setError('Error al cargar los datos del dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) return <LoadingScreen message="Cargando datos..." />;

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

  const renderList = (items: string[]) => {
    return (
      <View>
        {items.map((item, index) => (
          <Text key={index} style={textStyles.listItem}>
            - {item}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <ScrollView
      style={layoutStyles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    >
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

      {week_info ? (
        <>
          <View style={miscStyles.card}>
            <Text style={textStyles.subtitle}>Desarrollo del Bebé</Text>
            <Text style={textStyles.paragraph}>{week_info.desarrollo_bebe}</Text>
          </View>
          <View style={miscStyles.card}>
            <Text style={textStyles.subtitle}>Cambios en la Madre</Text>
            <Text style={textStyles.paragraph}>{week_info.cambios_madre}</Text>
          </View>
          <View style={miscStyles.card}>
            <Text style={textStyles.subtitle}>Síntomas Comunes</Text>
            {renderList(week_info.sintomas_comunes)}
          </View>
          <View style={miscStyles.card}>
            <Text style={textStyles.subtitle}>Consejos</Text>
            {renderList(week_info.consejos)}
          </View>
          <View style={miscStyles.card}>
            <Text style={textStyles.subtitle}>Pruebas Médicas</Text>
            {renderList(week_info.pruebas_medicas)}
          </View>
        </>
      ) : (
        <Text style={textStyles.errorText}>
          No hay información disponible para esta semana.
        </Text>
      )}
    </ScrollView>
  );
}

export default function DashboardScreen() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: COLORS.tabBar },
        tabBarActiveTintColor: COLORS.tabBarActive,
        tabBarInactiveTintColor: COLORS.tabBarInactive,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'help-circle-outline';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'NewPregnancyRecord') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'ViewPregnancyRecords') {
            iconName = focused ? 'list' : 'list-outline';
          }

          return <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardContent}
        options={{ title: 'Inicio', tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Perfil', tabBarLabel: 'Perfil' }}
      />
      <Tab.Screen
        name="NewPregnancyRecord"
        component={NewPregnancyRecordScreen}
        options={{ title: 'Nuevo Registro', tabBarLabel: 'Nuevo' }}
      />
      <Tab.Screen
        name="ViewPregnancyRecords"
        component={ViewPregnancyRecordsScreen}
        options={{ title: 'Ver Registros', tabBarLabel: 'Registros' }}
      />
    </Tab.Navigator>
  );
}
