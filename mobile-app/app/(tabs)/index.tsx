import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../../src/config/config";
import { layoutStyles } from "../../src/theme/styles/layoutStyles";
import { textStyles } from "../../src/theme/styles/textStyles";
import { miscStyles } from "../../src/theme/styles/miscStyles";
import { ProgressBar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { buttonStyles } from "@/src/theme/styles";
import * as SecureStore from "expo-secure-store";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { PosPartoModal } from "@/components/modals/posPartoModal";
import { BirthFloatingButton } from "@/components/CustomInput";
import { getDashboard } from "@/api/dashboard";
import { useBornUser } from "@/hooks/useBornUser";

// Importa las pantallas adicionales
import SettingsScreen from "./settings";
import NewPregnancyRecordScreen from "./newPregnancy";
import ViewPregnancyRecordsScreen from "./viewPregnancy";
import LogoutScreen from "../../utils/auth";
import PostpartumScreen from "./PostParto";

function DashboardContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [showPostpartoModal, setShowPostpartoModal] = useState(false);
  const {
    bornUser,
    loading: bornUserLoading,
    error: bornUserError,
  } = useBornUser();

  //Hook para obtener datos del dashboard
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await getDashboard();
        setData(dashboardData);
      } catch (err: any) {
        switch (err.code) {
          case "NO_TOKEN":
            setError("No se encontró el token de autenticación.");
            break;
          case "UNAUTHORIZED":
            setError(
              "Tu sesión ha expirado. Por favor inicia sesión nuevamente."
            );
            break;
          case "USER_NOT_FOUND":
            setError('Registra tu embarazo desde el menú "Nuevo".');
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

  // ✅ Solo loading del dashboard, no del bornUser
  if (loading) {
    return (
      <View style={[layoutStyles.container, layoutStyles.center]}>
        <ActivityIndicator size="large" color={textStyles.title.color} />
        <Text style={textStyles.title}>Cargando datos...</Text>
      </View>
    );
  }

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
              Puedes empezar registrando tu propio embarazo o seguir el de un
              ser querido.
            </Text>
            <TouchableOpacity
              style={buttonStyles.button}
              onPress={() => router.push("/(tabs)/viewPregnancy")}
            >
              <Text style={buttonStyles.buttonText}>Registrar ahora</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Reimplementación de fetchData para reintentar la carga de datos del dashboard
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const dashboardData = await getDashboard();
        setData(dashboardData);
      } catch (err: any) {
        switch (err.code) {
          case "NO_TOKEN":
            setError("No se encontró el token de autenticación.");
            break;
          case "UNAUTHORIZED":
            setError(
              "Tu sesión ha expirado. Por favor inicia sesión nuevamente."
            );
            break;
          case "USER_NOT_FOUND":
            setError('Registra tu embarazo desde el menú "Nuevo".');
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
    }

    // Para otros tipos de error, mostrar un componente de error genérico
    return (
      <View style={[layoutStyles.container, layoutStyles.center]}>
        <View style={miscStyles.card}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={textStyles.errorText.color}
          />
          <Text style={textStyles.errorText}>Error</Text>
          <Text style={textStyles.body}>{error}</Text>
          <TouchableOpacity
            style={buttonStyles.button}
            onPress={() => {
              setError(null);
              setLoading(true);
              // Reintenta la carga
              fetchData();
            }}
          >
            <Text style={buttonStyles.buttonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
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
            Semana {current_week || "N/A"} de 40
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Image
              source={{
                uri: `${API_CONFIG.BASE_URL}/static/images/development/month${month}.png`,
              }}
              style={miscStyles.image}
            />
          </View>

          <Text style={textStyles.subtitle}>
            Progreso: {normalizedProgress}%
          </Text>
          <ProgressBar
            progress={safeProgress}
            color={textStyles.subtitle.color}
            style={[miscStyles.progressBar, { height: 8 }]}
          />

          {week_info && (
            <>
              <Text style={textStyles.subtitle}>Tamaño</Text>
              <Text style={textStyles.paragraph}>
                {" "}
                Tu bebé está creciendo: Ya mide
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
              <Text style={textStyles.paragraph}>
                {week_info.cambios_madre}
              </Text>
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

      {/* MODAL + BOTÓN flotante solo si es semana 34+ y el usuario no tiene un registro en bornUser */}
      {current_week >= 34 && !bornUser && (
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
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const { bornUser, loading: bornUserLoading } = useBornUser();
  const isBornUser = Boolean(bornUser); //

  // Mostrar la pestaña de postpartum solo si la semana actual es mayor a 34 semanas o si el usuario es un bebé
  const showPostpartumTab =
    currentWeek !== null &&
    !bornUserLoading &&
    (currentWeek > 34 || isBornUser);

  // Fetch a dashboard para obtener la semana actual
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const dashboardData = await getDashboard();
        setCurrentWeek(dashboardData.current_week);
      } catch (err) {
        setCurrentWeek(null);
      }
    };
    fetchDashboard();
  }, []);

  const logout = async () => {
    Alert.alert("Confirmación", "¿Estás seguro de que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("userId");
            await AsyncStorage.removeItem("user");
            router.replace("/(auth)/login");
          } catch (error) {
            Alert.alert("Error", "No se pudo cerrar sesión.");
          }
        },
      },
    ]);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: "#3A7669" },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#f0f0f0",
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = "help-circle-outline";

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "person-circle-outline";
          } else if (route.name === "NewPregnancyRecord") {
            iconName = focused ? "add" : "add-circle-outline";
          } else if (route.name === "ViewPregnancyRecords") {
            iconName = focused ? "list" : "document-text-outline";
          } else if (route.name === "PostParto" && showPostpartumTab) {
            iconName = focused ? "happy" : "happy-outline";
          } else if (route.name === "Logout") {
            iconName = "log-out-outline";
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
        options={{ title: "Seguimiento", tabBarLabel: "Inicio" }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Tu Perfil", tabBarLabel: "Perfil" }}
      />
      <Tab.Screen
        name="ViewPregnancyRecords"
        component={ViewPregnancyRecordsScreen}
        options={{ title: "Mis Registros", tabBarLabel: "Historial" }}
      />
      {showPostpartumTab && (
        <Tab.Screen
          name="PostParto"
          component={PostpartumScreen}
          options={{ title: "Seguimiento Postparto", tabBarLabel: "Postparto" }}
        />
      )}
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
          title: "Cerrar Sesión",
          tabBarLabel: "Salir",
          tabBarStyle: { backgroundColor: "#FF4D4F" },
        }}
      />
    </Tab.Navigator>
  );
}

export default DashboardScreen;
