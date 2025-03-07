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

// Configuramos el interceptor una sola vez fuera del componente para evitar

axios.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para mejorar el logging de errores
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      console.log('Error Status:', error.response?.status);
      console.log('Error Data:', error.response?.data);
    }
    return Promise.reject(error);
  }
);

export default function SettingsScreen() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', email: '' });

  const fetchProfile = async () => {
    try {
        setLoading(true);

        const token = await SecureStore.getItemAsync('userToken');
        console.log('Token JWT obtenido:', token); // Verifica que el token exista

        if (!token) {
            Alert.alert('Error', 'No se encontró el token de autenticación.');
            return;
        }

        // Hacer la solicitud con axios
        console.log('Intentando obtener perfil con el token...');
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/mi-perfil`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            withCredentials: true, // Asegúrate de incluir esto si es necesario
        });

        console.log('Datos del perfil recibidos:', response.data);

        // Guardar los datos en el estado
        setProfileData(response.data);
        setForm({
            username: response.data.name,
            email: response.data.email || '',
        });
    } catch (error) {
        console.error('Error al obtener el perfil:', error);

        if (axios.isAxiosError(error)) {
            console.log('Status:', error.response?.status);
            console.log('Response data:', JSON.stringify(error.response?.data));
            console.log('Request headers enviados:', JSON.stringify(error.config?.headers));

            // Si el error es 401, posiblemente el token sea inválido o haya expirado
            if (error.response?.status === 401) {
                Alert.alert('Error', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                // Aquí podrías limpiar el token y redirigir al usuario al login
            } else {
                const errorMessage =
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    'No se pudo cargar la información del perfil.';
                Alert.alert('Error', `${errorMessage} (${error.response?.status || 'desconocido'})`);
            }
        } else {
            Alert.alert('Error', 'Ocurrió un error inesperado.');
        }
    } finally {
        setLoading(false);
    }
};

  useEffect(() => {
    fetchProfile();
  }, []);

  
  // Habilitar/deshabilitar autenticación biométrica
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

  // Guardar cambios en el perfil
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Verificamos si tenemos el endpoint correcto según tu backend
      // Usamos la ruta que parece corresponder al patrón de tu backend
      const response = await axios.put(`${API_CONFIG.BASE_URL}/api/actualizar-perfil`, form);
      
      console.log('Respuesta de actualización:', response.data);
      
      Alert.alert('Éxito', response.data.message || 'Perfil actualizado correctamente');
      setEditing(false);
      
      // Actualizamos el perfil después de guardar
      await fetchProfile();
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = 
          error.response?.data?.message || 
          error.response?.data?.error || 
          'No se pudo actualizar el perfil.';
          
        Alert.alert('Error', errorMessage);
      } else {
        Alert.alert('Error', 'Ocurrió un error inesperado.');
      }
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
        <TouchableOpacity 
          style={[buttonStyles.button, { marginTop: 20 }]} 
          onPress={fetchProfile}
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
              <Text style={textStyles.infoValue}>{profileData.name}</Text>
            </View>

            <View style={textStyles.infoRow}>
              <Ionicons name="mail-outline" size={24} color={textStyles.infoLabel.color} />
              <Text style={textStyles.infoLabel}> Correo Electrónico: </Text>
              <Text style={textStyles.infoValue}>{profileData.email || 'N/A'}</Text>
            </View>

            <View style={textStyles.infoRow}>
              <Ionicons name="calendar-outline" size={24} color={textStyles.infoLabel.color} />
              <Text style={textStyles.infoLabel}> Semana Actual: </Text>
              <Text style={textStyles.infoValue}>{profileData.current_week || 'N/A'}</Text>
            </View>

            <View style={textStyles.infoRow}>
              <Ionicons name="calendar-outline" size={24} color={textStyles.infoLabel.color} />
              <Text style={textStyles.infoLabel}> Progreso de Embarazo: </Text>
              <Text style={textStyles.infoValue}>{profileData.progress_percentage?.toFixed(2) || '0'}%</Text>
            </View>

            {profileData.last_record && (
              <>
                <View style={textStyles.infoRow}>
                  <Ionicons name="calendar-outline" size={24} color={textStyles.infoLabel.color} />
                  <Text style={textStyles.infoLabel}> Fecha de inicio: </Text>
                  <Text style={textStyles.infoValue}>{profileData.last_record.start_date || 'N/A'}</Text>
                </View>

                <View style={textStyles.infoRow}>
                  <Ionicons name="scale-outline" size={24} color={textStyles.infoLabel.color} />
                  <Text style={textStyles.infoLabel}> Peso: </Text>
                  <Text style={textStyles.infoValue}>{profileData.last_record.weight || 'N/A'} Kg</Text>
                </View>

                <View style={textStyles.infoRow}>
                  <Ionicons name="medical-outline" size={24} color={textStyles.infoLabel.color} />
                  <Text style={textStyles.infoLabel}> Últimos Síntomas: </Text>
                  <Text style={textStyles.infoValue}>{profileData.last_record.symptoms || 'N/A'}</Text>
                </View>

                <View style={textStyles.infoRow}>
                  <Ionicons name="clipboard-outline" size={24} color={textStyles.infoLabel.color} />
                  <Text style={textStyles.infoLabel}> Notas: </Text>
                  <Text style={textStyles.infoValue}>{profileData.last_record.notes || 'N/A'}</Text>
                </View>
              </>
            )}
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
          
          <TouchableOpacity
            style={[buttonStyles.button, { backgroundColor: '#333' }]}
            onPress={fetchProfile}
          >
            <Text style={buttonStyles.buttonText}>Actualizar Datos</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}