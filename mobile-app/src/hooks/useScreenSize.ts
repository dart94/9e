import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

export type ScreenSizeCategory = 'phone' | 'tablet' | 'large-tablet';

interface ScreenSizeInfo {
  width: number;
  height: number;
  isTablet: boolean;
  isLargeTablet: boolean;
  isPhone: boolean;
  category: ScreenSizeCategory;
  /** Ancho máximo de contenido para pantallas grandes (centraliza el layout) */
  contentMaxWidth: number;
  /** Padding horizontal adaptativo */
  horizontalPadding: number;
  /** Número de columnas sugerido para grids */
  columns: number;
}

const TABLET_BREAKPOINT = 600;
const LARGE_TABLET_BREAKPOINT = 840;

function computeInfo(dims: ScaledSize): ScreenSizeInfo {
  const { width, height } = dims;
  const shortSide = Math.min(width, height);

  const isLargeTablet = shortSide >= LARGE_TABLET_BREAKPOINT;
  const isTablet = shortSide >= TABLET_BREAKPOINT;
  const isPhone = !isTablet;

  let category: ScreenSizeCategory = 'phone';
  if (isLargeTablet) category = 'large-tablet';
  else if (isTablet) category = 'tablet';

  // En tablets centramos el contenido con un max-width para no quedar estirado
  const contentMaxWidth = isLargeTablet ? 720 : isTablet ? 560 : width;
  const horizontalPadding = isTablet ? 32 : 16;
  const columns = isLargeTablet ? 2 : 1;

  return {
    width,
    height,
    isTablet,
    isLargeTablet,
    isPhone,
    category,
    contentMaxWidth,
    horizontalPadding,
    columns,
  };
}

/**
 * Hook reactivo que devuelve información del tamaño de pantalla y categoría del dispositivo.
 * Se actualiza automáticamente al rotar o redimensionar (foldables, split-screen en Android 16+).
 */
export function useScreenSize(): ScreenSizeInfo {
  const [info, setInfo] = useState<ScreenSizeInfo>(() =>
    computeInfo(Dimensions.get('window'))
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setInfo(computeInfo(window));
    });
    return () => subscription.remove();
  }, []);

  return info;
}
