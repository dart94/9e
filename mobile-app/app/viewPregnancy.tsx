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
import * as SecureStore from 'expo-secure-store';
import NewPregnancyRecordScreen from './newPregnancy';
import type { PregnancyRecord } from '../types/PregnancyRecord';
import { getPregnancyRecords, deletePregnancyRecord } from '@/api/embarazos';




export default function ViewPregnancyRecordsScreen() {
  const [records, setRecords] = useState<PregnancyRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const router = useRouter();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPregnancyRecords();
        setRecords(data);
      } catch (err: any) {
        console.error("Error:", err);
        switch (err.code) {
          case "NO_TOKEN":
          case "UNAUTHORIZED":
            Alert.alert("Error", "Debes iniciar sesión.");
            router.replace("/(auth)/login");
            break;
          case "SERVER_ERROR":
            Alert.alert("Error", "Problema en el servidor.");
            break;
          default:
            Alert.alert("Error", "No se pudieron cargar los registros.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = (id: number) => {
    Alert.alert(
      "Confirmación",
      "¿Estás seguro de que deseas eliminar este registro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePregnancyRecord(id);
              Alert.alert("Éxito", "Registro eliminado correctamente.");
              setRecords((prev) => prev.filter((r) => r.id !== id));
            } catch (err: any) {
              console.error("Error al eliminar:", err);
              Alert.alert("Error", err.message || "No se pudo eliminar el registro.");
            }
          },
        },
      ]
    );
  };

  if (loading)
    return (
      <View style={[layoutStyles.container, layoutStyles.center]}>
        <ActivityIndicator size="large" color={textStyles.title.color} />
        <Text style={textStyles.title}>Cargando registros...</Text>
      </View>
    );

  
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
        <TouchableOpacity style={buttonStyles.deleteButton} onPress={() => handleDelete(item.id)}>
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
        <Text style={textStyles.title}>Registros de seguimiento</Text>
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
          </View>

          {/* Botón cerrar fuera del modalContent */}
          <TouchableOpacity
            style={[buttonStyles.cerrarButton, { marginTop: 10 }]}
            onPress={() => setIsModalVisible(false)}
          >
            <Text style={buttonStyles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
