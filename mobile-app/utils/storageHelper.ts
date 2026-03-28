import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const storage = {
  async setItem(key: string, value: string) {
    if (isWeb) {
      // En la web, usa sessionStorage (más seguro que localStorage para tokens)
      window.sessionStorage.setItem(key, value);
    } else {
      // En móviles, usa SecureStore
      await SecureStore.setItemAsync(key, value);
    }
  },

  async getItem(key: string) {
    if (isWeb) {
      // En la web, usa localStorage
      return window.sessionStorage.getItem(key);
    } else {
      // En móviles, usa SecureStore
      return await SecureStore.getItemAsync(key);
    }
  },

  async removeItem(key: string) {
    if (isWeb) {
      // En la web, usa localStorage
      window.sessionStorage.removeItem(key);
    } else {
      // En móviles, usa SecureStore
      await SecureStore.deleteItemAsync(key);
    }
  },
};
