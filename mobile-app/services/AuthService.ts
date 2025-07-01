import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../src/config/config';

// Función reutilizable para guardar la sesión del usuario
const storeUserSession = async (id: number, username: string, token: string, email: string) => {
  await AsyncStorage.setItem('userId', id.toString());
  await AsyncStorage.setItem('user', JSON.stringify({ id, name: username }));
  await SecureStore.setItemAsync('userToken', token);
  await SecureStore.setItemAsync('userEmail', email);
};

// Registro de usuario
export const registerUser = async (username: string, email: string, password: string) => {
  try {
    if (!username || !email || !password) throw new Error('Faltan datos requeridos');

    const { data } = await axios.post(`${API_CONFIG.BASE_URL}/register2`, { username, email, password });
    return data;
  } catch (error) {
    console.error('Error en registerUser:', error);
    throw error;
  }
};

// Login con Email
export const loginWithEmail = async (email: string, password: string) => {
  try {
    if (!email || !password) throw new Error('Email y contraseña son requeridos');

    const { data } = await axios.post(`${API_CONFIG.BASE_URL}/login2`, { email, password });
    const { id, username, token } = data;

    await storeUserSession(id, username, token, email);

    return data;
  } catch (error) {
    console.error('Error en loginWithEmail:', error);
    throw error;
  }
};

// Login con Google
export const loginWithGoogle = async (token: string) => {
  try {
    const { data } = await axios.post(`${API_CONFIG.BASE_URL}/auth/google`, { token });
    return data;
  } catch (error) {
    console.error('Error en loginWithGoogle:', error);
    throw error;
  }
};

// Recuperar contraseña
export const forgotPassword = async (email: string) => {
  try {
    if (!email) throw new Error('Email requerido');

    const { data } = await axios.post(`${API_CONFIG.BASE_URL}/forgot-password`, { email });
    return data;
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    throw error;
  }
};

// Cierre de sesión
export const logout = async () => {
  try {
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('user');
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userEmail');
    console.log('Sesión cerrada exitosamente');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};