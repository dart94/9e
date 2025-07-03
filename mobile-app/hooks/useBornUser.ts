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
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        throw new Error("No se encontró el ID del usuario");
      }
      const exists = await getUserById(Number(userId));
      // Convertir a boolean
      const hasBornUser = Boolean(exists);
      setBornUser(hasBornUser);
    } catch (err: any) {
      const errorMessage =
        err.message || "Error al verificar si el usuario ha sido registrado.";
      setError(errorMessage);
      setBornUser(null);
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
