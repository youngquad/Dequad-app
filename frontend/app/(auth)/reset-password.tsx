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
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Pressable style={styles.backButton} onPress={() => router.replace('/(auth)/login')} data-testid="reset-back">
            <Ionicons name="arrow-back" size={20} color="#0F2942" />
          </Pressable>

          <View style={styles.content}>
            <View style={styles.brandRow}>
              <DequadLogo size={48} />
              <Text style={styles.brandWordmark}>DEQUAD</Text>
            </View>

            <Text style={styles.kicker}>
              {done ? 'ALL DONE' : tokenValid ? 'NEW PASSWORD' : 'RESET LINK'}
            </Text>
            <Text style={styles.title} data-testid="reset-title">
              {done ? 'Password updated.' : 'Set a new password.'}
            </Text>
            {email && !done ? (
              <Text style={styles.lede}>
                For <Text style={styles.email}>{email}</Text>. Choose something 8+ characters long.
              </Text>
            ) : done ? (
              <Text style={styles.lede}>You can now sign in with your new password.</Text>
            ) : null}

            <View style={styles.card}>
              {verifying ? (
                <View style={styles.center}><ActivityIndicator color="#5B9BD5" /></View>
              ) : done ? (
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => router.replace('/(auth)/login')}
                  data-testid="reset-to-login"
                >
                  <Text style={styles.primaryBtnText}>Back to sign in</Text>
                </TouchableOpacity>
              ) : !tokenValid ? (
                <View>
                  <Text style={styles.errorText} data-testid="reset-error">
                    {err || 'This reset link is invalid or has expired.'}
                  </Text>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => router.replace('/(auth)/forgot-password')}
                    data-testid="reset-request-new"
                  >
                    <Text style={styles.primaryBtnText}>Request a new link</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <View style={styles.inputWrap}>
                    <Ionicons name="lock-closed-outline" size={18} color="#4F6076" style={styles.inputIcon} />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="New password (8+ characters)"
                      placeholderTextColor="#94A3B0"
                      secureTextEntry
                      style={styles.input}
                      data-testid="reset-password-input"
                    />
                  </View>
                  <View style={styles.inputWrap}>
                    <Ionicons name="lock-closed-outline" size={18} color="#4F6076" style={styles.inputIcon} />
                    <TextInput
                      value={confirm}
                      onChangeText={setConfirm}
                      placeholder="Confirm new password"
                      placeholderTextColor="#94A3B0"
                      secureTextEntry
                      style={styles.input}
                      data-testid="reset-confirm-input"
                    />
                  </View>
                  {err ? <Text style={styles.errorText} data-testid="reset-error">{err}</Text> : null}
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={submitting}
                    style={[styles.primaryBtn, submitting && styles.btnDisabled]}
                    data-testid="reset-submit"
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryBtnText}>Update password</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6FAFE' },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48 },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE8F2',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  content: { maxWidth: 520, width: '100%', alignSelf: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 },
  brandWordmark: { color: '#0F2942', fontWeight: '800', fontSize: 13, letterSpacing: 2.4 },
  kicker: { color: '#4F6076', fontSize: 12, fontWeight: '700', letterSpacing: 2.6, marginBottom: 14 },
  title: {
    color: '#0F2942', fontSize: 32, fontWeight: '700',
    fontFamily: 'Playfair Display, Georgia, serif',
    lineHeight: 38, marginBottom: 14, letterSpacing: -0.5,
  },
  lede: { color: '#4F6076', fontSize: 16, lineHeight: 24, marginBottom: 28 },
  email: { color: '#0F2942', fontWeight: '700' },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: '#DDE8F2',
    shadowColor: '#0F2942', shadowOpacity: 0.05, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 2,
  },
  center: { alignItems: 'center', paddingVertical: 24 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6FAFE',
    borderRadius: 14, paddingHorizontal: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#DDE8F2',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, color: '#0F2942', fontSize: 15 },
  errorText: { color: '#B91C1C', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  primaryBtn: {
    backgroundColor: '#5B9BD5', paddingVertical: 14, borderRadius: 999, alignItems: 'center',
    minHeight: 52, justifyContent: 'center', marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', letterSpacing: 0.4 },
});
