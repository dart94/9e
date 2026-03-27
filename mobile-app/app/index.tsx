import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';
import { COLORS } from '../src/theme/theme';

export default function Index() {
  const [destination, setDestination] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('hasSeenOnboarding').then((value) => {
      setDestination(value === 'true' ? '/(auth)/login' : '/onboarding');
    });
  }, []);

  if (!destination) {
    // Breve espera mientras leemos AsyncStorage (la splash screen ya está activa)
    return <View style={{ flex: 1, backgroundColor: COLORS.background }} />;
  }

  return <Redirect href={destination as any} />;
}
