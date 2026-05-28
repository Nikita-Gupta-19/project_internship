import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  verifyOtp,
  sendOtp,
  clearError,
  selectAuthLoading,
  selectAuthError,
} from '../../store/slices/authSlice';
import useThemeColors from '../../hooks/useThemeColors';
import LoadingButton from '../../components/LoadingButton';

export default function VerifyOtpScreen({ route }) {
  const colors = useThemeColors();
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  // email comes from SendOtpScreen navigation; otp is local only
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    await dispatch(verifyOtp({ email, otp }));
    // On success the token lands in Redux → AppNavigator re-renders to App stack automatically.
    // No manual navigation needed.
  };

  const handleResend = async () => {
    setResendMsg('');
    setResending(true);
    const result = await dispatch(sendOtp(email));
    if (sendOtp.fulfilled.match(result)) {
      setResendMsg('A new code has been sent.');
    }
    setResending(false);
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
            <Text style={[styles.title, { color: colors.text }]}>Check your email</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              We sent a code to{' '}
              <Text style={[styles.emailHighlight, { color: colors.primary }]}>{email}</Text>
            </Text>
          </View>

          {/* OTP Input */}
          <TextInput
            style={[
              styles.otpInput,
              {
                backgroundColor: colors.inputBg,
                color: colors.text,
                borderColor: error ? colors.danger : colors.border,
              },
            ]}
            placeholder="000000"
            placeholderTextColor={colors.textSecondary}
            value={otp}
            onChangeText={(t) => {
              setOtp(t.replace(/\D/g, ''));
              if (error) dispatch(clearError());
            }}
            keyboardType="numeric"
            maxLength={6}
            textAlign="center"
            returnKeyType="done"
            onSubmitEditing={handleVerify}
          />

          {error ? (
            <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
          ) : null}
          {resendMsg ? (
            <Text style={[styles.resendMsg, { color: colors.success }]}>{resendMsg}</Text>
          ) : null}

          <LoadingButton
            label="Verify"
            onPress={handleVerify}
            loading={loading}
            style={styles.btn}
            disabled={otp.length !== 6}
          />

          {/* Resend */}
          <TouchableOpacity
            style={styles.resendWrap}
            onPress={handleResend}
            disabled={resending}
          >
            <Text style={[styles.resendText, { color: colors.textSecondary }]}>
              Didn't receive it?{' '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>
                {resending ? 'Sending…' : 'Resend code'}
              </Text>
            </Text>
          </TouchableOpacity>
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
  emailHighlight: { fontWeight: '600' },
  otpInput: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  error: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  resendMsg: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  btn: { marginTop: 16 },
  resendWrap: { marginTop: 24, alignItems: 'center' },
  resendText: { fontSize: 14 },
});
