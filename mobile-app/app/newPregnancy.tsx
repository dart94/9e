import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { layoutStyles } from '../src/theme/styles/layoutStyles';
import { textStyles } from '../src/theme/styles/textStyles';
import { buttonStyles } from '../src/theme/styles/buttonStyles';
import { miscStyles } from '../src/theme/styles/miscStyles';
import { API_CONFIG } from '../src/config/config';
import { useRouter } from 'expo-router';
import CustomInput from '@/src/components/CustomInput';

export default function NewPregnancyRecordScreen() {
  const [form, setForm] = useState({
    last_period_date: '',
    weight: '',
    symptoms: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    const fetchLastPeriodDate = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          Alert.alert('Error', 'No se pudo obtener el usuario autenticado.');
          router.replace('/(auth)/login');
          return;
        }

        setLoading(true);
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/embarazos`, {
          params: { user_id: userId },
          withCredentials: true,
        });

        if (response.data && response.data.length > 0) {
          const latestRecord = response.data[0];
          if (latestRecord?.last_period_date) {
            setForm((prevForm) => ({
              ...prevForm,
              last_period_date: latestRecord.last_period_date,
            }));
            setDate(new Date(latestRecord.last_period_date));
          }
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

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setForm((prevForm) => ({
        ...prevForm,
        last_period_date: formattedDate,
      }));
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleSubmit = async () => {
    if (!form.last_period_date || !form.weight) {
      Alert.alert('Error', 'Por favor, completa todos los campos obligatorios.');
      return;
    }

    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'Usuario no autenticado. Intenta iniciar sesión nuevamente.');
        router.replace('/(auth)/login');
        return;
      }

      const payload = {
        user_id: Number(userId),
        last_period_date: form.last_period_date,
        weight: form.weight,
        symptoms: form.symptoms,
        notes: form.notes,
      };

      await axios.post(`${API_CONFIG.BASE_URL}/api/embarazos`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      Alert.alert('Éxito', 'Registro de embarazo añadido correctamente.');
      router.replace('/dashboard');
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as { error?: string };
      Alert.alert('Error', errorData?.error || 'No se pudo guardar el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={layoutStyles.container}>
      {loading && <ActivityIndicator size="large" color={textStyles.title.color} />}
      <Text style={textStyles.title}>Registro de Embarazo</Text>

      <Text style={textStyles.label}>Última Fecha de Periodo</Text>
      <TouchableOpacity 
        style={[miscStyles.input, { justifyContent: 'center' }]} 
        onPress={showDatepicker}
      >
        <Text>{form.last_period_date || 'Seleccionar fecha'}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      <Text style={textStyles.label}>Peso Inicial (Kg)</Text>
      <CustomInput
        style={miscStyles.input}
        value={form.weight}
        onChangeText={(value) => handleInputChange('weight', value)}
        placeholder="Peso de la madre"
        keyboardType="numeric"
      />

      <Text style={textStyles.label}>Síntomas</Text>
      <CustomInput
        style={miscStyles.input}
        value={form.symptoms}
        onChangeText={(value) => handleInputChange('symptoms', value)}
        placeholder="Síntomas de la madre"
      />

      <Text style={textStyles.label}>Notas</Text>
      <CustomInput
        style={miscStyles.input}
        value={form.notes}
        onChangeText={(value) => handleInputChange('notes', value)}
        placeholder="Recordatorios o notas adicionales"
        multiline
      />

      <TouchableOpacity style={buttonStyles.button} onPress={handleSubmit}>
        <Text style={buttonStyles.buttonText}>Guardar Registro</Text>
      </TouchableOpacity>
    </View>
  );
}