import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { API_CONFIG } from '../config/config';
import { styles } from '../theme/styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', email: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {    
        // Obtiene el userId desde AsyncStorage
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          Alert.alert('Error', 'No se pudo obtener el usuario autenticado.');
          setLoading(false);
          return;
        }

        // Realiza la solicitud al backend
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

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={styles.title.color} />
        <Text style={styles.title}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>No se pudo cargar el perfil.</Text>
      </View>
    );
  }

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>

      {editing ? (
        <>
          <Text style={styles.subtitle}>Nombre de Usuario</Text>
          <TextInput
            style={styles.input}
            value={form.username}
            onChangeText={(text) => setForm({ ...form, username: text })}
          />

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Guardar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setEditing(false)}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.card}>
          <Text style={styles.cardTitle}>Información de Perfil</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={24} color={styles.infoLabel.color} />
            <Text style={styles.infoLabel}> Nombre de Usuario: </Text>
            <Text style={styles.infoValue}>{profileData.username}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={24} color={styles.infoLabel.color} />
            <Text style={styles.infoLabel}> Correo Electrónico: </Text>
            <Text style={styles.infoValue}>{profileData.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={24} color={styles.infoLabel.color} />
            <Text style={styles.infoLabel}> Progreso de Embarazo: </Text>
            <Text style={styles.infoValue}>{profileData.progress_percentage?.toFixed(2) || '0'}%</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="scale-outline" size={24} color={styles.infoLabel.color} />
            <Text style={styles.infoLabel}> Peso: </Text>
            <Text style={styles.infoValue}>{profileData.last_record?.weight || 'N/A'} Kg</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="medical-outline" size={24} color={styles.infoLabel.color} />
            <Text style={styles.infoLabel} >Últimos Síntomas: </Text>
            <Text style={styles.infoValue}>{profileData.last_record?.symptoms || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="clipboard-outline" size={24} color={styles.infoLabel.color} />
            <Text style={styles.infoLabel}> Notas: </Text>
            <Text style={styles.infoValue}>{profileData.last_record?.notes || 'N/A'}</Text>
          </View>
        </View>
          <TouchableOpacity style={styles.button} onPress={() => setEditing(true)}>
            <Text style={styles.buttonText}>Editar Perfil</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
