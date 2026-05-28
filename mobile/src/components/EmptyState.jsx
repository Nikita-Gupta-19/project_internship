import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useThemeColors from '../hooks/useThemeColors';

export default function EmptyState({ message }) {
  const colors = useThemeColors();
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>○</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.4,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
