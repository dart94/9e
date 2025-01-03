import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../theme/styles';
import { API_CONFIG } from '../config/config';

export default function NewPregnancyRecordScreen() {
  const [form, setForm] = useState({
    last_period_date: '',
    weight: '',
    symptoms: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLastPeriodDate = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        console.log('userId:', userId);
        if (!userId) {
          Alert.alert('Error', 'No se pudo obtener el usuario autenticado.');
          return;
        }

        setLoading(true);
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/embarazos`, {
          params: { user_id: userId },
          withCredentials: true,
        });

        console.log('Respuesta de la API:', response.data);

        // Verificar si hay registros y actualizar solo last_period_date
        if (response.data && response.data.length > 0) {
          const latestRecord = response.data[0];

          // Solo actualizar last_period_date
          setForm((prevForm) => ({
            ...prevForm,
            last_period_date: latestRecord?.last_period_date || '',
          }));
        }
      } catch (error) {
        console.error('Error al cargar la última fecha de periodo:', error);
        Alert.alert('Error', 'No se pudo cargar la última fecha de periodo.');
      } finally {
        setLoading(false);
      }
    };

    fetchLastPeriodDate();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.last_period_date || !form.weight) {
      Alert.alert('Error', 'Por favor, completa todos los campos obligatorios.');
      return;
    }
  
    try {
      setLoading(true);
  
      // Obtener user_id desde AsyncStorage
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'Usuario no autenticado. Intenta iniciar sesión nuevamente.');
        return;
      }
  
      // Preparar los datos para enviar
      const payload = {
        user_id: userId,
        last_period_date: form.last_period_date,
        weight: form.weight,
        symptoms: form.symptoms,
        notes: form.notes,
      };
  
      console.log('Enviando datos:', payload);
  
      // Realizar la solicitud POST
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/embarazos`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      Alert.alert('Éxito', 'Registro de embarazo añadido correctamente.');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error al guardar el registro:', error.response?.data || error.message);
      } else {
        console.error('Error al guardar el registro:', error);
      }
  
      // Mostrar mensaje de error
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as { error?: string };
      if (errorData?.error) {
        Alert.alert('Error', errorData.error);
      } else {
        Alert.alert('Error', 'No se pudo guardar el registro.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <ActivityIndicator size="large" color={styles.title.color} />
      )}
      <Text style={styles.title}>Nuevo Registro de Embarazo</Text>

      <Text style={styles.label}>Última Fecha de Periodo</Text>
      <TextInput
        style={styles.input}
        value={form.last_period_date}
        onChangeText={(value) => handleInputChange('last_period_date', value)}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Peso Inicial (Kg)</Text>
      <TextInput
        style={styles.input}
        value={form.weight}
        onChangeText={(value) => handleInputChange('weight', value)}
        placeholder="Peso"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Síntomas</Text>
      <TextInput
        style={styles.input}
        value={form.symptoms}
        onChangeText={(value) => handleInputChange('symptoms', value)}
        placeholder="Síntomas"
      />

      <Text style={styles.label}>Notas</Text>
      <TextInput
        style={styles.input}
        value={form.notes}
        onChangeText={(value) => handleInputChange('notes', value)}
        placeholder="Notas"
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Guardar Registro</Text>
      </TouchableOpacity>
    </View>
  );
}
