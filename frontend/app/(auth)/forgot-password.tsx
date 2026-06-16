import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../src/services/api';
import { DequadLogo } from '../../src/components/DequadLogo';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSubmit = async () => {
    setErr(null);
    const trimmed = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setErr('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: trimmed });
      setSent(true);
    } catch {
      // Always show "sent" — prevents account enumeration.
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#0F172A']}
        style={styles.gradient}
        locations={[0, 0.5, 1]}
      >
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

        <Pressable style={styles.backButton} onPress={() => router.back()} data-testid="forgot-back">
          <Ionicons name="arrow-back" size={22} color="#F8FAFC" />
        </Pressable>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
            >
              <View style={styles.logoContainer}>
                <View style={styles.logoGlow}>
                  <DequadLogo size={80} />
                </View>
                <Text style={styles.title} data-testid="forgot-title">
                  {sent ? 'Check your email' : 'Forgot password?'}
                </Text>
                <Text style={styles.subtitle}>
                  {sent
                    ? `If an account exists for ${email.toLowerCase()}, we've sent a reset link. It expires in 1 hour.`
                    : "Enter the email tied to your DEQUAD account and we'll send you a reset link."}
                </Text>
              </View>

              {!sent ? (
                <View style={styles.formContainer}>
                  <View style={styles.inputWrap}>
                    <Ionicons name="mail-outline" size={18} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Email address"
                      placeholderTextColor="#64748B"
                      style={styles.input}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      autoFocus
                      data-testid="forgot-email-input"
                    />
                  </View>

                  {err ? <Text style={styles.errorText} data-testid="forgot-error">{err}</Text> : null}

                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    style={[styles.submit, loading && styles.submitDisabled]}
                    data-testid="forgot-submit"
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.submitText}>Send reset link</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.replace('/(auth)/login')}
                    style={styles.backLink}
                    data-testid="forgot-back-to-login"
                  >
                    <Ionicons name="arrow-back" size={14} color="#94A3B8" />
                    <Text style={styles.backLinkText}>Back to sign in</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.formContainer}>
                  <View style={styles.instructions}>
                    <View style={styles.instructionRow}>
                      <View style={styles.bullet}><Text style={styles.bulletText}>1</Text></View>
                      <Text style={styles.instructionText}>Check your inbox (and spam folder)</Text>
                    </View>
                    <View style={styles.instructionRow}>
                      <View style={styles.bullet}><Text style={styles.bulletText}>2</Text></View>
                      <Text style={styles.instructionText}>Click the reset link in the email</Text>
                    </View>
                    <View style={styles.instructionRow}>
                      <View style={styles.bullet}><Text style={styles.bulletText}>3</Text></View>
                      <Text style={styles.instructionText}>Create a new password (min 8 chars)</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => router.replace('/(auth)/login')}
                    style={styles.submit}
                    data-testid="forgot-back-to-login"
                  >
                    <Text style={styles.submitText}>Back to sign in</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => { setSent(false); setEmail(''); }}
                    style={styles.backLink}
                    data-testid="forgot-try-again"
                  >
                    <Text style={styles.backLinkText}>Try a different email</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
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
  title: { fontSize: 26, fontWeight: '800', color: '#F8FAFC', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#94A3B8', textAlign: 'center', maxWidth: 320, lineHeight: 21 },
  formContainer: { marginTop: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12, paddingHorizontal: 14, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.18)',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, color: '#F1F5F9', fontSize: 15 },
  errorText: { color: '#F87171', fontSize: 13, marginBottom: 10, textAlign: 'center' },
  submit: {
    backgroundColor: '#6366F1', paddingVertical: 15, borderRadius: 12, alignItems: 'center',
    minHeight: 52, justifyContent: 'center', marginTop: 4,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  backLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 16 },
  backLinkText: { color: '#94A3B8', fontSize: 13 },
  instructions: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.12)',
  },
  instructionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  bullet: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: '#6366F1',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  bulletText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  instructionText: { color: '#CBD5E1', fontSize: 14, flex: 1 },
});
