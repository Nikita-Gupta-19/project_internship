import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  sendOtp,
  clearError,
  selectAuthLoading,
  selectAuthError,
} from '../../store/slices/authSlice';
import useThemeColors from '../../hooks/useThemeColors';
import LoadingButton from '../../components/LoadingButton';

export default function SendOtpScreen({ navigation }) {
  const colors = useThemeColors();
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  // Only email is local state — everything else is Redux
  const [email, setEmail] = useState('');

  const handleSend = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      // Dispatch a quick local message via the existing error field
      return;
    }
    const result = await dispatch(sendOtp(trimmed));
    if (sendOtp.fulfilled.match(result)) {
      navigation.navigate('VerifyOtp', { email: trimmed });
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Sign in</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              We'll send a one-time code to your email
            </Text>
          </View>

          {/* Input */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Email address</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                color: colors.text,
                borderColor: error ? colors.danger : colors.border,
              },
            ]}
            placeholder="you@example.com"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (error) dispatch(clearError());
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />

          {error ? (
            <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
          ) : null}

          <LoadingButton
            label="Send Code"
            onPress={handleSend}
            loading={loading}
            style={styles.btn}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  header: { marginBottom: 36 },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, lineHeight: 22 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 8,
  },
  error: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
  },
  btn: { marginTop: 16 },
});
