import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { layoutStyles } from '../src/theme/styles/layoutStyles';
import { textStyles } from '../src/theme/styles/textStyles';
import { buttonStyles } from '../src/theme/styles/buttonStyles';
import { modalStyles } from '../src/theme/styles/modalStyles';
import { miscStyles as miscStylesStyles } from '../src/theme/styles/miscStyles';
import { API_CONFIG } from '../src/config/config';
import { useRouter } from 'expo-router';
import NewPregnancyRecordScreen from './newPregnancy';


interface PregnancyRecord {
  id: number;
  week: number;
  weight: number | null;
  symptoms: string | null;
  notes: string | null;
}

export default function ViewPregnancyRecordsScreen() {
  const [records, setRecords] = useState<PregnancyRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          Alert.alert('Error', 'Usuario no autenticado.');
          router.replace('/(auth)/login');
          return;
        }

        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/embarazos`, {
          params: { user_id: userId },
          withCredentials: true,
        });

        setRecords(response.data);
      } catch (error) {
        console.error('Error al cargar registros:', error);
        Alert.alert('Error', 'No se pudieron cargar los registros.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Confirmación',
      '¿Estás seguro de que deseas eliminar este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_CONFIG.BASE_URL}/api/embarazos/${id}`);
  
              Alert.alert('Éxito', 'Registro eliminado correctamente.');
              setRecords((prevRecords) =>
                prevRecords.filter((record) => record.id !== id)
              );
            } catch (error) {
              console.error('Error al eliminar registro:', error);
              Alert.alert('Error', 'No se pudo eliminar el registro.');
            }
          },
        },
      ]
    );
  };

  const renderRecord = ({ item }: { item: PregnancyRecord }) => (
    <View style={miscStylesStyles.card}>
      <Text style={textStyles.subtitle}>Semana: {item.week}</Text>
      <View style={textStyles.infoRow}>
        <Text style={textStyles.infoLabel}>Peso: </Text>
        <Text style={textStyles.infoValue}>
          {item.weight ? `${item.weight} Kg` : 'N/A'}
        </Text>
      </View>
      <View style={textStyles.infoRow}>
        <Text style={textStyles.infoLabel}>Síntomas: </Text>
        <Text style={textStyles.infoValue}>{item.symptoms || 'N/A'}</Text>
      </View>
      <View style={textStyles.infoRow}>
        <Text style={textStyles.infoLabel}>Notas: </Text>
        <Text style={textStyles.infoValue}>{item.notes || 'N/A'}</Text>
      </View>
      <View style={layoutStyles.actionsRow}>
        <TouchableOpacity style={buttonStyles.deleteButton} onPress={() => handleDelete(item.week)}>
          <Text style={buttonStyles.buttonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[layoutStyles.container, layoutStyles.center]}>
        <ActivityIndicator size="large" color={textStyles.title.color} />
        <Text style={textStyles.title}>Cargando registros...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={layoutStyles.container}>
        <Text style={textStyles.title}>Registros de Embarazo</Text>
        {records.length > 0 ? (
          <FlatList
            data={records}
            keyExtractor={(item, index) => `${item.week}-${index}`}
            renderItem={renderRecord}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <Text style={textStyles.errorText}>No se encontraron registros.</Text>
        )}
        <TouchableOpacity
          style={buttonStyles.button}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={buttonStyles.buttonText}>Nuevo Registro</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={modalStyles.modalContainer}
        >
          <View style={modalStyles.modalContent}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <NewPregnancyRecordScreen />
            </ScrollView>
            <TouchableOpacity
              style={[buttonStyles.button, { marginTop: 20 }]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={buttonStyles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
