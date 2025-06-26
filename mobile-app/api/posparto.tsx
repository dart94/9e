import { API_CONFIG } from "@/src/config/config";

interface PostpartoData {
  user_id: number;
  birth_date: string; 
  weight: number;
  notes: string;
}

export const postparto = async (data: PostpartoData): Promise<any> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/is-born`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
    console.error('❌ Error al enviar datos de postparto:', error);
    throw error;
  }
};
