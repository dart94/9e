// api/dashboard.ts
import { API_CONFIG } from "../src/config/config";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const getDashboard = async () => {
  const token = await SecureStore.getItemAsync("userToken");

  if (!token) {
    const error = new Error("Token de autenticación no encontrado");
    (error as any).code = "NO_TOKEN";
    throw error;
  }

  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/api/dashboard`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;

      if (status === 401) {
        const error = new Error("No autorizado. Tu sesión ha expirado.");
        (error as any).code = "UNAUTHORIZED";
        throw error;
      }

      if (status === 500) {
        const error = new Error("Error interno del servidor.");
        (error as any).code = "SERVER_ERROR";
        throw error;
      }

      const error = new Error(err.message || "Error de red desconocido");
      (error as any).code = "AXIOS_ERROR";
      throw error;
    }

    // Error genérico
    const error = new Error("Ocurrió un error inesperado.");
    (error as any).code = "UNKNOWN_ERROR";
    throw error;
  }
};