import React from 'react';
import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../src/theme/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Esta pantalla no existe.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Ir al inicio</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.spacingLG,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.spacingMD,
  },
  link: {
    marginTop: SIZES.spacingMD,
    paddingVertical: SIZES.spacingMD,
  },
  linkText: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.semiBold,
    color: COLORS.primaryDark,
    textDecorationLine: 'underline',
  },
});
