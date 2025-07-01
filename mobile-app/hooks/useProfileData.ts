import { useState, useEffect, useCallback } from 'react';
import { getProfile } from '@/api/profile';


export const useProfileData = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al obtener el perfil.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    profile,
    loading,
    error,
    refetch,
  };
};

