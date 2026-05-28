import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

import useThemeColors from '../hooks/useThemeColors';

export default function SkeletonCard() {
  const colors = useThemeColors();
  const animStyle = { opacity: 0.7 };

  return (
    <View
      style={[styles.card, animStyle, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      {/* Title bar */}
      <View style={[styles.bar, styles.titleBar, { backgroundColor: colors.inputBg }]} />
      {/* Description bar */}
      <View style={[styles.bar, styles.descBar, { backgroundColor: colors.inputBg }]} />
      {/* Date bar */}
      <View style={[styles.bar, styles.dateBar, { backgroundColor: colors.inputBg }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  bar: {
    borderRadius: 6,
    marginBottom: 8,
  },
  titleBar: { height: 16, width: '65%' },
  descBar: { height: 12, width: '85%' },
  dateBar: { height: 10, width: '40%', marginBottom: 0 },
});
