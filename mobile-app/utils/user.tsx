import AsyncStorage from "@react-native-async-storage/async-storage";


export const getUserIdFromStorage = async (): Promise<number | null> => {
 try{
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      return null;
    }
    return Number(userId);
  } catch (error) {
    console.error("❌ Error al obtener el ID del usuario:", error);
    return null;
  }
 }