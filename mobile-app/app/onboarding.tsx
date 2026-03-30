import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../src/theme/theme';
import { AppButton } from '../src/components';
import { useScreenSize } from '../src/hooks/useScreenSize';

const SLIDES = [
  {
    key: '1',
    icon: 'heart' as const,
    iconColor: COLORS.primary,
    title: 'Sigue tu embarazo\nsemana a semana',
    description:
      'Información actualizada sobre el desarrollo de tu bebé y los cambios en tu cuerpo para cada semana de gestación.',
  },
  {
    key: '2',
    icon: 'clipboard-outline' as const,
    iconColor: COLORS.accent,
    title: 'Registra tus síntomas\ny progreso',
    description:
      'Lleva un historial de tu peso, síntomas y notas. Todo en un solo lugar para compartir con tu médico.',
  },
  {
    key: '3',
    icon: 'shield-checkmark-outline' as const,
    iconColor: COLORS.success,
    title: 'Información médica\nconfiable',
    description:
      'Consejos, pruebas médicas recomendadas y guías validadas para que tu embarazo sea tranquilo y seguro.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width, contentMaxWidth, isTablet } = useScreenSize();

  const handleFinish = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(auth)/login');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex((i) => i + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => handleFinish();

  // En tablets, el slide ocupa el ancho del contenido centrado, no toda la pantalla
  const slideWidth = isTablet ? Math.min(contentMaxWidth, width) : width;

  return (
    <View style={obStyles.container}>
      {/* Skip button */}
      <TouchableOpacity
        style={obStyles.skipBtn}
        onPress={handleSkip}
        accessibilityRole="button"
        accessibilityLabel="Omitir introducción"
      >
        <Text style={obStyles.skipText}>Omitir</Text>
      </TouchableOpacity>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / slideWidth));
        }}
        renderItem={({ item }) => (
          <View style={[obStyles.slide, { width: slideWidth }]}>
            <View style={[obStyles.iconCircle, { backgroundColor: item.iconColor + '18' }]}>
              <Ionicons
                name={item.icon}
                size={64}
                color={item.iconColor}
                accessibilityLabel=""
              />
            </View>
            <Text style={obStyles.title}>{item.title}</Text>
            <Text style={obStyles.description}>{item.description}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={obStyles.dotsRow}>
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * slideWidth, i * slideWidth, (i + 1) * slideWidth];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[obStyles.dot, { width: dotWidth, opacity }]}
            />
          );
        })}
      </View>

      {/* CTA */}
      <View style={obStyles.cta}>
        <AppButton
          label={currentIndex === SLIDES.length - 1 ? 'Comenzar' : 'Siguiente'}
          onPress={handleNext}
          accessibilityLabel={currentIndex === SLIDES.length - 1 ? 'Comenzar' : 'Siguiente diapositiva'}
        />
      </View>
    </View>
  );
}

const obStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  skipBtn: {
    position: 'absolute',
    top: SIZES.spacingXL + SIZES.spacingMD,
    right: SIZES.spacingLG,
    zIndex: 10,
    padding: SIZES.spacingSM,
  },
  skipText: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.semiBold,
    color: COLORS.textLight,
  },
  slide: {
    // El ancho se aplica dinámicamente inline (slideWidth) para soportar redimensionamiento
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.spacingXL,
    paddingTop: SIZES.spacingXL * 2,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: SIZES.borderRadiusFull,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.spacingXL,
  },
  title: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: SIZES.spacingMD,
  },
  description: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: SIZES.lineHeight,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.spacingXS,
    paddingBottom: SIZES.spacingMD,
  },
  dot: {
    height: 8,
    borderRadius: SIZES.borderRadiusFull,
    backgroundColor: COLORS.primary,
  },
  cta: {
    paddingHorizontal: SIZES.spacingLG,
    paddingBottom: SIZES.spacingXL,
  },
});
