import React, { useEffect, useRef, useState, useMemo } from 'react';
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
import { useTheme, Theme } from '../src/contexts/ThemeContext';
import { Fonts } from '../src/constants/fonts';
import { api } from '../src/services/api';

/**
 * Email-verification (OTP) screen. After signup, users land here with their
 * .ac.uk email in the URL params. They enter the 6-digit code from their
 * university inbox to unlock their account.
 */
export default function VerifyEmail() {
  const router = useRouter();
  const { theme: t } = useTheme();
  const styles = useMemo(() => createStyles(t), [t]);
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

  // Delivery feedback: ask the backend whether the code email actually reached
  // the university's mail server. Hard bounces (wrong address) show up within
  // seconds — far better than letting the user stare at an empty inbox.
  type Delivery = { status: string; deliverable: boolean; message: string | null };
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [deliveryTick, setDeliveryTick] = useState(0);
  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    const delays = [4000, 8000, 15000, 30000, 60000];
    const timers = delays.map((ms) =>
      setTimeout(async () => {
        if (cancelled) return;
        try {
          const d: Delivery = await api.get(`/auth/verification-delivery?email=${encodeURIComponent(email)}`);
          if (!cancelled) setDelivery(d);
        } catch {}
      }, ms),
    );
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [email, deliveryTick]);

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
      setDelivery(null);
      setDeliveryTick((n) => n + 1);
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
            testID="verify-back"
          >
            <Ionicons name="arrow-back" size={20} color={t.text} />
          </Pressable>

          <View style={styles.brandRow}>
            <DequadLogo size={56} />
            <Text style={styles.brandWordmark}>DEQUAD</Text>
          </View>

          <Text style={styles.kicker}>VERIFY YOUR UNI EMAIL</Text>
          <Text style={styles.title} testID="verify-title">
            Check your inbox.
          </Text>
          <Text style={styles.lede}>
            We just sent a 6-digit code to{' '}
            <Text style={styles.emailStrong}>{email || 'your university email'}</Text>. Enter it
            below to unlock your DEQUAD account.
          </Text>

          <View style={styles.codeRow} testID="verify-code-row">
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
                testID={`verify-code-${idx}`}
                selectTextOnFocus
              />
            ))}
          </View>

          {delivery && !delivery.deliverable && (
            <View style={styles.deliveryFail} testID="verify-delivery-failed">
              <Ionicons name="alert-circle" size={20} color={t.danger} />
              <View style={{ flex: 1 }}>
                <Text style={styles.deliveryFailTitle}>
                  {delivery.status === 'not_sent' ? "We couldn't send the code" : 'Email could not be delivered'}
                </Text>
                <Text style={styles.deliveryFailText} testID="verify-delivery-message">{delivery.message}</Text>
                {delivery.status !== 'not_sent' && (
                  <Pressable
                    onPress={() => router.replace('/(auth)/login' as any)}
                    style={styles.deliveryFailBtn}
                    testID="verify-use-different-email"
                  >
                    <Text style={styles.deliveryFailBtnText}>Use a different email</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}
          {delivery?.deliverable && delivery.message && !error && (
            <View style={styles.deliveryOk} testID="verify-delivery-ok">
              <Ionicons name={delivery.status === 'delivered' ? 'checkmark-circle' : 'time-outline'} size={16} color={t.success} />
              <Text style={styles.deliveryOkText}>{delivery.message}</Text>
            </View>
          )}

          {error && (
            <Text style={styles.error} testID="verify-error">
              {error}
            </Text>
          )}
          {info && !error && (
            <Text style={styles.info} testID="verify-info">
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
            testID="verify-submit"
          >
            {submitting ? (
              <ActivityIndicator color={t.primaryText} />
            ) : (
              <Text style={styles.submitText}>Verify & continue</Text>
            )}
          </Pressable>

          {cooldown > 0 ? (
            <View style={styles.cooldownPill} testID="verify-cooldown-timer">
              <Ionicons name="time-outline" size={16} color={t.textMuted} />
              <Text style={styles.cooldownText}>
                You can request a new code in{' '}
                <Text style={styles.cooldownSeconds}>{cooldown}s</Text>
              </Text>
            </View>
          ) : (
            <Pressable onPress={handleResend} style={styles.resendBtn} testID="verify-resend">
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

const createStyles = (t: Theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.bg },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingVertical: 32, gap: 14 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: t.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  brandWordmark: {
    color: t.text,
    fontWeight: '900',
    fontSize: 20,
    letterSpacing: 5,
  },
  kicker: { color: t.success, fontWeight: '800', fontSize: 12, letterSpacing: 3 },
  title: {
    color: t.text,
    fontSize: 30,
    fontFamily: Fonts.headingBlack,
    marginVertical: 4,
  },
  lede: { color: t.textMuted, fontSize: 15, lineHeight: 22, marginBottom: 12 },
  emailStrong: { color: t.text, fontWeight: '700' },
  codeRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between', marginVertical: 16 },
  codeInput: {
    width: 50,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: t.border,
    backgroundColor: t.inputBg,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '800',
    color: t.text,
  },
  codeInputFilled: { borderColor: t.success, backgroundColor: t.isDark ? t.card : '#F0FAF6' },
  error: { color: t.danger, fontSize: 14, fontWeight: '600' },
  deliveryFail: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 14,
    backgroundColor: t.card,
    borderWidth: 1,
    borderColor: t.danger,
  },
  deliveryFailTitle: { color: t.danger, fontSize: 14, fontWeight: '800' },
  deliveryFailText: { color: t.text, fontSize: 13, lineHeight: 19, marginTop: 4 },
  deliveryFailBtn: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: t.danger,
  },
  deliveryFailBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  deliveryOk: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  deliveryOkText: { color: t.textMuted, fontSize: 13, flex: 1 },
  info: { color: t.success, fontSize: 14, fontWeight: '600' },
  submit: {
    backgroundColor: t.primary,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 16,
  },
  submitDisabled: { opacity: 0.45 },
  submitText: { color: t.primaryText, fontWeight: '800', fontSize: 16 },
  resendBtn: { paddingVertical: 12, alignItems: 'center' },
  cooldownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'center',
    backgroundColor: t.inputBg,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginTop: 4,
  },
  cooldownText: { color: t.textMuted, fontSize: 14, fontWeight: '600' },
  cooldownSeconds: { color: t.text, fontWeight: '900' },
  resendText: { color: t.success, fontWeight: '700', fontSize: 14 },
  resendTextDisabled: { color: t.textFaint },
  helper: { color: t.textMuted, fontSize: 13, textAlign: 'center', marginTop: 8 },
  helperLink: { color: t.text, fontWeight: '700', textDecorationLine: 'underline' },
});
