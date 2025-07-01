import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../src/config/config';
import { layoutStyles } from '../src/theme/styles/layoutStyles';
import { textStyles } from '../src/theme/styles/textStyles';
import { miscStyles } from '../src/theme/styles/miscStyles';
import { ProgressBar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { buttonStyles } from '@/src/theme/styles';
import * as SecureStore from 'expo-secure-store';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PosPartoModal } from '@/components/modals/posPartoModal';
import { BirthFloatingButton } from '@/components/CustomInput';
import { getDashboard } from '@/api/dashboard';

// Importa las pantallas adicionales
import SettingsScreen from './(auth)/settings';
import NewPregnancyRecordScreen from './newPregnancy';
import ViewPregnancyRecordsScreen from './viewPregnancy';
import LogoutScreen from '../utils/auth';

function DashboardContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [showPostpartoModal, setShowPostpartoModal] = useState(false);
  
useEffect(() => {
  const fetchData = async () => {
    try {
      const dashboardData = await getDashboard();
      setData(dashboardData);
    } catch (err: any) {
      console.error("Error al cargar datos:", err);

      switch (err.code) {
        case "NO_TOKEN":
          setError("No se encontró el token de autenticación.");
          break;
        case "UNAUTHORIZED":
          setError("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
          break;
        case "SERVER_ERROR":
          setError("Ocurrió un problema en el servidor.");
          break;
        default:
          setError("No se pudo cargar la información.");
      }
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  if (loading)
    return (
      <View style={[layoutStyles.container, layoutStyles.center]}>
        <ActivityIndicator size="large" color={textStyles.title.color} />
        <Text style={textStyles.title}>Cargando datos...</Text>
      </View>
    );

  if (error) {
    // Si el error indica que el usuario es nuevo, mostramos una tarjeta visual con botón
    if (error === 'Registra tu embarazo desde el menú "Nuevo".') {
      return (
        <View style={[layoutStyles.container, layoutStyles.center]}>
          <View style={miscStyles.card}>
            
            <Ionicons
              name="information-circle-outline"
              size={48}
              color={textStyles.errorText.color}
            />
            <Text style={textStyles.errorText}>
              ¡Bienvenida a Embrace! Aún no has registrado tu embarazo.
            </Text>
            <Text style={textStyles.body}>
              Puedes empezar registrando tu propio embarazo o seguir el de un ser querido.
            </Text>
            <TouchableOpacity
              style={buttonStyles.button}
              onPress={() => router.push('/newPregnancy')}
            >
              <Text style={buttonStyles.buttonText}>Registrar ahora</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    // Para otros errores mostramos el mensaje simple 
    return (
      <View style={[layoutStyles.container, layoutStyles.center]}>
        <Text style={textStyles.errorText}>{error}</Text>
      </View>
    );
  }

  const { current_week, progress_percentage, week_info, month } = data;

  const normalizedProgress = progress_percentage
    ? Math.min(100, Math.max(0, Math.floor(progress_percentage)))
    : 0;
  const safeProgress = normalizedProgress / 100;

  const renderList = (items: string[]) => (
    <View>
      {items.map((item, index) => (
        <Text key={index} style={textStyles.listItem}>
          - {item}
        </Text>
      ))}
    </View>
  );

  return (
  <View style={{ flex: 1 }}>
    <ScrollView style={layoutStyles.container}>
      <View style={miscStyles.card}>
        <Text style={textStyles.title}>
          Semana {current_week || 'N/A'} de 40
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Image
            source={{
              uri: `${API_CONFIG.BASE_URL}/static/images/development/month${month}.png`,
            }}
            style={miscStyles.image}
          />
        </View>

        <Text style={textStyles.subtitle}>Progreso: {normalizedProgress}%</Text>
        <ProgressBar
          progress={safeProgress}
          color={textStyles.subtitle.color}
          style={[miscStyles.progressBar, { height: 8 }]}
        />

        {week_info && (
          <>
            <Text style={textStyles.subtitle}>Tamaño</Text>
            <Text style={textStyles.paragraph}> Tu bebé está creciendo: Ya mide
              {week_info.tamano}, y pesa alrededor de: {week_info.peso}
            </Text>
            <Image
              source={{
                uri: `${API_CONFIG.BASE_URL}/static/images/img/s${current_week}.png`,
              }}
              style={miscStyles.image2}
            />
            <Text style={textStyles.subtitle}>Comparación</Text>
            <Text style={textStyles.paragraph}>{week_info.comparacion}</Text>
          </>
        )}
      </View>

      {week_info ? (
        <>
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

    {/* MODAL + BOTÓN flotante solo si es semana 37+ */}
    {current_week >= 36 && (
      <>
        <BirthFloatingButton onPress={() => setShowPostpartoModal(true)} />
        <PosPartoModal
          visible={showPostpartoModal}
          onClose={() => setShowPostpartoModal(false)}
        />
      </>
    )}
  </View>
);
}

// Configuración del Tab Navigator
const Tab = createBottomTabNavigator();

function DashboardScreen() {
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
        tabBarStyle: { backgroundColor: '#3A7669' },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#f0f0f0',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'help-circle-outline';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'person-outline';
          } else if (route.name === 'NewPregnancyRecord') {
            iconName = focused ? 'add' : 'add-outline';
          } else if (route.name === 'ViewPregnancyRecords') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Logout') {
            iconName = 'log-out-outline';
          }

          return (
            <Ionicons
              name={iconName as keyof typeof Ionicons.glyphMap}
              size={size}
              color={color}
            />
          );
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
        options={{ title: 'Ver Registros', tabBarLabel: 'Ver Registros' }}
      />
      <Tab.Screen
        name="Logout"
        component={LogoutScreen}
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

export default DashboardScreen;
