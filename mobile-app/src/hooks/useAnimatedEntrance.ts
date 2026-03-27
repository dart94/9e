import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Hook para animar la entrada de un elemento con fade + slide desde abajo.
 * @param delay - Retraso en ms antes de iniciar la animación (para escalonar múltiples elementos)
 */
export function useAnimatedEntrance(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }),
    ]);

    animation.start();
    return () => animation.stop();
  }, []);

  return {
    style: {
      opacity,
      transform: [{ translateY }],
    },
  };
}

/**
 * Genera estilos animados escalonados para una lista de N elementos.
 * Úsalo con useMemo para no recrear en cada render.
 */
export function useStaggeredEntrance(count: number, baseDelay = 80) {
  const animations = Array.from({ length: count }, (_, i) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;
    return { opacity, translateY };
  });

  useEffect(() => {
    const anims = animations.map((anim, i) =>
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 350,
          delay: i * baseDelay,
          useNativeDriver: true,
        }),
        Animated.spring(anim.translateY, {
          toValue: 0,
          delay: i * baseDelay,
          tension: 80,
          friction: 12,
          useNativeDriver: true,
        }),
      ])
    );

    const sequence = Animated.stagger(baseDelay / 2, anims);
    sequence.start();
    return () => sequence.stop();
  }, []);

  return animations.map((anim) => ({
    opacity: anim.opacity,
    transform: [{ translateY: anim.translateY }],
  }));
}
