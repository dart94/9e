// api/profile.ts
import { API_CONFIG } from "../src/config/config";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const getProfile = async () => {
  const token = await SecureStore.getItemAsync("userToken");

  if (!token) {
    const error = new Error("Token no encontrado");
    (error as any).code = "NO_TOKEN";
    throw error;
  }

  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/api/mi-perfil`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    handleProfileError(error);
  }
};

export const updateProfile = async (data: { username: string; email: string }) => {
  const token = await SecureStore.getItemAsync("userToken");

  if (!token) {
    const error = new Error("Token no encontrado");
    (error as any).code = "NO_TOKEN";
    throw error;
  }

  try {
    const response = await axios.post(`${API_CONFIG.BASE_URL}/api/editar-perfil`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    handleProfileError(error);
  }
};

function handleProfileError(error: any): never {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Error desconocido";

    const err = new Error(message);
    (err as any).code = status === 401 ? "UNAUTHORIZED" : "API_ERROR";
    throw err;
  }

  const err = new Error("Ocurrió un error inesperado");
  (err as any).code = "UNKNOWN";
  throw err;
}
