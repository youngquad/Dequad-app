import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DequadLogo } from '../../src/components/DequadLogo';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithEmail, registerWithEmail, isLoading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailErr, setEmailErr] = useState<string | null>(null);

  // Animations — exact behaviour from the previous polished template.
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleGoogle = async () => {
    setIsSigningIn(true);
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
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
    setIsSigningIn(true);
    try {
      if (mode === 'signin') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name || undefined);
      }
      router.replace('/(main)/mood');
    } catch (err: any) {
      const msg = err?.message || (mode === 'signin' ? 'Sign-in failed.' : 'Sign-up failed.');
      setEmailErr(msg.replace(/^Error:\s*/, ''));
    } finally {
      setIsSigningIn(false);
    }
  };

  const busy = isSigningIn || isLoading;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#0F172A']}
        style={styles.gradient}
        locations={[0, 0.5, 1]}
      >
        {/* Decorative blur circles */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

        {/* Back Button */}
        <Pressable style={styles.backButton} onPress={() => router.back()} data-testid="login-back">
          <Ionicons name="arrow-back" size={22} color="#F8FAFC" />
        </Pressable>

        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Logo + Heading */}
          <View style={styles.logoContainer}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <View style={styles.logoGlow}>
                <DequadLogo size={92} />
              </View>
            </Animated.View>
            <Text style={styles.title} data-testid="login-title">
              {mode === 'signin' ? 'Welcome Back' : 'Join DEQUAD'}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'signin'
                ? 'Sign in to continue your wellbeing journey'
                : 'Create an account to connect with verified students'}
            </Text>
          </View>

          {/* Auth Card */}
          <View style={styles.formContainer}>
            {/* Google Sign In */}
            <Pressable
              onPressIn={() => Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start()}
              onPressOut={() => Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start()}
              onPress={handleGoogle}
              disabled={busy}
              data-testid="login-google"
            >
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.googleButton}
                >
                  {busy ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="logo-google" size={22} color="#fff" />
                      <Text style={styles.googleButtonText}>Continue with Google</Text>
                      <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </>
                  )}
                </LinearGradient>
              </Animated.View>
            </Pressable>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or use email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email / password form */}
            <View style={styles.emailForm}>
              {mode === 'signup' && (
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={18} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name (optional)"
                    placeholderTextColor="#64748B"
                    style={styles.input}
                    data-testid="auth-name-input"
                    autoCapitalize="words"
                  />
                </View>
              )}
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
                  data-testid="auth-email-input"
                />
              </View>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder={mode === 'signup' ? 'Create a password (8+ characters)' : 'Password'}
                  placeholderTextColor="#64748B"
                  style={styles.input}
                  secureTextEntry
                  data-testid="auth-password-input"
                />
              </View>

              {emailErr ? (
                <Text style={styles.errorText} data-testid="auth-error">{emailErr}</Text>
              ) : null}

              <TouchableOpacity
                onPress={handleEmailSubmit}
                disabled={busy}
                style={[styles.emailSubmit, busy && styles.emailSubmitDisabled]}
                data-testid="auth-submit"
              >
                <Text style={styles.emailSubmitText}>
                  {busy ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              {/* Forgot password — only in sign-in mode */}
              {mode === 'signin' && (
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/forgot-password')}
                  style={styles.forgotLink}
                  data-testid="auth-forgot-password"
                >
                  <Text style={styles.forgotLinkText}>Forgot your password?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setEmailErr(null); }}
                style={styles.modeToggle}
                data-testid="auth-mode-toggle"
              >
                <Text style={styles.modeToggleText}>
                  {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                  <Text style={styles.modeToggleAccent}>
                    {mode === 'signin' ? 'Sign up' : 'Sign in'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Admin Access Link */}
          <TouchableOpacity
            style={styles.adminLink}
            onPress={() => router.push('/(admin)/login')}
            data-testid="login-admin-link"
          >
            <Ionicons name="shield" size={15} color="#F59E0B" />
            <Text style={styles.adminLinkText}>Admin Access</Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  gradient: { flex: 1 },
  decorativeCircle1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: 100,
    left: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 90,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logoGlow: {
    width: 108,
    height: 108,
    borderRadius: 32,
    backgroundColor: 'rgba(122, 179, 224, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(122, 179, 224, 0.18)',
  },
  title: { fontSize: 30, fontWeight: '800', color: '#F8FAFC', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#94A3B8', textAlign: 'center', maxWidth: 300 },
  formContainer: { flex: 1, justifyContent: 'center' },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    minHeight: 56,
    gap: 10,
  },
  googleButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1, textAlign: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(148, 163, 184, 0.15)' },
  dividerText: { color: '#64748B', fontSize: 12, marginHorizontal: 14, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.6 },
  emailForm: { marginTop: 0 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    marginBottom: 12,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: '#F1F5F9',
    fontSize: 15,
  },
  errorText: { color: '#F87171', fontSize: 13, marginBottom: 10, textAlign: 'center' },
  emailSubmit: {
    backgroundColor: '#6366F1',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
    minHeight: 52,
    justifyContent: 'center',
  },
  emailSubmitDisabled: { opacity: 0.6 },
  emailSubmitText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  forgotLink: { paddingVertical: 12, alignItems: 'center' },
  forgotLinkText: { color: '#818CF8', fontSize: 13, fontWeight: '500' },
  modeToggle: { paddingVertical: 8, alignItems: 'center' },
  modeToggleText: { color: '#94A3B8', fontSize: 13 },
  modeToggleAccent: { color: '#818CF8', fontWeight: '700' },
  adminLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 8,
    gap: 8,
  },
  adminLinkText: { color: '#F59E0B', fontSize: 14, fontWeight: '600' },
  terms: { color: '#64748B', fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
