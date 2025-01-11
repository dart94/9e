import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import axios from 'axios';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../app/config/config';
import { layoutStyles } from '../app/theme/styles/layoutStyles';
import { textStyles } from '../app/theme/styles/textStyles';
import { miscStyles } from '../app/theme/styles/miscStyles';
import { ProgressBar } from 'react-native-paper';
import SettingsScreen from './(auth)/settings';
import ViewPregnancyRecordsScreen from './viewPregnancy';
import NewPregnancyRecordScreen from './newPregnancy';
import { useRouter } from 'expo-router';

const Tab = createBottomTabNavigator();

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

  return (
    <ScrollView style={layoutStyles.container}>
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
            <FlatList
              data={week_info.sintomas_comunes}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => <Text style={textStyles.listItem}>- {item}</Text>}
            />
          </View>
          <View style={miscStyles.card}>
            <Text style={textStyles.subtitle}>Consejos</Text>
            <FlatList
              data={week_info.consejos}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => <Text style={textStyles.listItem}>- {item}</Text>}
            />
          </View>
          <View style={miscStyles.card}>
            <Text style={textStyles.subtitle}>Pruebas Médicas</Text>
            <FlatList
              data={week_info.pruebas_medicas}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => <Text style={textStyles.listItem}>- {item}</Text>}
            />
          </View>
        </>
      ) : (
        <Text style={textStyles.errorText}>No hay información disponible para esta semana.</Text>
      )}
    </ScrollView>
  );
}

export default function DashboardScreen() {
  const router = useRouter();

  const logout = async () => {
    Alert.alert('Confirmación', '¿Estás seguro de que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('user');
            router.replace('/(auth)/login');
          } catch (error) {
            console.error('Error al cerrar sesión:', error);
            Alert.alert('Error', 'No se pudo cerrar sesión.');
          }
        },
      },
    ]);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#A1CEDC' },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#f0f0f0',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'help-circle-outline';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'ViewPregnancyRecords') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Logout') {
            iconName = 'log-out-outline';
          }

          return <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardContent}
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
        options={{ title: 'Nuevo Registro', tabBarLabel: 'Nuevo' }}
      />
      <Tab.Screen
        name="ViewPregnancyRecords"
        component={ViewPregnancyRecordsScreen}
        options={{ title: 'Ver Registros', tabBarLabel: 'Registros' }}
      />
      <Tab.Screen
        name="Logout"
        component={() => null}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            logout();
          },
        }}
        options={{
          title: 'Cerrar Sesión',
          tabBarLabel: 'Logout',
          tabBarStyle: { backgroundColor: '#FF4D4F' },
        }}
      />
    </Tab.Navigator>
  );
}
