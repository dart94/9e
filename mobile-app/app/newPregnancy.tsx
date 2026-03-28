import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { layoutStyles } from '../src/theme/styles/layoutStyles';
import { textStyles } from '../src/theme/styles/textStyles';
import { buttonStyles } from '../src/theme/styles/buttonStyles';
import { miscStyles } from '../src/theme/styles/miscStyles';
import { useRouter } from 'expo-router';
import CustomInput from '@/src/components/CustomInput';
import api from '../src/services/api';
import { haptics } from '../src/services/haptics';
import { useToast } from '../src/context/ToastContext';
import { getErrorMessage } from '../src/services/errorHandler';

interface Props {
  onSuccess?: () => void;
}

export default function NewPregnancyRecordScreen({ onSuccess }: Props = {}) {
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
  const toast = useToast();

  useEffect(() => {
    const fetchLastPeriodDate = async () => {
      try {
        const response = await api.get('/api/pregnancy/embarazos');
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
      } catch {
        // Fallo silencioso — el usuario puede ingresar la fecha manualmente
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
      toast.error('Por favor completa la fecha de último período y el peso.');
      return;
    }
    haptics.impactMedium();

    try {
      setLoading(true);
      const payload = {
        last_period_date: form.last_period_date,
        weight: form.weight,
        symptoms: form.symptoms,
        notes: form.notes,
      };

      await api.post('/api/pregnancy/embarazos', payload);
      haptics.success();
      toast.success('Registro guardado correctamente.');
      if (onSuccess) {
        onSuccess();
      } else {
        router.replace('/dashboard');
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'No se pudo guardar el registro. Inténtalo de nuevo.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={layoutStyles.container}>
      {loading && <ActivityIndicator size="large" color={textStyles.title.color} accessibilityLabel="Cargando" />}
      <Text style={textStyles.title} accessibilityRole="header">
        Registro de Embarazo
      </Text>

      <Text style={textStyles.label}>Última Fecha de Periodo *</Text>
      <TouchableOpacity
        style={[miscStyles.input, { justifyContent: 'center' }]}
        onPress={showDatepicker}
        accessibilityRole="button"
        accessibilityLabel={form.last_period_date ? `Fecha seleccionada: ${form.last_period_date}` : 'Seleccionar fecha de última menstruación'}
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

      <CustomInput
        label="Peso actual (kg)"
        value={form.weight}
        onChangeText={(value) => handleInputChange('weight', value)}
        placeholder="Ej: 60.5"
        keyboardType="numeric"
        accessibilityLabel="Campo de peso inicial en kilogramos"
      />

      <CustomInput
        label="Síntomas"
        value={form.symptoms}
        onChangeText={(value) => handleInputChange('symptoms', value)}
        placeholder="Describe tus síntomas actuales"
        accessibilityLabel="Campo de síntomas"
      />

      <CustomInput
        label="Notas"
        value={form.notes}
        onChangeText={(value) => handleInputChange('notes', value)}
        placeholder="Recordatorios o notas adicionales"
        multiline
        accessibilityLabel="Campo de notas adicionales"
      />

      <TouchableOpacity
        style={[buttonStyles.button, loading && buttonStyles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Guardar registro de embarazo"
        accessibilityState={{ disabled: loading }}
      >
        <Text style={buttonStyles.buttonText}>{loading ? 'Guardando...' : 'Guardar Registro'}</Text>
      </TouchableOpacity>
    </View>
  );
}
