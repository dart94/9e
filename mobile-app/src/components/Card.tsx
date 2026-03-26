import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SIZES, FONTS } from '../theme/theme';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  accentColor?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({ title, children, accentColor, icon, style }: CardProps) {
  return (
    <View style={[cardStyles.card, accentColor && { borderLeftColor: accentColor, borderLeftWidth: 4 }, style]}>
      {(title || icon) && (
        <View style={cardStyles.header}>
          {icon && <View style={cardStyles.icon}>{icon}</View>}
          {title && <Text style={cardStyles.title}>{title}</Text>}
        </View>
      )}
      {children}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginBottom: SIZES.spacingLG,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacingSM,
  },
  icon: {
    marginRight: SIZES.spacingSM,
  },
  title: {
    fontSize: SIZES.fontMedium,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    color: COLORS.primaryDark,
    flex: 1,
  },
});
