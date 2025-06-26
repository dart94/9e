import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../src/config/config';

//Login con Email

export const loginWithEmail = async (email: string, password: string) => {
  const { data } = await axios.post(`${API_CONFIG.BASE_URL}/login2`, { email, password });
  const { id, username, token } = data;
  await AsyncStorage.setItem('userId', id.toString());
  await AsyncStorage.setItem('user', JSON.stringify({ id, name: username }));
  await SecureStore.setItemAsync('userToken', token);
  await SecureStore.setItemAsync('userEmail', email);
  await SecureStore.setItemAsync('userPassword', password);
  return data;
};

export const loginWithGoogle = async (token: string) => {
  const { data } = await axios.post(`${API_CONFIG.BASE_URL}/auth/google`, { token });
  return data;
};
