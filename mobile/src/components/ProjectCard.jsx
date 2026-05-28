import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';

import * as Haptics from 'expo-haptics';
import useThemeColors from '../hooks/useThemeColors';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProjectCard({ project, index = 0, onPress, onDelete, onEdit }) {
  const colors = useThemeColors();

  const handleDelete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Delete Project', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete() },
    ]);
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={onPress}
        onLongPress={onEdit}
        activeOpacity={0.75}
        delayLongPress={400}
      >
        {/* Delete button */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.deleteIcon, { color: colors.danger }]}>✕</Text>
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {project.title}
          </Text>
          {project.description ? (
            <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={1}>
              {project.description}
            </Text>
          ) : null}
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            Created {formatDate(project.created_at)}
          </Text>
        </View>

        {/* Edit hint + chevron */}
        <View style={styles.rightMeta}>
          <Text style={[styles.editHint, { color: colors.textSecondary }]}>Hold to edit</Text>
          <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
        </View>
      </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  deleteBtn: { marginRight: 12, padding: 4 },
  deleteIcon: { fontSize: 16, fontWeight: '700' },
  content: { flex: 1, gap: 3 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  desc: { fontSize: 13, marginBottom: 4 },
  date: { fontSize: 11, opacity: 0.7 },
  rightMeta: { alignItems: 'flex-end' },
  editHint: { fontSize: 9, opacity: 0.5, marginBottom: 2 },
  chevron: { fontSize: 24, opacity: 0.5 },
});
