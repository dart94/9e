import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

type Props = {
  onPress: () => void;
};

export const BirthFloatingButton = ({ onPress }: Props) => (
  <View style={styles.container}>
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <FontAwesome5 name="baby" size={28} color="#fff" />
    </TouchableOpacity>
    <View style={styles.tooltipBubble}>
      <Text style={styles.tooltipText}>
        ¿Tu bebé ya nació?{'\n'}Toca aquí para registrarlo
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 25,
    right: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FF4081',
    borderRadius: 50,
    padding: 18,
    elevation: 4,
  },
  tooltipBubble: {
    backgroundColor: 'white',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 160,
  },
  tooltipText: {
    color: '#333',
    fontSize: 12,
    textAlign: 'center',
  },
});
