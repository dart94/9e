import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'settings') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={size} color={color} />;
        },
        tabBarStyle: { backgroundColor: '#A1CEDC' },
      })}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Inicio',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Configuración',
        }}
      />
    </Tabs>
  );
}
