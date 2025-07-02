import { useState, useEffect, useCallback } from 'react';
import {  getAllPostpartoData } from '@/api/posparto';

export const usePostpartoData = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null); // Limpiar error anterior
    
    try {
      console.log('🔄 Obteniendo datos de posparto...');
      const response = await getAllPostpartoData();   
      setData(response);
    } catch (err: any) {

      const errorMessage = err.message || 'Error al obtener la información de posparto.';
      setError(errorMessage);
      setData(null); // Limpiar datos en caso de error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};