import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';

import * as Haptics from 'expo-haptics';
import useThemeColors from '../hooks/useThemeColors';

function getDueBadge(due_date, colors) {
  if (!due_date) return null;
  const today = new Date().toISOString().split('T')[0];
  const due = due_date.split('T')[0];
  if (due < today) return { label: 'Overdue', bg: colors.danger };
  if (due === today) return { label: 'Today', bg: colors.warning };
  return { label: due, bg: colors.success };
}

function getPriorityColor(priority, colors) {
  if (priority === 'high') return colors.danger;
  if (priority === 'medium') return colors.warning || '#F59E0B';
  return colors.success || '#10B981';
}

export default function TaskItem({ task, index = 0, onToggle, onDelete, onEdit }) {
  const colors = useThemeColors();
  const isComplete = task.status === 'complete';
  const badge = getDueBadge(task.due_date, colors);

  const handleToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  const handleDelete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Delete Task', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete() },
    ]);
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
        onLongPress={onEdit}
        delayLongPress={400}
        activeOpacity={0.85}
      >
        {/* Checkbox */}
        <TouchableOpacity style={styles.checkboxWrap} onPress={handleToggle}>
          <View
            style={[
              styles.checkbox,
              { borderColor: isComplete ? colors.success : colors.border },
              isComplete && { backgroundColor: colors.success },
            ]}
          >
            {isComplete && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>

        {/* Title + badge */}
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              { color: colors.text },
              isComplete && { textDecorationLine: 'line-through', color: colors.textSecondary },
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          <View style={styles.badgesRow}>
            {task.priority && (
              <View style={[styles.badge, { backgroundColor: getPriorityColor(task.priority, colors) }]}>
                <Text style={styles.badgeText}>{task.priority.toUpperCase()}</Text>
              </View>
            )}
            {task.category && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{task.category.toUpperCase()}</Text>
              </View>
            )}
            {badge && (
              <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                <Text style={styles.badgeText}>{badge.label.toUpperCase()}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Delete */}
        <TouchableOpacity
          onPress={handleDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.deleteBtn}
        >
          <Text style={[styles.deleteIcon, { color: colors.danger }]}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
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
  checkboxWrap: { marginRight: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  content: { flex: 1, gap: 5 },
  title: { fontSize: 14, fontWeight: '500', lineHeight: 19 },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  deleteBtn: { marginLeft: 8, padding: 4 },
  deleteIcon: { fontSize: 15, fontWeight: '700' },
});
