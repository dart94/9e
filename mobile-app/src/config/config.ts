import Constants from 'expo-constants';

const getBaseUrl = () => {
  // Si estamos en desarrollo, usar el backend local
  if (__DEV__) {
    // Cambiar a IP local si tienes el backend corriendo: 'http://192.168.13.38:5000'
    return 'https://9e-production.up.railway.app';
  }
  //  usar Railway
  return 'https://9e-production.up.railway.app';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
};