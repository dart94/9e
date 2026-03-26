import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { layoutStyles } from '../src/theme/styles/layoutStyles';
import { textStyles } from '../src/theme/styles/textStyles';
import { buttonStyles } from '../src/theme/styles/buttonStyles';
import { modalStyles } from '../src/theme/styles/modalStyles';
import { miscStyles } from '../src/theme/styles/miscStyles';
import { useRouter } from 'expo-router';
import NewPregnancyRecordScreen from './newPregnancy';
import api from '../src/services/api';
import { LoadingScreen, EmptyState } from '../src/components';
import { COLORS } from '../src/theme/theme';


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
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const router = useRouter();

  const fetchRecords = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'Usuario no autenticado.');
        router.replace('/(auth)/login');
        return;
      }

      const response = await api.get('/api/pregnancy/embarazos', {
        params: { user_id: userId },
      });

      setRecords(response.data);
    } catch (error) {
      console.error('Error al cargar registros:', error);
      Alert.alert('Error', 'No se pudieron cargar los registros.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecords();
  };

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
              await api.delete(`/api/pregnancy/embarazos/${id}`);
              Alert.alert('Éxito', 'Registro eliminado correctamente.');
              setRecords((prev) => prev.filter((r) => r.id !== id));
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el registro.');
            }
          },
        },
      ]
    );
  };

  const renderRecord = ({ item }: { item: PregnancyRecord }) => (
    <View style={miscStyles.card}>
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
        <TouchableOpacity
          style={buttonStyles.deleteButton}
          onPress={() => handleDelete(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`Eliminar registro semana ${item.week}`}
        >
          <Text style={buttonStyles.buttonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <LoadingScreen message="Cargando registros..." />;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={layoutStyles.container}>
        <Text style={textStyles.title}>Registros de seguimiento</Text>
        {records.length > 0 ? (
          <FlatList
            data={records}
            keyExtractor={(item, index) => `${item.week}-${index}`}
            renderItem={renderRecord}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
          />
        ) : (
          <EmptyState
            icon="document-text-outline"
            message="Sin registros aún"
            subMessage="Agrega tu primer registro de seguimiento"
            actionLabel="Nuevo Registro"
            onAction={() => setIsModalVisible(true)}
          />
        )}
        {records.length > 0 && (
          <TouchableOpacity
            style={buttonStyles.button}
            onPress={() => setIsModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Agregar nuevo registro"
          >
            <Text style={buttonStyles.buttonText}>Nuevo Registro</Text>
          </TouchableOpacity>
        )}
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
          </View>

          <TouchableOpacity
            style={[buttonStyles.cerrarButton, { marginTop: 10 }]}
            onPress={() => setIsModalVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Cerrar formulario"
          >
            <Text style={buttonStyles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
