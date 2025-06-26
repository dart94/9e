import React from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator, Image} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { biometricStyles } from '@/src/theme/styles/biometricStyles';
import { textStyles } from '@/src/theme/styles';

type BiometricLoginProps = {
  loading: boolean;
  onBiometricAuth: () => void;
  onGoogleLogin: () => void;
  onUseOther: () => void;
};

export const BiometricLogin: React.FC<BiometricLoginProps> = ({ loading, onBiometricAuth, onGoogleLogin, onUseOther }) => (
  <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
    <Image source={require('../assets/images/pregnancy-logo.png')} style={biometricStyles.logo} resizeMode="contain" />
    <Text style={textStyles.title}>Bienvenido de nuevo</Text>

    <TouchableOpacity style={biometricStyles.biometricButton} onPress={onBiometricAuth} disabled={loading}>
      {loading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <>
          <Ionicons name="finger-print-outline" size={40} color="white" />
          <Text style={biometricStyles.biometricText}>Ingresar con huella</Text>
        </>
      )}
    </TouchableOpacity>

    <Text style={biometricStyles.orText}>o</Text>

    <TouchableOpacity style={biometricStyles.secondaryButton} onPress={onGoogleLogin} disabled={loading}>
      <Ionicons name="logo-google" size={20} color="#333" style={{ marginRight: 8 }} />
      <Text style={biometricStyles.secondaryButtonText}>Continuar con Google</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={onUseOther} style={{ marginTop: 15 }}>
      <Text style={textStyles.link}>Usar otro método de inicio de sesión</Text>
    </TouchableOpacity>
  </View>
);
