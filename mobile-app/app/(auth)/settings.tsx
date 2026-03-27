import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { layoutStyles } from '../../src/theme/styles/layoutStyles';
import { textStyles } from '../../src/theme/styles/textStyles';
import { miscStyles } from '../../src/theme/styles/miscStyles';
import { buttonStyles } from '../../src/theme/styles/buttonStyles';
import CustomInput from '@/src/components/CustomInput';
import { useRouter } from 'expo-router';
import api, { clearSession } from '../../src/services/api';
import { COLORS, SIZES } from '../../src/theme/theme';
import { LoadingScreen, InfoRow } from '../../src/components';

export default function SettingsScreen() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', email: '' });
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Confirmación', '¿Estás seguro de que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.post('/api/auth/logout');
          } catch {
            // Si falla el server, igual limpiamos sesión local
          } finally {
            await clearSession();
            router.replace('/(auth)/login');
          }
        },
      },
    ]);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/user/perfil');

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
      const response = await api.put('/api/user/perfil', form);
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
    return <LoadingScreen message="Cargando perfil..." />;
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
      <Text style={textStyles.title} accessibilityRole="header">Perfil</Text>

      {editing ? (
        <>
          <CustomInput
            label="Nombre de Usuario"
            value={form.username}
            onChangeText={(text) => setForm({ ...form, username: text })}
            accessibilityLabel="Campo de nombre de usuario"
          />

          <TouchableOpacity
            style={buttonStyles.button}
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel="Guardar cambios del perfil"
          >
            <Text style={buttonStyles.buttonText}>Guardar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={buttonStyles.button}
            onPress={() => setEditing(false)}
            accessibilityRole="button"
            accessibilityLabel="Cancelar edición"
          >
            <Text style={buttonStyles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={miscStyles.card} accessibilityLabel="Información de perfil">
            <Text style={miscStyles.cardTitle} accessibilityRole="header">Información de Perfil</Text>
            <InfoRow icon="person-outline" label="Nombre de Usuario" value={profileData.username} />
            <InfoRow icon="mail-outline" label="Correo Electrónico" value={profileData.email} />
            <InfoRow icon="calendar-outline" label="Progreso de Embarazo" value={`${profileData.progress_percentage?.toFixed(2) || '0'}%`} />
            <InfoRow icon="scale-outline" label="Peso" value={profileData.last_record?.weight ? `${profileData.last_record.weight} Kg` : 'N/A'} />
            <InfoRow icon="medical-outline" label="Últimos Síntomas" value={profileData.last_record?.symptoms || 'N/A'} />
            <InfoRow icon="clipboard-outline" label="Notas" value={profileData.last_record?.notes || 'N/A'} />
          </View>

          <TouchableOpacity
            style={buttonStyles.button}
            onPress={() => setEditing(true)}
            accessibilityRole="button"
            accessibilityLabel="Editar información del perfil"
          >
            <Text style={buttonStyles.buttonText}>Editar Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={buttonStyles.button}
            onPress={() => handleToggleBiometricAuth(true)}
            accessibilityRole="button"
            accessibilityLabel="Habilitar autenticación por huella digital"
          >
            <Text style={buttonStyles.buttonText}>Habilitar Huella</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={buttonStyles.button}
            onPress={() => handleToggleBiometricAuth(false)}
            accessibilityRole="button"
            accessibilityLabel="Deshabilitar autenticación por huella digital"
          >
            <Text style={buttonStyles.buttonText}>Deshabilitar Huella</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.button, localStyles.logoutButton]}
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.white} style={{ marginRight: SIZES.spacingSM }} />
            <Text style={buttonStyles.buttonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  logoutButton: {
    backgroundColor: COLORS.danger,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.spacingLG,
  },
});
