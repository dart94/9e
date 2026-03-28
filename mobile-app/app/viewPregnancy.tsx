import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { layoutStyles } from '../src/theme/styles/layoutStyles';
import { textStyles } from '../src/theme/styles/textStyles';
import { buttonStyles } from '../src/theme/styles/buttonStyles';
import { modalStyles } from '../src/theme/styles/modalStyles';
import { miscStyles } from '../src/theme/styles/miscStyles';
import { useRouter } from 'expo-router';
import NewPregnancyRecordScreen from './newPregnancy';
import api from '../src/services/api';
import { LoadingScreen, EmptyState } from '../src/components';
import { COLORS, SIZES, FONTS } from '../src/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../src/context/ToastContext';

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
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const router = useRouter();
  const toast = useToast();

  const fetchRecords = useCallback(async () => {
    try {
      const response = await api.get('/api/pregnancy/embarazos');
      setRecords(response.data);
    } catch {
      toast.error('No se pudieron cargar los registros. Verifica tu conexión.');
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

  const handleDelete = (id: number) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);
    try {
      await api.delete(`/api/pregnancy/embarazos/${id}`);
      toast.success('Registro eliminado correctamente.');
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error('No se pudo eliminar el registro.');
    }
  };

  const renderRecord = ({ item }: { item: PregnancyRecord }) => (
    <View style={miscStyles.card}>
      <Text style={textStyles.subtitle}>Semana: {item.week}</Text>
      <View style={textStyles.infoRow}>
        <Text style={textStyles.infoLabel}>Peso: </Text>
        <Text style={textStyles.infoValue}>
          {item.weight ? `${item.weight} Kg` : 'Sin registrar'}
        </Text>
      </View>
      <View style={textStyles.infoRow}>
        <Text style={textStyles.infoLabel}>Síntomas: </Text>
        <Text style={textStyles.infoValue}>{item.symptoms || 'Sin registrar'}</Text>
      </View>
      <View style={textStyles.infoRow}>
        <Text style={textStyles.infoLabel}>Notas: </Text>
        <Text style={textStyles.infoValue}>{item.notes || 'Sin registrar'}</Text>
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
    return (
      <LoadingScreen
        message="Cargando registros..."
        onRetry={() => { setLoading(true); fetchRecords(); }}
      />
    );
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
            message="Aún no tienes registros"
            subMessage="Comienza registrando tu peso y síntomas de hoy. Cada dato cuenta para tu seguimiento."
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

      {/* Modal de nuevo registro */}
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
              <NewPregnancyRecordScreen onSuccess={() => { setIsModalVisible(false); fetchRecords(); }} />
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

      {/* Modal de confirmación de eliminación */}
      <Modal
        visible={deleteTargetId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTargetId(null)}
      >
        <View style={deleteModalStyles.backdrop}>
          <View style={deleteModalStyles.card}>
            <Ionicons name="warning-outline" size={48} color={COLORS.danger} accessibilityLabel="" />
            <Text style={deleteModalStyles.title}>Eliminar registro</Text>
            <Text style={deleteModalStyles.message}>
              ¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.
            </Text>
            <View style={deleteModalStyles.actions}>
              <TouchableOpacity
                style={[buttonStyles.button, deleteModalStyles.cancelBtn]}
                onPress={() => setDeleteTargetId(null)}
                accessibilityRole="button"
                accessibilityLabel="Cancelar eliminación"
              >
                <Text style={buttonStyles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[buttonStyles.button, deleteModalStyles.confirmBtn]}
                onPress={confirmDelete}
                accessibilityRole="button"
                accessibilityLabel="Confirmar eliminación"
              >
                <Text style={buttonStyles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const deleteModalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacingXL,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.spacingXL,
    alignItems: 'center',
    gap: SIZES.spacingMD,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  message: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: SIZES.lineHeight,
  },
  actions: {
    flexDirection: 'row',
    gap: SIZES.spacingSM,
    marginTop: SIZES.spacingSM,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.textLight,
    marginVertical: 0,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: COLORS.danger,
    marginVertical: 0,
  },
});
