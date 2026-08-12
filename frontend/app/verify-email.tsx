import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { DequadLogo } from '../src/components/DequadLogo';

/**
 * Email-verification (OTP) screen. After signup, users land here with their
 * .ac.uk email in the URL params. They enter the 6-digit code from their
 * university inbox to unlock their account.
 */
export default function VerifyEmail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { verifyEmail, resendVerification } = useAuth();

  const email = (params.email as string) || '';
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // A code was just sent (at signup or via resend), so the 60s cooldown starts immediately
  const [cooldown, setCooldown] = useState(60);

  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    // Auto-focus the first box on mount
    setTimeout(() => inputs.current[0]?.focus(), 200);
  }, []);

  const handleChange = (idx: number, value: string) => {
    setError(null);
    // Strip non-digits and only accept the first digit
    const sanitized = value.replace(/\D/g, '');
    if (!sanitized) {
      const next = [...code];
      next[idx] = '';
      setCode(next);
      return;
    }

    // Pasted full code (e.g. 6 digits at once)
    if (sanitized.length >= 6) {
      const pasted = sanitized.slice(0, 6).split('');
      setCode([pasted[0] || '', pasted[1] || '', pasted[2] || '', pasted[3] || '', pasted[4] || '', pasted[5] || '']);
      inputs.current[5]?.focus();
      // Auto-submit when fully pasted
      submit(sanitized.slice(0, 6));
      return;
    }

    const next = [...code];
    next[idx] = sanitized[0];
    setCode(next);

    if (idx < 5) {
      inputs.current[idx + 1]?.focus();
    } else if (next.every((d) => d)) {
      // Last digit entered manually
      submit(next.join(''));
    }
  };

  const handleKeyPress = (idx: number, key: string) => {
    if (key === 'Backspace' && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const submit = async (fullCode: string) => {
    if (!email) {
      setError('No email provided. Please go back and sign up again.');
      return;
    }
    if (!/^\d{6}$/.test(fullCode)) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await verifyEmail(email, fullCode);
      // Success — AuthContext stored the session. Land on the main app.
      router.replace('/(main)/mood');
    } catch (err: any) {
      setError(err?.message?.replace(/^Error:\s*/, '') || 'Verification failed.');
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    if (!email) {
      setError('No email provided.');
      return;
    }
    setError(null);
    setInfo(null);
    try {
      const res = await resendVerification(email);
      if (res?.cooldown_seconds) {
        setCooldown(res.cooldown_seconds);
        setInfo(res.message || `Please wait ${res.cooldown_seconds}s before requesting another code.`);
      } else {
        setCooldown(60);
        setInfo('A new code is on its way to your inbox.');
      }
    } catch (err: any) {
      setError(err?.message?.replace(/^Error:\s*/, '') || 'Failed to resend code.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            data-testid="verify-back"
          >
            <Ionicons name="arrow-back" size={20} color="#0F2942" />
          </Pressable>

          <View style={styles.brandRow}>
            <DequadLogo size={56} />
            <Text style={styles.brandWordmark}>DEQUAD</Text>
          </View>

          <Text style={styles.kicker}>VERIFY YOUR UNI EMAIL</Text>
          <Text style={styles.title} data-testid="verify-title">
            Check your inbox.
          </Text>
          <Text style={styles.lede}>
            We just sent a 6-digit code to{' '}
            <Text style={styles.emailStrong}>{email || 'your university email'}</Text>. Enter it
            below to unlock your DEQUAD account.
          </Text>

          <View style={styles.codeRow} data-testid="verify-code-row">
            {code.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(r) => (inputs.current[idx] = r)}
                value={digit}
                onChangeText={(v) => handleChange(idx, v)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(idx, nativeEvent.key)}
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={1}
                editable={!submitting}
                style={[styles.codeInput, !!digit && styles.codeInputFilled]}
                data-testid={`verify-code-${idx}`}
                selectTextOnFocus
              />
            ))}
          </View>

          {error && (
            <Text style={styles.error} data-testid="verify-error">
              {error}
            </Text>
          )}
          {info && !error && (
            <Text style={styles.info} data-testid="verify-info">
              {info}
            </Text>
          )}

          <Pressable
            onPress={() => submit(code.join(''))}
            disabled={submitting || code.some((d) => !d)}
            style={[
              styles.submit,
              (submitting || code.some((d) => !d)) && styles.submitDisabled,
            ]}
            data-testid="verify-submit"
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Verify & continue</Text>
            )}
          </Pressable>

          {cooldown > 0 ? (
            <View style={styles.cooldownPill} data-testid="verify-cooldown-timer">
              <Ionicons name="time-outline" size={16} color="#4F6076" />
              <Text style={styles.cooldownText}>
                You can request a new code in{' '}
                <Text style={styles.cooldownSeconds}>{cooldown}s</Text>
              </Text>
            </View>
          ) : (
            <Pressable onPress={handleResend} style={styles.resendBtn} data-testid="verify-resend">
              <Text style={styles.resendText}>Didn't get it? Resend code</Text>
            </Pressable>
          )}

          <Text style={styles.helper}>
            Wrong email?{' '}
            <Text style={styles.helperLink} onPress={() => router.replace('/(auth)/login' as any)}>
              Go back to sign up
            </Text>
            .
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F7FB' },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingVertical: 32, gap: 14 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  brandWordmark: {
    color: '#0F2942',
    fontWeight: '900',
    fontSize: 20,
    letterSpacing: 5,
  },
  kicker: { color: '#4FB89F', fontWeight: '800', fontSize: 12, letterSpacing: 3 },
  title: {
    color: '#0F2942',
    fontSize: 30,
    fontWeight: '900',
    fontFamily: Platform.OS === 'web' ? '"Playfair Display", serif' : undefined,
    marginVertical: 4,
  },
  lede: { color: '#4F6076', fontSize: 15, lineHeight: 22, marginBottom: 12 },
  emailStrong: { color: '#0F2942', fontWeight: '700' },
  codeRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between', marginVertical: 16 },
  codeInput: {
    width: 50,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D5DCE5',
    backgroundColor: '#fff',
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '800',
    color: '#0F2942',
  },
  codeInputFilled: { borderColor: '#4FB89F', backgroundColor: '#F0FAF6' },
  error: { color: '#D63B45', fontSize: 14, fontWeight: '600' },
  info: { color: '#0F7A5E', fontSize: 14, fontWeight: '600' },
  submit: {
    backgroundColor: '#0F2942',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 16,
  },
  submitDisabled: { opacity: 0.45 },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  resendBtn: { paddingVertical: 12, alignItems: 'center' },
  cooldownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'center',
    backgroundColor: '#EAEFF5',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginTop: 4,
  },
  cooldownText: { color: '#4F6076', fontSize: 14, fontWeight: '600' },
  cooldownSeconds: { color: '#0F2942', fontWeight: '900' },
  resendText: { color: '#4FB89F', fontWeight: '700', fontSize: 14 },
  resendTextDisabled: { color: '#94A3B0' },
  helper: { color: '#4F6076', fontSize: 13, textAlign: 'center', marginTop: 8 },
  helperLink: { color: '#0F2942', fontWeight: '700', textDecorationLine: 'underline' },
});
