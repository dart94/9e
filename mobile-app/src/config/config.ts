import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (__DEV__) {
    // En web el browser hace fetch desde localhost, no desde la IP de red
    if (Platform.OS === 'web') {
      return 'http://localhost:5000';
    }
    const devHost = process.env.EXPO_PUBLIC_DEV_API_HOST ?? '192.168.13.44';
    return `http://${devHost}:5000`;
  }
  return 'https://9e-production.up.railway.app';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
};