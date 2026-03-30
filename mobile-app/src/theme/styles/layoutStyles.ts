import { StyleSheet, Dimensions } from 'react-native';
import { SIZES, COLORS } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tablet breakpoint (dp): pantalla con lado corto >= 600dp
const IS_TABLET = Math.min(SCREEN_WIDTH, Dimensions.get('window').height) >= 600;

// En tablet usamos más padding horizontal y limitamos el ancho del contenido
const CONTAINER_PADDING = IS_TABLET ? 32 : SIZES.padding;
const CONTENT_MAX_WIDTH = IS_TABLET ? 560 : undefined;

export const layoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: CONTAINER_PADDING,
    backgroundColor: COLORS.background,
    paddingBottom: 80,
    // En tablets, auto-centrado con maxWidth
    ...(CONTENT_MAX_WIDTH ? { maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center' as const, width: '100%' } : {}),
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.spacingMD,
  },
  touchableContainer: {
    minHeight: 48,
    justifyContent: 'center',
  },
});
