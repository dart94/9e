import React, { createContext, useContext, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

const TOAST_CONFIG: Record<ToastType, { bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  success: { bg: COLORS.success, icon: 'checkmark-circle' },
  error: { bg: COLORS.error, icon: 'alert-circle' },
  info: { bg: COLORS.primary, icon: 'information-circle' },
};

function Toast({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => dismiss(), toast.duration ?? 3500);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  const config = TOAST_CONFIG[toast.type];

  return (
    <Animated.View
      style={[
        toastStyles.container,
        { backgroundColor: config.bg },
        { transform: [{ translateY }], opacity },
      ]}
    >
      <Ionicons name={config.icon} size={22} color={COLORS.white} />
      <Text style={toastStyles.message} numberOfLines={3}>
        {toast.message}
      </Text>
      <TouchableOpacity onPress={dismiss} accessibilityLabel="Cerrar notificación">
        <Ionicons name="close" size={18} color={COLORS.white} />
      </TouchableOpacity>
    </Animated.View>
  );
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const show = (message: string, type: ToastType = 'info', duration?: number) => {
    const id = nextId++;
    setToasts((prev) => [...prev.slice(-2), { id, type, message, duration }]);
  };

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const value: ToastContextValue = {
    show,
    success: (msg) => show(msg, 'success'),
    error: (msg) => show(msg, 'error'),
    info: (msg) => show(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View style={toastStyles.overlay} pointerEvents="box-none">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const toastStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: SIZES.spacingXL,
    left: SIZES.spacingMD,
    right: SIZES.spacingMD,
    zIndex: 9999,
    gap: SIZES.spacingSM,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacingMD,
    borderRadius: SIZES.borderRadius,
    gap: SIZES.spacingSM,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  message: {
    flex: 1,
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.white,
  },
});
