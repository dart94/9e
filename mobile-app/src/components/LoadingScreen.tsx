import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';

interface LoadingScreenProps {
  message?: string;
  onRetry?: () => void;
  timeoutMs?: number;
}

export default function LoadingScreen({
  message = 'Cargando...',
  onRetry,
  timeoutMs = 12000,
}: LoadingScreenProps) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), timeoutMs);
    return () => clearTimeout(timer);
  }, [timeoutMs]);

  if (timedOut) {
    return (
      <View style={loadingStyles.container}>
        <Ionicons name="cloud-offline-outline" size={56} color={COLORS.textLight} accessibilityLabel="Error de conexión" />
        <Text style={loadingStyles.timeoutTitle}>Tardando más de lo esperado</Text>
        <Text style={loadingStyles.timeoutText}>Verifica tu conexión a internet e inténtalo de nuevo.</Text>
        {onRetry && (
          <TouchableOpacity
            style={loadingStyles.retryButton}
            onPress={() => { setTimedOut(false); onRetry(); }}
            accessibilityRole="button"
            accessibilityLabel="Reintentar carga"
          >
            <Text style={loadingStyles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={loadingStyles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={loadingStyles.text}>{message}</Text>
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    gap: SIZES.spacingMD,
    padding: SIZES.spacingXL,
  },
  text: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    marginTop: SIZES.spacingSM,
  },
  timeoutTitle: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    textAlign: 'center',
  },
  timeoutText: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SIZES.spacingMD,
    paddingVertical: SIZES.spacingMD,
    paddingHorizontal: SIZES.spacingXL,
    backgroundColor: COLORS.primaryDark,
    borderRadius: SIZES.borderRadius,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    color: COLORS.white,
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
  },
});
