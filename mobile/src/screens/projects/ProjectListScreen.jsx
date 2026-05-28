import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import {
  fetchProjects,
  createProject,
  deleteProject,
  editProject,
  selectProjects,
  selectProjectsLoading,
  selectProjectsError,
} from '../../store/slices/projectsSlice';

import useThemeColors from '../../hooks/useThemeColors';
import ProjectCard from '../../components/ProjectCard';
import EmptyState from '../../components/EmptyState';
import SkeletonCard from '../../components/SkeletonCard';
import CreateProjectModal from '../modals/CreateProjectModal';
import EditProjectModal from '../modals/EditProjectModal';

export default function ProjectListScreen({ navigation }) {
  const colors = useThemeColors();
  const dispatch = useDispatch();

  const projects = useSelector(selectProjects);
  const loading = useSelector(selectProjectsLoading);
  const error = useSelector(selectProjectsError);

  // Local UI state only
  const [createVisible, setCreateVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // { id, title, description }
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchProjects());
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchProjects());
    setRefreshing(false);
  };

  const handleDelete = (projectId) => {
    dispatch(deleteProject(projectId));
  };

  const handleCreate = async ({ title, description }) => {
    const result = await dispatch(createProject({ title, description }));
    if (createProject.fulfilled.match(result)) {
      setCreateVisible(false);
    } else {
      throw new Error(result.payload);
    }
  };

  const handleEditOpen = (project) => {
    setEditTarget(project);
  };

  const handleEditSave = async ({ title, description }) => {
    const result = await dispatch(
      editProject({ projectId: editTarget.id, title, description })
    );
    if (editProject.fulfilled.match(result)) {
      setEditTarget(null);
    } else {
      throw new Error(result.payload);
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginRight: 16 }}>
          <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 15 }}>Settings</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors]);

  // Client-side search filter
  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );

  // Show skeleton on first load (no data yet)
  if (loading && projects.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {error ? (
        <Text style={[styles.errorBanner, { color: colors.danger, backgroundColor: colors.card }]}>
          {error}
        </Text>
      ) : null}

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.inputBg, color: colors.text }]}
          placeholder="Search projects…"
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={filtered.length === 0 ? styles.flexGrow : styles.listPadding}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            message={
              query
                ? `No projects match "${query}".`
                : 'No projects yet. Tap + to create one.'
            }
          />
        }
        renderItem={({ item, index }) => (
          <ProjectCard
            project={item}
            index={index}
            onPress={() =>
              navigation.navigate('ProjectDetail', {
                projectId: item.id,
                title: item.title,
              })
            }
            onDelete={() => handleDelete(item.id)}
            onEdit={() => handleEditOpen(item)}
          />
        )}
      />

      {/* Create FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setCreateVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <CreateProjectModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onSubmit={handleCreate}
      />

      <EditProjectModal
        visible={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEditSave}
        initialTitle={editTarget?.title ?? ''}
        initialDescription={editTarget?.description ?? ''}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flexGrow: { flexGrow: 1 },
  listPadding: { paddingVertical: 8, paddingBottom: 100 },
  errorBanner: {
    margin: 16,
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    fontWeight: '500',
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
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
