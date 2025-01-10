import Constants from 'expo-constants';

export const API_CONFIG = {
  BASE_URL: Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:5000',
};
