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
import { styles } from '../app/theme/styles';
import { ProgressBar } from 'react-native-paper';
import SettingsScreen from './(auth)/settings';
import ViewPregnancyRecordsScreen from './viewPregnancy';
import NewPregnancyRecordScreen from './newPregnancy';
<<<<<<< HEAD:mobile-app/app/dashboard.tsx
import { useRouter } from 'expo-router'; // Usar el router para manejar la navegación
=======
import LogoutScreen from './logout';

>>>>>>> origin/main:mobile-app/app/(auth)/dashboard.tsx

// Tab Navigator
const Tab = createBottomTabNavigator();

function DashboardContent() {
  const [data, setData] = useState<any>(null); // Datos del backend
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Manejo de errores

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
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={styles.title.color} />
        <Text style={styles.title}>Cargando datos...</Text>
      </View>
    );

  if (error)
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );

  const { current_week, progress_percentage, week_info, month } = data;

  const normalizedProgress = progress_percentage
    ? Math.min(100, Math.max(0, Math.floor(progress_percentage)))
    : 0;

  const safeProgress = normalizedProgress / 100;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Semana {current_week || 'N/A'} de 40</Text>
        <Image
          source={{
            uri: `${API_CONFIG.BASE_URL}/static/images/development/month${month}.png`,
          }}
          style={styles.image}
        />
        <Text style={styles.subtitle}>Progreso: {normalizedProgress}%</Text>
        <ProgressBar
          progress={safeProgress}
          color={styles.subtitle.color}
          style={[styles.progressBar, { height: 8 }]}
          theme={{
            colors: {
              primary: styles.subtitle.color,
            },
          }}
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

export default function DashboardScreen() {
  const router = useRouter(); // Usar el router para manejar la navegación

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
            router.replace('/(auth)/login'); // Redirigir al login
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
<<<<<<< HEAD:mobile-app/app/dashboard.tsx
            iconName = 'log-out-outline';
          }

          return <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={size} color={color} />;
=======
            iconName = focused ? 'log-out' : 'log-out-outline';
          }
          return (
            <Ionicons
              name={iconName as keyof typeof Ionicons.glyphMap}
              size={size}
              color={color}
            />
          );
>>>>>>> origin/main:mobile-app/app/(auth)/dashboard.tsx
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
<<<<<<< HEAD:mobile-app/app/dashboard.tsx
        name="Logout"
        component={() => null}
        listeners={{
          tabPress: (e) => {
            e.preventDefault(); // Evita la navegación
            logout(); // Ejecuta el logout
          },
        }}
        options={{
          title: 'Cerrar Sesión',
          tabBarLabel: 'Logout',
          tabBarStyle: { backgroundColor: '#FF4D4F' },
        }}
      />
=======
              name="Logout"
              component={LogoutScreen}
              options={{ title: 'Cerrar Sesión', tabBarLabel: 'Cerrar Sesión' }}
            />
>>>>>>> origin/main:mobile-app/app/(auth)/dashboard.tsx
    </Tab.Navigator>
  );
}
