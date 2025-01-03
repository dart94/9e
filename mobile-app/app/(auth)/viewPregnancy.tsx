import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../theme/styles';
import { API_CONFIG } from '../config/config';
import NewPregnancyRecordScreen from './newPregnancy';

interface PregnancyRecord {
  week: number;
  weight: number | null;
  symptoms: string | null;
  notes: string | null;
}

export default function ViewPregnancyRecordsScreen() {
  const [records, setRecords] = useState<PregnancyRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          Alert.alert('Error', 'No se pudo obtener el usuario autenticado.');
          setLoading(false);
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

  const handleEdit = (record: PregnancyRecord) => {
    // Lógica para manejar la edición (puedes mostrar un modal con datos precargados)
    Alert.alert('Editar', `Editar el registro de la semana ${record.week}`);
  };

  const handleDelete = async (week: number) => {
    Alert.alert(
      'Confirmación',
      `¿Estás seguro de que deseas eliminar el registro de la semana ${week}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = await AsyncStorage.getItem('userId');
              if (!userId) {
                Alert.alert('Error', 'Usuario no autenticado.');
                return;
              }

              await axios.delete(`${API_CONFIG.BASE_URL}/api/embarazos`, {
                params: { user_id: userId, week },
              });

              Alert.alert('Éxito', 'Registro eliminado correctamente.');
              // Actualizar la lista local
              setRecords((prevRecords) =>
                prevRecords.filter((record) => record.week !== week)
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
    <View style={styles.card}>
      <Text style={styles.subtitle}>Semana: {item.week}</Text>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Peso: </Text>
        <Text style={styles.infoValue}>
          {item.weight ? `${item.weight} Kg` : 'N/A'}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Síntomas: </Text>
        <Text style={styles.infoValue}>{item.symptoms || 'N/A'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Notas: </Text>
        <Text style={styles.infoValue}>{item.notes || 'N/A'}</Text>
      </View>

      {/* Botones de acciones */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.week)}>
          <Text style={styles.buttonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={styles.title.color} />
        <Text style={styles.title}>Cargando registros...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Registros de Embarazo</Text>
        {records.length > 0 ? (
          <FlatList
            data={records}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderRecord}
          />
        ) : (
          <Text style={styles.errorText}>No se encontraron registros.</Text>
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.buttonText}>Nuevo Registro</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <NewPregnancyRecordScreen />
            <TouchableOpacity
              style={[styles.button, { marginTop: 20 }]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
