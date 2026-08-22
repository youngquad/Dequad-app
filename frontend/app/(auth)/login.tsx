import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme, Theme } from '../../src/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { DequadLogo } from '../../src/components/DequadLogo';

/**
 * Login screen — mirrors the app's shared theme (ThemeContext) so it follows
 * the user's light/dark preference instead of a fixed palette. Admin access
 * is no longer shown here; it lives on its own page at `/admin-access`.
 */
export default function LoginScreen() {
  const router = useRouter();
  const { theme: t } = useTheme();
  const styles = useMemo(() => createStyles(t), [t]);
  const { login, loginWithEmail, registerWithEmail, isLoading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmStudent, setConfirmStudent] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleGoogle = async () => {
    setIsSigningIn(true);
    try {
      await login();
    } catch (e) {
      console.error('Login error:', e);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailSubmit = async () => {
    setEmailErr(null);
    if (!email || !password) {
      setEmailErr('Please enter both an email and a password.');
      return;
    }
    if (mode === 'signup' && password.length < 8) {
      setEmailErr('Password must be at least 8 characters.');
      return;
    }
    if (mode === 'signup' && !confirmStudent) {
      setEmailErr('Please confirm you are currently a student at a UK university.');
      return;
    }
    setIsSigningIn(true);
    try {
      if (mode === 'signin') {
        await loginWithEmail(email, password);
        router.replace('/(main)/mood');
      } else {
        const result = await registerWithEmail(email, password, name || undefined, confirmStudent);
        if (result?.requiresVerification) {
          router.replace({ pathname: '/verify-email', params: { email: email.trim().toLowerCase() } } as any);
        } else {
          router.replace('/(main)/mood');
        }
      }
    } catch (err: any) {
      const msg = err?.message || (mode === 'signin' ? 'Sign-in failed.' : 'Sign-up failed.');
      const clean = msg.replace(/^Error:\s*/, '');
      // Unverified account → send them straight to the code screen (a fresh code was just emailed)
      if (mode === 'signin' && /verify your university email/i.test(clean)) {
        router.replace({ pathname: '/verify-email', params: { email: email.trim().toLowerCase() } } as any);
        return;
      }
      setEmailErr(clean);
    } finally {
      setIsSigningIn(false);
    }
  };

  const busy = isSigningIn || isLoading;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable style={styles.backButton} onPress={() => router.back()} data-testid="login-back">
            <Ionicons name="arrow-back" size={20} color={t.text} />
          </Pressable>

          <Animated.View
            style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            {/* Brand mark */}
            <View style={styles.brandRow}>
              <DequadLogo size={56} />
              <Text style={styles.brandWordmark}>DEQUAD</Text>
            </View>

            {/* Heading */}
            <Text style={styles.kicker}>{mode === 'signin' ? 'WELCOME BACK' : 'JOIN DEQUAD'}</Text>
            <Text style={styles.title} data-testid="login-title">
              {mode === 'signin' ? 'Sign in to continue.' : 'Create your account.'}
            </Text>
            <Text style={styles.lede}>
              {mode === 'signin'
                ? 'Pick up where you left off — your matches, mood streak, and chats are waiting.'
                : 'Connect with verified UK students for friendship, study groups, and peer support.'}
            </Text>

            {/* Card */}
            <View style={styles.card}>
              {mode === 'signup' && (
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={18} color={t.textMuted} style={styles.inputIcon} />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name (optional)"
                    placeholderTextColor={t.textFaint}
                    style={styles.input}
                    data-testid="auth-name-input"
                    autoCapitalize="words"
                  />
                </View>
              )}
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={t.textMuted} style={styles.inputIcon} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email address"
                  placeholderTextColor={t.textFaint}
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  data-testid="auth-email-input"
                />
              </View>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={t.textMuted} style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder={mode === 'signup' ? 'Create a password (8+ characters)' : 'Password'}
                  placeholderTextColor={t.textFaint}
                  style={styles.input}
                  secureTextEntry
                  data-testid="auth-password-input"
                />
              </View>

              {emailErr ? (
                <Text style={styles.errorText} data-testid="auth-error">{emailErr}</Text>
              ) : null}

              {mode === 'signup' && (
                <Pressable
                  onPress={() => setConfirmStudent((v) => !v)}
                  style={styles.checkboxRow}
                  data-testid="auth-confirm-student"
                >
                  <View style={[styles.checkbox, confirmStudent && styles.checkboxOn]}>
                    {confirmStudent ? (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    ) : null}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    I confirm I'm currently enrolled as an undergraduate or postgraduate{' '}
                    <Text style={styles.checkboxLabelStrong}>student at a UK university</Text>
                    {' '}(staff and alumni accounts are not allowed).
                  </Text>
                </Pressable>
              )}

              <TouchableOpacity
                onPress={handleEmailSubmit}
                disabled={busy}
                style={[styles.primaryBtn, busy && styles.btnDisabled]}
                data-testid="auth-submit"
              >
                <Text style={styles.primaryBtnText}>
                  {busy ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              {mode === 'signin' && (
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/forgot-password')}
                  style={styles.forgotLink}
                  data-testid="auth-forgot-password"
                >
                  <Text style={styles.forgotLinkText}>Forgot your password?</Text>
                </TouchableOpacity>
              )}

              <View style={styles.modeRow}>
                <Text style={styles.modeText}>
                  {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                </Text>
                <TouchableOpacity
                  onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setEmailErr(null); }}
                  data-testid="auth-mode-toggle"
                >
                  <Text style={styles.modeAccent}>
                    {mode === 'signin' ? 'Sign up' : 'Sign in'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.terms}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink} onPress={() => router.push('/terms')}>Terms</Text> and{' '}
              <Text style={styles.termsLink} onPress={() => router.push('/privacy')}>Privacy Policy</Text>.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (t: Theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.bg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48 },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: t.card,
    borderWidth: 1, borderColor: t.border,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  content: { maxWidth: 520, width: '100%', alignSelf: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 },
  brandWordmark: { color: t.text, fontWeight: '800', fontSize: 13, letterSpacing: 2.4 },
  kicker: {
    color: t.textMuted, fontSize: 12, fontWeight: '700',
    letterSpacing: 2.6, marginBottom: 14,
  },
  title: {
    color: t.text, fontSize: 36, fontWeight: '700',
    lineHeight: 42, marginBottom: 14, letterSpacing: -0.5,
  },
  lede: { color: t.textMuted, fontSize: 16, lineHeight: 24, marginBottom: 28 },
  card: {
    backgroundColor: t.card, borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: t.border,
    shadowColor: t.isDark ? '#000000' : t.text, shadowOpacity: 0.05, shadowRadius: 24, shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: t.inputBg, borderRadius: 14, paddingHorizontal: 14,
    borderWidth: 1, borderColor: t.border, marginBottom: 12,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, color: t.text, fontSize: 15 },
  errorText: { color: t.danger, fontSize: 13, marginBottom: 10, textAlign: 'center' },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: t.textFaint,
    backgroundColor: t.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxOn: {
    backgroundColor: t.success,
    borderColor: t.success,
  },
  checkboxLabel: {
    flex: 1,
    color: t.textMuted,
    fontSize: 12.5,
    lineHeight: 18,
  },
  checkboxLabelStrong: { color: t.text, fontWeight: '700' },
  primaryBtn: {
    backgroundColor: t.accent, paddingVertical: 14, borderRadius: 999, alignItems: 'center',
    minHeight: 52, justifyContent: 'center', marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: t.primaryText, fontSize: 14, fontWeight: '700', letterSpacing: 0.4 },
  forgotLink: { paddingVertical: 14, alignItems: 'center' },
  forgotLinkText: { color: t.accent, fontSize: 13, fontWeight: '600' },
  modeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    flexWrap: 'wrap', paddingTop: 4,
  },
  modeText: { color: t.textMuted, fontSize: 13 },
  modeAccent: { color: t.accent, fontSize: 13, fontWeight: '700' },
  terms: {
    color: t.textMuted, fontSize: 12, textAlign: 'center',
    lineHeight: 18, marginTop: 28, paddingHorizontal: 8,
  },
  termsLink: { color: t.text, fontWeight: '600', textDecorationLine: 'underline' },
});
