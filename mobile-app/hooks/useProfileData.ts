import { useState, useEffect, useCallback } from 'react';
import { getProfile } from '@/api/profile';


export const useProfileData = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true); // usar el estado de carga para mostrar un indicador de progreso
    try {
      const data = await getProfile();
      setProfile(data); // actualizar el estado del perfil con los datos obtenidos
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al obtener el perfil.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]); // Llamar a refetch al montar el componente para obtener los datos del perfil

  return {
    profile,
    loading,
    error,
    refetch,
  };
};

