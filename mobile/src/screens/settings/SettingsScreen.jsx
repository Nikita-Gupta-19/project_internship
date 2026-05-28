import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, logout, selectUser, selectAuthLoading } from '../../store/slices/authSlice';
import { setThemeMode, selectThemeMode } from '../../store/slices/themeSlice';
import useThemeColors from '../../hooks/useThemeColors';
import LoadingButton from '../../components/LoadingButton';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen({ navigation }) {
  const colors = useThemeColors();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);
  const themeMode = useSelector(selectThemeMode);

  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  const handleSave = async () => {
    try {
      await dispatch(updateProfile({ name: name.trim(), avatar_url: avatarUrl.trim() })).unwrap();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (e) {
      Alert.alert('Error', e || 'Failed to update profile.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        
        <View style={styles.header}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {name ? name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.emailText, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Appearance</Text>
        <View style={[styles.segmentWrap, { backgroundColor: colors.inputBg }]}>
          {['system', 'light', 'dark'].map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.segmentBtn,
                themeMode === mode && { backgroundColor: colors.card, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 }
              ]}
              onPress={() => dispatch(setThemeMode(mode))}
            >
              <Text style={[
                styles.segmentText,
                { color: themeMode === mode ? colors.text : colors.textSecondary }
              ]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.textSecondary, marginTop: 24 }]}>Display Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="e.g. Jane Doe"
          placeholderTextColor={colors.textSecondary}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Avatar URL (optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="https://example.com/avatar.png"
          placeholderTextColor={colors.textSecondary}
          value={avatarUrl}
          onChangeText={setAvatarUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <LoadingButton
          label="Save Profile"
          onPress={handleSave}
          loading={loading}
          style={styles.saveBtn}
        />

        <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.danger }]} onPress={handleLogout}>
          <Text style={[styles.logoutText, { color: colors.danger }]}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '700' },
  emailText: { fontSize: 14, fontWeight: '500' },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 16 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15 },
  segmentWrap: { flexDirection: 'row', borderRadius: 12, padding: 4 },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  segmentText: { fontSize: 14, fontWeight: '600' },
  saveBtn: { marginTop: 32 },
  logoutBtn: { marginTop: 24, paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  logoutText: { fontSize: 16, fontWeight: '600' },
});
