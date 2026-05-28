import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

import useThemeColors from '../hooks/useThemeColors';

export default function SkeletonTaskItem() {
  const colors = useThemeColors();
  const animStyle = { opacity: 0.7 };

  return (
    <View
      style={[styles.row, animStyle, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      {/* Checkbox placeholder */}
      <View style={[styles.checkbox, { backgroundColor: colors.inputBg }]} />
      {/* Title bar */}
      <View style={styles.content}>
        <View style={[styles.bar, styles.titleBar, { backgroundColor: colors.inputBg }]} />
        <View style={[styles.bar, styles.badgeBar, { backgroundColor: colors.inputBg }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 5,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    marginRight: 12,
  },
  content: { flex: 1, gap: 6 },
  bar: { borderRadius: 5 },
  titleBar: { height: 13, width: '70%' },
  badgeBar: { height: 10, width: '25%' },
});
