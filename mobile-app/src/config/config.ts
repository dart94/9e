import Constants from 'expo-constants';

const getBaseUrl = () => {
  // Si estamos en desarrollo, usar el backend local
  if (__DEV__) {
    // IPLOCAL
    return 'http://192.168.13.38:5000';
  }
  //  usar Railway
  return 'https://9e-production.up.railway.app';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
};