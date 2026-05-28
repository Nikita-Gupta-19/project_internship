import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTasks,
  createTask,
  toggleTask,
  deleteTask,
  editTask,
  selectTasksByProject,
  selectTasksLoading,
} from '../../store/slices/tasksSlice';
import useThemeColors from '../../hooks/useThemeColors';
import TaskItem from '../../components/TaskItem';
import EmptyState from '../../components/EmptyState';
import SkeletonTaskItem from '../../components/SkeletonTaskItem';
import CreateTaskModal from '../modals/CreateTaskModal';
import EditTaskModal from '../modals/EditTaskModal';

const FILTERS = ['all', 'pending', 'complete'];

export default function ProjectDetailScreen({ route }) {
  const colors = useThemeColors();
  const dispatch = useDispatch();
  const { projectId } = route.params;

  const tasks = useSelector(selectTasksByProject(projectId));
  const loading = useSelector(selectTasksLoading);

  // Local UI state
  const [createVisible, setCreateVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // task object
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchTasks(projectId));
  }, [projectId]);

  const handleToggle = (task) => {
    dispatch(toggleTask({ projectId, taskId: task.id, currentStatus: task.status }));
  };

  const handleDelete = (taskId) => {
    dispatch(deleteTask({ projectId, taskId }));
  };

  const handleCreate = async ({ title, due_date, priority, category }) => {
    const result = await dispatch(createTask({ projectId, title, due_date, priority, category }));
    if (createTask.fulfilled.match(result)) {
      setCreateVisible(false);
    } else {
      throw new Error(result.payload);
    }
  };

  const handleEditSave = async ({ title, due_date, priority, category }) => {
    const result = await dispatch(
      editTask({ projectId, taskId: editTarget.id, title, due_date, priority, category })
    );
    if (editTask.fulfilled.match(result)) {
      setEditTarget(null);
    } else {
      throw new Error(result.payload);
    }
  };

  // Client-side filter
  const filtered = tasks.filter((t) =>
    filter === 'all' ? true : t.status === filter
  );

  // Skeleton on first load
  if (loading && tasks.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {[0, 1, 2].map((i) => (
          <SkeletonTaskItem key={i} />
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Filter tabs ─────────────────────────────── */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterPill,
                {
                  backgroundColor: active ? colors.primary : colors.inputBg,
                },
              ]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterLabel,
                  { color: active ? colors.primaryText : colors.textSecondary },
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={filtered.length === 0 ? styles.flexGrow : styles.listPadding}
        ListEmptyComponent={
          <EmptyState
            message={
              filter !== 'all'
                ? `No ${filter} tasks.`
                : 'No tasks yet. Tap + to add one.'
            }
          />
        }
        renderItem={({ item, index }) => (
          <TaskItem
            task={item}
            index={index}
            onToggle={() => handleToggle(item)}
            onDelete={() => handleDelete(item.id)}
            onEdit={() => setEditTarget(item)}
          />
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setCreateVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <CreateTaskModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onSubmit={handleCreate}
      />

      <EditTaskModal
        visible={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEditSave}
        initialTitle={editTarget?.title ?? ''}
        initialDueDate={editTarget?.due_date ?? ''}
        initialPriority={editTarget?.priority ?? 'medium'}
        initialCategory={editTarget?.category ?? ''}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flexGrow: { flexGrow: 1 },
  listPadding: { paddingVertical: 8, paddingBottom: 100 },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  fabIcon: {
    fontSize: 30,
    color: '#fff',
    lineHeight: 34,
    fontWeight: '300',
  },
});
