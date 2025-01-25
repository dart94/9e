import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import { API_CONFIG } from '../../src/config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { layoutStyles } from '../../src/theme/styles/layoutStyles';
import { textStyles } from '../../src/theme/styles/textStyles';
import { miscStyles } from '../../src/theme/styles/miscStyles';
import { buttonStyles } from '../../src/theme/styles/buttonStyles';
import CustomInput from '@/src/components/CustomInput';

export default function SettingsScreen() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', email: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          Alert.alert('Error', 'No se pudo obtener el usuario autenticado.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/mi-perfil`, {
          params: { user_id: userId },
          withCredentials: true,
        });

        setProfileData(response.data);
        setForm({ username: response.data.username, email: response.data.email });
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
        Alert.alert('Error', 'No se pudo cargar la información del perfil.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleToggleBiometricAuth = async (enable: boolean) => {
    try {
      if (enable) {
        Alert.alert('Configuración', 'Autenticación biométrica habilitada.');
      } else {
        await SecureStore.deleteItemAsync('userToken');
        Alert.alert('Configuración', 'Autenticación biométrica deshabilitada.');
      }
    } catch (error) {
      console.error('Error al cambiar la configuración de autenticación biométrica:', error);
      Alert.alert('Error', 'No se pudo cambiar la configuración.');
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/editar-perfil`, form, {
        withCredentials: true,
      });
      Alert.alert('Éxito', response.data.message);
      setEditing(false);
      setProfileData({ ...profileData, ...form });
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[layoutStyles.container, layoutStyles.center]}>
        <ActivityIndicator size="large" color={textStyles.title.color} />
        <Text style={textStyles.title}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={[layoutStyles.container, layoutStyles.center]}>
        <Text style={textStyles.errorText}>No se pudo cargar el perfil.</Text>
      </View>
    );
  }

  return (
    <View style={layoutStyles.container}>
      <Text style={textStyles.title}>Perfil</Text>

      {editing ? (
        <>
          <Text style={textStyles.subtitle}>Nombre de Usuario</Text>
          <CustomInput
            style={miscStyles.input}
            value={form.username}
            onChangeText={(text) => setForm({ ...form, username: text })}
          />

          <TouchableOpacity style={buttonStyles.button} onPress={handleSave}>
            <Text style={buttonStyles.buttonText}>Guardar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={buttonStyles.button} onPress={() => setEditing(false)}>
            <Text style={buttonStyles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={miscStyles.card}>
            <Text style={miscStyles.cardTitle}>Información de Perfil</Text>

            <View style={textStyles.infoRow}>
              <Ionicons name="person-outline" size={24} color={textStyles.infoLabel.color} />
              <Text style={textStyles.infoLabel}> Nombre de Usuario: </Text>
              <Text style={textStyles.infoValue}>{profileData.username}</Text>
            </View>

            <View style={textStyles.infoRow}>
              <Ionicons name="mail-outline" size={24} color={textStyles.infoLabel.color} />
              <Text style={textStyles.infoLabel}> Correo Electrónico: </Text>
              <Text style={textStyles.infoValue}>{profileData.email}</Text>
            </View>

            <View style={textStyles.infoRow}>
              <Ionicons name="calendar-outline" size={24} color={textStyles.infoLabel.color} />
              <Text style={textStyles.infoLabel}> Progreso de Embarazo: </Text>
              <Text style={textStyles.infoValue}>{profileData.progress_percentage?.toFixed(2) || '0'}%</Text>
            </View>

            <View style={textStyles.infoRow}>
              <Ionicons name="scale-outline" size={24} color={textStyles.infoLabel.color} />
              <Text style={textStyles.infoLabel}> Peso: </Text>
              <Text style={textStyles.infoValue}>{profileData.last_record?.weight || 'N/A'} Kg</Text>
            </View>

            <View style={textStyles.infoRow}>
              <Ionicons name="medical-outline" size={24} color={textStyles.infoLabel.color} />
              <Text style={textStyles.infoLabel}> Últimos Síntomas: </Text>
              <Text style={textStyles.infoValue}>{profileData.last_record?.symptoms || 'N/A'}</Text>
            </View>

            <View style={textStyles.infoRow}>
              <Ionicons name="clipboard-outline" size={24} color={textStyles.infoLabel.color} />
              <Text style={textStyles.infoLabel}> Notas: </Text>
              <Text style={textStyles.infoValue}>{profileData.last_record?.notes || 'N/A'}</Text>
            </View>
          </View>

          <TouchableOpacity style={buttonStyles.button} onPress={() => setEditing(true)}>
            <Text style={buttonStyles.buttonText}>Editar Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={buttonStyles.button}
            onPress={() => handleToggleBiometricAuth(true)}
          >
            <Text style={buttonStyles.buttonText}>Habilitar Huella</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={buttonStyles.button}
            onPress={() => handleToggleBiometricAuth(false)}
          >
            <Text style={buttonStyles.buttonText}>Deshabilitar Huella</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
