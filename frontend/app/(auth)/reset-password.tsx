import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../src/services/api';
import { DequadLogo } from '../../src/components/DequadLogo';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const token = (params.token as string) || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setTokenValid(false);
      setErr('Missing reset token. Please use the link from your email.');
      return;
    }
    (async () => {
      try {
        const res = await api.get(`/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
        if (res?.valid) {
          setTokenValid(true);
          setEmail(res.email || '');
        } else {
          setErr('This reset link is invalid or has expired.');
        }
      } catch (e: any) {
        setErr(e?.message?.replace(/^Error:\s*/, '') || 'This reset link is invalid or has expired.');
      } finally {
        setVerifying(false);
      }
    })();
  }, [token]);

  const handleSubmit = async () => {
    setErr(null);
    if (password.length < 8) {
      setErr('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setErr('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', { token, new_password: password });
      setDone(true);
    } catch (e: any) {
      setErr(e?.message?.replace(/^Error:\s*/, '') || 'Could not reset password. Please request a new link.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B', '#0F172A']} style={styles.gradient} locations={[0, 0.5, 1]}>
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

        <Pressable style={styles.backButton} onPress={() => router.replace('/(auth)/login')} data-testid="reset-back">
          <Ionicons name="arrow-back" size={22} color="#F8FAFC" />
        </Pressable>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <View style={styles.logoContainer}>
                <View style={styles.logoGlow}>
                  <DequadLogo size={80} />
                </View>
                <Text style={styles.title} data-testid="reset-title">
                  {done ? 'Password updated' : 'Set a new password'}
                </Text>
                {email && !done ? (
                  <Text style={styles.subtitle}>for <Text style={styles.email}>{email}</Text></Text>
                ) : null}
                {done ? (
                  <Text style={styles.subtitle}>You can now sign in with your new password.</Text>
                ) : null}
              </View>

              {verifying ? (
                <View style={styles.center}><ActivityIndicator color="#818CF8" /></View>
              ) : done ? (
                <TouchableOpacity
                  style={styles.submit}
                  onPress={() => router.replace('/(auth)/login')}
                  data-testid="reset-to-login"
                >
                  <Text style={styles.submitText}>Back to sign in</Text>
                </TouchableOpacity>
              ) : !tokenValid ? (
                <View>
                  <Text style={styles.errorText} data-testid="reset-error">{err || 'This reset link is invalid or has expired.'}</Text>
                  <TouchableOpacity
                    style={styles.submit}
                    onPress={() => router.replace('/(auth)/forgot-password')}
                    data-testid="reset-request-new"
                  >
                    <Text style={styles.submitText}>Request a new link</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <View style={styles.inputWrap}>
                    <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="New password (8+ characters)"
                      placeholderTextColor="#64748B"
                      secureTextEntry
                      style={styles.input}
                      data-testid="reset-password-input"
                    />
                  </View>
                  <View style={styles.inputWrap}>
                    <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      value={confirm}
                      onChangeText={setConfirm}
                      placeholder="Confirm new password"
                      placeholderTextColor="#64748B"
                      secureTextEntry
                      style={styles.input}
                      data-testid="reset-confirm-input"
                    />
                  </View>
                  {err ? <Text style={styles.errorText} data-testid="reset-error">{err}</Text> : null}
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={submitting}
                    style={[styles.submit, submitting && styles.submitDisabled]}
                    data-testid="reset-submit"
                  >
                    {submitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.submitText}>Update password</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  gradient: { flex: 1 },
  decorativeCircle1: {
    position: 'absolute', top: -80, right: -80, width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  decorativeCircle2: {
    position: 'absolute', bottom: 100, left: -100, width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
  },
  backButton: {
    position: 'absolute', top: 60, left: 20, zIndex: 10, width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  scroll: { flexGrow: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 110, paddingBottom: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoGlow: {
    width: 96, height: 96, borderRadius: 28,
    backgroundColor: 'rgba(122, 179, 224, 0.12)',
    borderWidth: 1, borderColor: 'rgba(122, 179, 224, 0.18)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 18,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#F8FAFC', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#94A3B8', textAlign: 'center', maxWidth: 320, lineHeight: 21 },
  email: { color: '#E0E7FF', fontWeight: '600' },
  center: { alignItems: 'center', paddingVertical: 24 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12, paddingHorizontal: 14, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.18)',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, color: '#F1F5F9', fontSize: 15 },
  errorText: { color: '#F87171', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  submit: {
    backgroundColor: '#6366F1', paddingVertical: 15, borderRadius: 12, alignItems: 'center',
    minHeight: 52, justifyContent: 'center', marginTop: 4,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
});
