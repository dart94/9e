import { API_CONFIG } from "@/src/config/config";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

interface PostpartoData {
  user_id: number;
  birth_date: string;
  weight: number;
  notes: string;
}

export const postparto = async (data: PostpartoData): Promise<any> => {
  // Obtener el token de autorización
  const token = await SecureStore.getItemAsync("userToken");
  
  if (!token) {
    const error = new Error("Token de autenticación no encontrado");
    (error as any).code = "NO_TOKEN";
    throw error;
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/is-born`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ Agregar el token aquí
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Manejo específico de errores de autorización
      if (response.status === 401) {
        const error = new Error("No autorizado. Tu sesión ha expirado.");
        (error as any).code = "UNAUTHORIZED";
        throw error;
      }
      
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("❌ Error al enviar datos de postparto:", error);
    throw error;
  }
};

// También corregir getAllPostpartoData si necesita autenticación
export const getAllPostpartoData = async (): Promise<any> => {
  const token = await SecureStore.getItemAsync("userToken");
  
  if (!token) {
    const error = new Error("Token de autenticación no encontrado");
    (error as any).code = "NO_TOKEN";
    throw error;
  }

  try {
    const url = `${API_CONFIG.BASE_URL.replace(/\/$/, "")}/api/all-weeks`;
    const response = await axios.get(url, {
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ Agregar el token aquí también
      },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

//Buscar al usuario por ID
export const getUserById = async (userId: number): Promise<boolean> => {
  const token = await SecureStore.getItemAsync("userToken");
  
  if (!token) {
    const error = new Error("Token de autenticación no encontrado");
    (error as any).code = "NO_TOKEN";
    throw error;
  }

  try {
    const url = `${API_CONFIG.BASE_URL.replace(/\/$/, "")}/api/is-born/userborn/${userId}`;
    console.log("🔗 Verificando usuario en:", url);
    
    const response = await axios.get(url, {
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log("🔍 DEBUG getUserById - response.status:", response.status);
    console.log("🔍 DEBUG getUserById - response.data:", response.data);
    
    if(response.status === 200) {
      console.log("🔍 DEBUG getUserById - returning TRUE");
      return true;
    } else {
      console.log("🔍 DEBUG getUserById - returning FALSE (status not 200)");
      return false;
    }
  } catch (error: any) {
    console.log("🔍 DEBUG getUserById - CAUGHT ERROR:", error);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      console.log("🔍 DEBUG getUserById - error status:", status);
      
      if (status === 404) {
        console.log("🔍 DEBUG getUserById - returning FALSE (404)");
        return false;
      }
      
      if (status === 401) {
        const authError = new Error("No autorizado. Tu sesión ha expirado.");
        (authError as any).code = "UNAUTHORIZED";
        throw authError;
      }
    }
    
    console.error("❌ Error al verificar usuario:", error.response?.status, error.response?.data);
    throw error;
  }
};