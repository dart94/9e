import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  RefreshControl,
  Animated,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/services/api';
import { API_CONFIG } from '../src/config/config';
import { ProgressBar } from 'react-native-paper';
import SettingsScreen from './(auth)/settings';
import ViewPregnancyRecordsScreen from './viewPregnancy';
import NewPregnancyRecordScreen from './newPregnancy';
import { COLORS, SIZES, FONTS } from '../src/theme/theme';
import { LoadingScreen, DashboardSkeleton, EmptyState } from '../src/components';
import { useNavigation } from '@react-navigation/native';
import { haptics } from '../src/services/haptics';
import { textStyles } from '../src/theme/styles/textStyles';

const Tab = createBottomTabNavigator();

// Configuración visual por categoría de card
const CARD_CONFIG = {
  baby: { accent: COLORS.primary, icon: 'heart-outline' as const, label: 'Desarrollo del Bebé' },
  mother: { accent: COLORS.accent, icon: 'woman-outline' as const, label: 'Cambios en la Madre' },
  symptoms: { accent: '#B57BEE', icon: 'medical-outline' as const, label: 'Síntomas Comunes' },
  tips: { accent: COLORS.success, icon: 'bulb-outline' as const, label: 'Consejos' },
  tests: { accent: '#5B9BD5', icon: 'flask-outline' as const, label: 'Pruebas Médicas' },
};

function AnimatedCard({
  children,
  delay,
  accentColor,
}: {
  children: React.ReactNode;
  delay: number;
  accentColor?: string;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay, tension: 70, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        dashStyles.card,
        accentColor && { borderLeftWidth: 4, borderLeftColor: accentColor },
        { opacity, transform: [{ translateY }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function SectionCard({
  config,
  children,
  delay,
}: {
  config: (typeof CARD_CONFIG)[keyof typeof CARD_CONFIG];
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <AnimatedCard delay={delay} accentColor={config.accent}>
      <View style={dashStyles.cardHeader}>
        <View style={[dashStyles.iconBadge, { backgroundColor: config.accent + '20' }]}>
          <Ionicons name={config.icon} size={18} color={config.accent} accessibilityLabel="" />
        </View>
        <Text style={dashStyles.cardTitle}>{config.label}</Text>
      </View>
      {children}
    </AnimatedCard>
  );
}

function BulletItem({ text }: { text: string }) {
  return (
    <View style={dashStyles.bulletRow}>
      <Ionicons name="ellipse" size={6} color={COLORS.primary} style={dashStyles.bullet} accessibilityLabel="" />
      <Text style={dashStyles.bulletText}>{text}</Text>
    </View>
  );
}

function AnimatedProgressBar({ progress, color }: { progress: number; color: string }) {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    animatedProgress.addListener(({ value }) => setDisplayProgress(value));
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 1200,
      delay: 300,
      useNativeDriver: false,
    }).start();
    return () => animatedProgress.removeAllListeners();
  }, [progress]);

  return (
    <ProgressBar
      progress={displayProgress}
      color={color}
      style={dashStyles.progressBar}
    />
  );
}

function DashboardContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const navigation = useNavigation<any>();

  const onRegisterNow = () => navigation.navigate('NewPregnancyRecord');

  // Animaciones del hero
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroScale = useRef(new Animated.Value(0.95)).current;

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get('/api/pregnancy/dashboard');
      setData(response.data);
      setError(null);
      setIsEmpty(false);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setIsEmpty(true);
        setError(null);
      } else {
        setError('No se pudo cargar el dashboard. Verifica tu conexión.');
        setIsEmpty(false);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (data) {
      Animated.parallel([
        Animated.timing(heroOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(heroScale, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
      ]).start();
    }
  }, [data]);

  const onRefresh = () => {
    haptics.impact();
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) return <DashboardSkeleton />;

  if (isEmpty)
    return (
      <EmptyState
        icon="heart-outline"
        message="¡Bienvenida a Embrace!"
        subMessage="Aún no has registrado tu embarazo. Puedes empezar registrando tu propio embarazo o seguir el de un ser querido."
        actionLabel="Registrar ahora"
        onAction={onRegisterNow}
      />
    );

  if (error)
    return (
      <View style={dashStyles.errorContainer}>
        <Ionicons name="cloud-offline-outline" size={64} color={COLORS.textLight} accessibilityLabel="Error de conexión" />
        <Text style={dashStyles.errorTitle}>No se pudo cargar</Text>
        <Text style={textStyles.errorText}>{error}</Text>
        <TouchableOpacity
          style={dashStyles.retryButton}
          onPress={() => { setLoading(true); fetchDashboardData(); }}
          accessibilityRole="button"
          accessibilityLabel="Reintentar carga del dashboard"
        >
          <Text style={dashStyles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );

  const { current_week, progress_percentage, week_info, month } = data;

  const normalizedProgress = progress_percentage
    ? Math.min(100, Math.max(0, Math.floor(progress_percentage)))
    : 0;

  const weeksRemaining = 40 - (current_week || 0);

  return (
    <ScrollView
      style={dashStyles.scrollView}
      contentContainerStyle={dashStyles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Hero card — semana y progreso */}
      <AnimatedCard delay={0} accentColor={COLORS.primary}>
        <View style={dashStyles.weekHeader}>
          <View>
            <Text style={dashStyles.weekLabel}>Semana actual</Text>
            <Text style={dashStyles.weekNumber} accessibilityRole="header">
              {current_week || '—'} <Text style={dashStyles.weekOf}>de 40</Text>
            </Text>
          </View>
          <View style={dashStyles.weeksRemaining}>
            <Text style={dashStyles.weeksRemainingNum}>{weeksRemaining > 0 ? weeksRemaining : 0}</Text>
            <Text style={dashStyles.weeksRemainingLabel}>semanas{'\n'}restantes</Text>
          </View>
        </View>

        <Animated.Image
          source={{
            uri: `${API_CONFIG.BASE_URL}/static/images/development/month${month}.png`,
          }}
          style={[dashStyles.image, { opacity: heroOpacity, transform: [{ scale: heroScale }] }]}
          accessibilityLabel={`Imagen de desarrollo del bebé, mes ${month}`}
          accessibilityRole="image"
        />

        <View style={dashStyles.progressRow}>
          <Text style={dashStyles.progressLabel}>Progreso del embarazo</Text>
          <Text style={dashStyles.progressPct}>{normalizedProgress}%</Text>
        </View>
        <AnimatedProgressBar progress={normalizedProgress / 100} color={COLORS.primary} />
      </AnimatedCard>

      {week_info ? (
        <>
          <SectionCard config={CARD_CONFIG.baby} delay={120}>
            <Text style={dashStyles.bodyText}>{week_info.desarrollo_bebe}</Text>
          </SectionCard>

          <SectionCard config={CARD_CONFIG.mother} delay={200}>
            <Text style={dashStyles.bodyText}>{week_info.cambios_madre}</Text>
          </SectionCard>

          <SectionCard config={CARD_CONFIG.symptoms} delay={280}>
            {week_info.sintomas_comunes?.map((item: string, i: number) => (
              <BulletItem key={i} text={item} />
            ))}
          </SectionCard>

          <SectionCard config={CARD_CONFIG.tips} delay={360}>
            {week_info.consejos?.map((item: string, i: number) => (
              <BulletItem key={i} text={item} />
            ))}
          </SectionCard>

          <SectionCard config={CARD_CONFIG.tests} delay={440}>
            {week_info.pruebas_medicas?.map((item: string, i: number) => (
              <BulletItem key={i} text={item} />
            ))}
          </SectionCard>
        </>
      ) : (
        <AnimatedCard delay={120}>
          <Text style={textStyles.messageText}>No hay información disponible para esta semana.</Text>
        </AnimatedCard>
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
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Settings') iconName = focused ? 'person' : 'person-outline';
          else if (route.name === 'NewPregnancyRecord') iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'ViewPregnancyRecords') iconName = focused ? 'list' : 'list-outline';
          return <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={size} color={color} accessibilityLabel={route.name} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardContent} options={{ title: 'Inicio', tabBarLabel: 'Inicio' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Perfil', tabBarLabel: 'Perfil' }} />
      <Tab.Screen name="NewPregnancyRecord" component={NewPregnancyRecordScreen} options={{ title: 'Nuevo Registro', tabBarLabel: 'Nuevo' }} />
      <Tab.Screen name="ViewPregnancyRecords" component={ViewPregnancyRecordsScreen} options={{ title: 'Ver Registros', tabBarLabel: 'Registros' }} />
    </Tab.Navigator>
  );
}

const dashStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: SIZES.spacingXL * 2,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginBottom: SIZES.spacingMD,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacingMD,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: SIZES.borderRadiusFull,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.spacingSM,
  },
  cardTitle: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    flex: 1,
  },
  // Hero / semana
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.spacingSM,
  },
  weekLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  weekNumber: {
    fontSize: SIZES.fontExtraLarge,
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    lineHeight: 40,
  },
  weekOf: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
  },
  weeksRemaining: {
    alignItems: 'flex-end',
  },
  weeksRemainingNum: {
    fontSize: SIZES.fontExtraLarge,
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
    color: COLORS.primary,
    lineHeight: 40,
  },
  weeksRemainingLabel: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    textAlign: 'right',
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'contain',
    marginVertical: SIZES.spacingMD,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacingXS,
  },
  progressLabel: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
  },
  progressPct: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    borderRadius: SIZES.borderRadiusFull,
    backgroundColor: COLORS.secondary,
  },
  // Cuerpo de texto
  bodyText: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: SIZES.lineHeight,
  },
  // Bullets
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.spacingSM,
  },
  bullet: {
    marginTop: 7,
    marginRight: SIZES.spacingSM,
  },
  bulletText: {
    flex: 1,
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: SIZES.lineHeight,
  },
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacingXL,
    gap: SIZES.spacingMD,
    backgroundColor: COLORS.background,
  },
  errorTitle: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SIZES.spacingSM,
    paddingVertical: SIZES.spacingMD,
    paddingHorizontal: SIZES.spacingXL,
    backgroundColor: COLORS.primaryDark,
    borderRadius: SIZES.borderRadius,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
  },
});
