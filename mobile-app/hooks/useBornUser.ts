import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserById } from "@/api/posparto";
import { useState, useEffect, useCallback } from "react";


export const useBornUser = () => {
  const [bornUser, setBornUser] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


const refetch = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    // ✅ Cambiar AsyncStorage por SecureStore
    const userId = await SecureStore.getItemAsync("userId");    
    if (!userId) {
      throw new Error("No se encontró el ID del usuario");
    }
    const exists = await getUserById(Number(userId));
    // Convertir a boolean
    const hasBornUser = Boolean(exists);    
    setBornUser(hasBornUser);   
  } catch (err: any) {
    console.log("🔍 DEBUG useBornUser - ERROR:", err);
    const errorMessage =
      err.message || "Error al verificar si el usuario ha sido registrado.";
    setError(errorMessage);
    setBornUser(null);
    console.log("🔍 DEBUG useBornUser - setBornUser(null) called due to error");
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  refetch();
}, [refetch]);

return {
  bornUser,
  loading,
  error,
  refetch,
};
};