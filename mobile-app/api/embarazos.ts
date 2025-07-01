import { API_CONFIG } from "../src/config/config";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getPregnancyRecords = async () => {
  const token = await SecureStore.getItemAsync("userToken");

  if (!token) {
    const error = new Error("Token no encontrado");
    (error as any).code = "NO_TOKEN";
    throw error;
  }

  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/api/embarazos`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const deletePregnancyRecord = async (id: number) => {
  try {
    await axios.delete(`${API_CONFIG.BASE_URL}/api/embarazos/${id}`);
  } catch (error) {
    handleApiError(error);
  }
};

// Función reutilizable de manejo de errores
function handleApiError(error: any): never {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 401) {
      const err = new Error("No autorizado");
      (err as any).code = "UNAUTHORIZED";
      throw err;
    }

    if (status === 404) {
      const err = new Error("Recurso no encontrado");
      (err as any).code = "NOT_FOUND";
      throw err;
    }

    if (status === 500) {
      const err = new Error("Error del servidor");
      (err as any).code = "SERVER_ERROR";
      throw err;
    }

    const err = new Error("Error de red");
    (err as any).code = "NETWORK_ERROR";
    throw err;
  }

  const err = new Error("Error desconocido");
  (err as any).code = "UNKNOWN";
  throw err;
}


// obtener ultimo registro de embarazo
export const getLastPeriodDate = async () => {
  const token = await SecureStore.getItemAsync("userToken");

  if (!token) {
    const error = new Error("Token no encontrado");
    (error as any).code = "NO_TOKEN";
    throw error;
  }

  const userId = await AsyncStorage.getItem("userId");

  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/api/embarazos`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      params: userId ? { user_id: userId } : undefined,
      withCredentials: true,
    });

    const records = response.data;
    const latest = records?.[0];

    if (latest?.last_period_date) {
      return latest.last_period_date;
    } else {
      throw new Error("No se encontró una fecha de último periodo.");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 401) {
        const err = new Error("No autorizado");
        (err as any).code = "UNAUTHORIZED";
        throw err;
      }

      if (status === 500) {
        const err = new Error("Error en el servidor");
        (err as any).code = "SERVER_ERROR";
        throw err;
      }
    }

    const err = new Error("Error desconocido");
    (err as any).code = "UNKNOWN_ERROR";
    throw err;
  }
};