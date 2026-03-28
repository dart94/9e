import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
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
import { COLORS, SIZES, FONTS } from '../../src/theme/theme';
import { LoadingScreen, InfoRow } from '../../src/components';
import { useToast } from '../../src/context/ToastContext';

type ConfirmAction = 'logout' | 'delete' | null;

export default function SettingsScreen() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [form, setForm] = useState({ username: '', email: '' });
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const router = useRouter();
  const toast = useToast();

  const handleDeleteAccount = () => setConfirmAction('delete');
  const handleLogout = () => setConfirmAction('logout');

  const handleConfirm = async () => {
    const action = confirmAction;
    setConfirmAction(null);
    if (action === 'delete') {
      try {
        await api.delete('/api/user/account');
      } catch {
        // Si falla el server, igual limpiamos local
      } finally {
        await clearSession();
        router.replace('/(auth)/login');
      }
    } else if (action === 'logout') {
      try {
        await api.post('/api/auth/logout');
      } catch {
        // Si falla el server, igual limpiamos sesión local
      } finally {
        await clearSession();
        router.replace('/(auth)/login');
      }
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/user/perfil');
        setProfileData(response.data);
        setForm({ username: response.data.username, email: response.data.email });
      } catch {
        toast.error('No se pudo cargar la información del perfil. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleToggleBiometricAuth = async (enable: boolean) => {
    try {
      if (!enable) {
        await SecureStore.deleteItemAsync('userToken');
      }
      setBiometricEnabled(enable);
      toast.success(enable ? 'Autenticación biométrica habilitada' : 'Autenticación biométrica deshabilitada');
    } catch {
      toast.error('No se pudo cambiar la configuración.');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/api/user/perfil', form);
      toast.success('Perfil actualizado correctamente');
      setEditing(false);
      setProfileData({ ...profileData, ...form });
    } catch {
      toast.error('No se pudo actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Cargando perfil..." />;
  }

  if (!profileData) {
    return (
      <View style={[layoutStyles.container, layoutStyles.center]}>
        <Ionicons name="person-circle-outline" size={64} color={COLORS.textLight} accessibilityLabel="" />
        <Text style={textStyles.errorText}>No se pudo cargar el perfil.</Text>
      </View>
    );
  }

  const confirmConfig = {
    logout: {
      title: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      actionLabel: 'Cerrar Sesión',
      color: COLORS.danger,
    },
    delete: {
      title: 'Eliminar Cuenta',
      message: 'Esta acción es permanente e irreversible. Se eliminarán tu cuenta y todos tus registros.',
      actionLabel: 'Eliminar',
      color: '#B71C1C',
    },
  };

  const currentConfirm = confirmAction ? confirmConfig[confirmAction] : null;

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
            style={[buttonStyles.button, saving && buttonStyles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Guardar cambios del perfil"
            accessibilityState={{ disabled: saving }}
          >
            <Text style={buttonStyles.buttonText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
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
            <InfoRow icon="scale-outline" label="Peso" value={profileData.last_record?.weight ? `${profileData.last_record.weight} Kg` : 'Sin registrar'} />
            <InfoRow icon="medical-outline" label="Últimos Síntomas" value={profileData.last_record?.symptoms || 'Sin registrar'} />
            <InfoRow icon="clipboard-outline" label="Notas" value={profileData.last_record?.notes || 'Sin registrar'} />
          </View>

          <TouchableOpacity
            style={buttonStyles.button}
            onPress={() => setEditing(true)}
            accessibilityRole="button"
            accessibilityLabel="Editar información del perfil"
          >
            <Text style={buttonStyles.buttonText}>Editar Perfil</Text>
          </TouchableOpacity>

          {biometricEnabled ? (
            <TouchableOpacity
              style={buttonStyles.button}
              onPress={() => handleToggleBiometricAuth(false)}
              accessibilityRole="button"
              accessibilityLabel="Deshabilitar autenticación por huella digital"
            >
              <Text style={buttonStyles.buttonText}>Deshabilitar Huella</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={buttonStyles.button}
              onPress={() => handleToggleBiometricAuth(true)}
              accessibilityRole="button"
              accessibilityLabel="Habilitar autenticación por huella digital"
            >
              <Text style={buttonStyles.buttonText}>Habilitar Huella</Text>
            </TouchableOpacity>
          )}

          <View style={localStyles.destructiveSection}>
            <TouchableOpacity
              style={[buttonStyles.button, localStyles.deleteButton]}
              onPress={handleDeleteAccount}
              accessibilityRole="button"
              accessibilityLabel="Eliminar cuenta permanentemente"
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.white} style={{ marginRight: SIZES.spacingSM }} />
              <Text style={buttonStyles.buttonText}>Eliminar Cuenta</Text>
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
          </View>
        </>
      )}

      {/* Modal de confirmación para acciones destructivas */}
      <Modal
        visible={confirmAction !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmAction(null)}
      >
        <View style={localStyles.modalBackdrop}>
          <View style={localStyles.modalCard}>
            <Ionicons
              name={confirmAction === 'delete' ? 'warning-outline' : 'log-out-outline'}
              size={48}
              color={currentConfirm?.color ?? COLORS.danger}
              accessibilityLabel=""
            />
            <Text style={localStyles.modalTitle}>{currentConfirm?.title}</Text>
            <Text style={localStyles.modalMessage}>{currentConfirm?.message}</Text>
            <View style={localStyles.modalActions}>
              <TouchableOpacity
                style={[buttonStyles.button, localStyles.cancelBtn]}
                onPress={() => setConfirmAction(null)}
                accessibilityRole="button"
                accessibilityLabel="Cancelar"
              >
                <Text style={buttonStyles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[buttonStyles.button, { backgroundColor: currentConfirm?.color ?? COLORS.danger, flex: 1 }]}
                onPress={handleConfirm}
                accessibilityRole="button"
                accessibilityLabel={currentConfirm?.actionLabel}
              >
                <Text style={buttonStyles.buttonText}>{currentConfirm?.actionLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const localStyles = StyleSheet.create({
  destructiveSection: {
    marginTop: SIZES.spacingLG,
    paddingTop: SIZES.spacingMD,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary,
  },
  deleteButton: {
    backgroundColor: '#B71C1C',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 0,
  },
  logoutButton: {
    backgroundColor: COLORS.danger,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.spacingSM,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacingXL,
  },
  modalCard: {
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
  modalTitle: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: SIZES.lineHeight,
  },
  modalActions: {
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
});
