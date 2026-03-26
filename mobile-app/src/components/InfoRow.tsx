import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
}

export default function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={rowStyles.container}>
      <Ionicons
        name={icon}
        size={22}
        color={COLORS.textLight}
        accessibilityLabel=""
      />
      <Text style={rowStyles.label}> {label}: </Text>
      <Text style={rowStyles.value} numberOfLines={1} ellipsizeMode="tail">
        {value}
      </Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingVertical: SIZES.spacingXS,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.secondary,
  },
  label: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.semiBold,
    color: COLORS.textLight,
  },
  value: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    flex: 1,
  },
});
