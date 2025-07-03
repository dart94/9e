import { API_CONFIG } from "@/src/config/config";
import axios from "axios";

interface PostpartoData {
  user_id: number;
  birth_date: string;
  weight: number;
  notes: string;
}

export const postparto = async (data: PostpartoData): Promise<any> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/is-born`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text(); // para mostrar más info del backend
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("❌ Error al enviar datos de postparto:", error);
    throw error;
  }
};

// Obtener toda la información de posparto
export const getAllPostpartoData = async (): Promise<any> => {
  try {
    const url = `${API_CONFIG.BASE_URL.replace(/\/$/, "")}/api/all-weeks`;
    console.log("🔗 Llamando a:", url);
    const response = await axios.get(url, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error: any) {
  console.error(
    "❌ Error al obtener datos de posparto:",
    error.response?.status,
    error.response?.data
  );
  throw error;
}
};

//Buscar al usuario por ID
export const getUserById = async (userId: number): Promise<boolean> => {
  try {
    const url = `${API_CONFIG.BASE_URL.replace(/\/$/, "")}/api/is-born/userborn/${userId}`;
    console.log("🔗 Verificando usuario en:", url);

    const response = await axios.get(url, {
      headers: { "Content-Type": "application/json" },
    });

    // Si la respuesta tiene éxito, asumimos que el usuario existe
    if(response.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // Usuario no encontrado
      return false;
    }

    // Otro error inesperado (500, red, etc.)
    console.error(
      "❌ Error al verificar usuario:",
      error.response?.status,
      error.response?.data
    );
    throw error;
  }
};
