import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import useThemeColors from '../../hooks/useThemeColors';
import LoadingButton from '../../components/LoadingButton';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default function EditTaskModal({
  visible,
  onClose,
  onSubmit,
  initialTitle = '',
  initialDueDate = '',
  initialPriority = 'medium',
  initialCategory = '',
}) {
  const colors = useThemeColors();
  const [title, setTitle] = useState(initialTitle);
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [priority, setPriority] = useState(initialPriority);
  const [category, setCategory] = useState(initialCategory);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setTitle(initialTitle);
      setDueDate(initialDueDate ? initialDueDate.split('T')[0] : '');
      setPriority(initialPriority || 'medium');
      setCategory(initialCategory || '');
      setError('');
    }
  }, [visible, initialTitle, initialDueDate, initialPriority, initialCategory]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (dueDate && !DATE_REGEX.test(dueDate)) {
      setError('Date must be in YYYY-MM-DD format.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSubmit({ 
        title: title.trim(), 
        due_date: dueDate.trim() || null,
        priority,
        category: category.trim() || null
      });
    } catch (e) {
      setError(e?.message || 'Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text style={[styles.heading, { color: colors.text }]}>Edit Task</Text>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Title *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
            placeholder="Task title"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            maxLength={200}
            returnKeyType="next"
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Due Date (optional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
            value={dueDate}
            onChangeText={setDueDate}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Priority</Text>
          <View style={styles.priorityRow}>
            {['low', 'medium', 'high'].map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityBtn,
                  priority === p ? { backgroundColor: colors.primary, borderColor: colors.primary } : { borderColor: colors.border }
                ]}
                onPress={() => setPriority(p)}
              >
                <Text style={[
                  styles.priorityText,
                  priority === p ? { color: '#fff' } : { color: colors.textSecondary }
                ]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Category (optional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g. Work, Personal"
            placeholderTextColor={colors.textSecondary}
            value={category}
            onChangeText={setCategory}
            maxLength={50}
          />

          {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <LoadingButton
              label="Save changes"
              onPress={handleSave}
              loading={loading}
              style={styles.saveBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 12 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  error: { marginTop: 10, fontSize: 13, fontWeight: '500' },
  priorityRow: { flexDirection: 'row', gap: 8 },
  priorityBtn: { flex: 1, paddingVertical: 10, borderWidth: 1, borderRadius: 8, alignItems: 'center' },
  priorityText: { fontSize: 13, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, height: 52, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: 16, fontWeight: '600' },
  saveBtn: { flex: 1 },
});
