import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { layoutStyles } from '../../src/theme/styles/layoutStyles';
import { textStyles } from '../../src/theme/styles/textStyles';
import { miscStyles } from '../../src/theme/styles/miscStyles';
import { buttonStyles } from '../../src/theme/styles/buttonStyles';
import CustomInput from '@/src/components/CustomInput';
import { updateProfile } from '@/api/profile';
import { useProfileData } from '@/hooks/useProfileData';

export default function SettingsScreen() {
  const { profile, loading: profileLoading, error, refetch } = useProfileData();
  const [form, setForm] = useState({ username: '', email: '' });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.name,
        email: profile.email || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await updateProfile(form);

      Alert.alert('Éxito', response.message || 'Perfil actualizado correctamente');
      setEditing(false);
      await refetch(); // Recargar perfil
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBiometricAuth = async (enable: boolean) => {
    try {
      if (enable) {
        Alert.alert('Configuración', 'Autenticación biométrica habilitada.');
      } else {
        await SecureStore.deleteItemAsync('userToken');
        Alert.alert('Configuración', 'Autenticación biométrica deshabilitada.');
      }
    } catch (error) {
      console.error('Error en biométricos:', error);
      Alert.alert('Error', 'No se pudo cambiar la configuración.');
    }
  };

  if (profileLoading || saving) {
    return (
      <View style={[layoutStyles.container, layoutStyles.center]}>
        <ActivityIndicator size="large" color={textStyles.title.color} />
        <Text style={textStyles.title}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[layoutStyles.container, layoutStyles.center]}>
        <Text style={textStyles.errorText}>No se pudo cargar el perfil.</Text>
        <TouchableOpacity 
          style={[buttonStyles.button, { marginTop: 20 }]} 
          onPress={refetch}
        >
          <Text style={buttonStyles.buttonText}>Reintentar</Text>
        </TouchableOpacity>
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
          <Text style={textStyles.subtitle}>Correo Electrónico</Text>
          <CustomInput
            style={miscStyles.input}
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            keyboardType="email-address"
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
              <Text style={textStyles.infoValue}>{profile.username}</Text>
            </View>

            <View style={textStyles.infoRow}>
              <Ionicons name="mail-outline" size={24} color={textStyles.infoLabel.color} />
              <Text style={textStyles.infoLabel}> Correo Electrónico: </Text>
              <Text style={textStyles.infoValue}>{profile.email || 'N/A'}</Text>
            </View>

            <View style={textStyles.infoRow}>
              <Ionicons name="calendar-outline" size={24} color={textStyles.infoLabel.color} />
              <Text style={textStyles.infoLabel}> Semana Actual: </Text>
              <Text style={textStyles.infoValue}>{profile.current_week || 'N/A'}</Text>
            </View>

            <View style={textStyles.infoRow}>
              <Ionicons name="calendar-outline" size={24} color={textStyles.infoLabel.color} />
              <Text style={textStyles.infoLabel}> Progreso de Embarazo: </Text>
              <Text style={textStyles.infoValue}>
                {profile.progress_percentage?.toFixed(2) || '0'}%
              </Text>
            </View>

            {profile.last_record && (
              <>
                <View style={textStyles.infoRow}>
                  <Ionicons name="calendar-outline" size={24} color={textStyles.infoLabel.color} />
                  <Text style={textStyles.infoLabel}> Fecha de inicio: </Text>
                  <Text style={textStyles.infoValue}>{profile.last_record.start_date || 'Sin registro'}</Text>
                </View>
                <View style={textStyles.infoRow}>
                  <Ionicons name="scale-outline" size={24} color={textStyles.infoLabel.color} />
                  <Text style={textStyles.infoLabel}> Peso: </Text>
                  <Text style={textStyles.infoValue}>{profile.last_record.weight || 'Sin registro'} Kg</Text>
                </View>
                <View style={textStyles.infoRow}>
                  <Ionicons name="medical-outline" size={24} color={textStyles.infoLabel.color} />
                  <Text style={textStyles.infoLabel}> Últimos Síntomas: </Text>
                  <Text style={textStyles.infoValue}>{profile.last_record.symptoms || 'Sin registro'}</Text>
                </View>
                <View style={textStyles.infoRow}>
                  <Ionicons name="clipboard-outline" size={24} color={textStyles.infoLabel.color} />
                  <Text style={textStyles.infoLabel}> Notas: </Text>
                  <Text style={textStyles.infoValue}>{profile.last_record.notes || 'Sin registro'}</Text>
                </View>
              </>
            )}
          </View>

          <TouchableOpacity style={buttonStyles.button} onPress={() => setEditing(true)}>
            <Text style={buttonStyles.buttonText}>Editar Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={buttonStyles.button} onPress={() => handleToggleBiometricAuth(true)}>
            <Text style={buttonStyles.buttonText}>Habilitar Huella</Text>
          </TouchableOpacity>

          <TouchableOpacity style={buttonStyles.button} onPress={() => handleToggleBiometricAuth(false)}>
            <Text style={buttonStyles.buttonText}>Deshabilitar Huella</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.button, { backgroundColor: '#333' }]}
            onPress={refetch}
          >
            <Text style={buttonStyles.buttonText}>Actualizar Datos</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
