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
import { api } from '../../src/services/api';
import { DequadLogo } from '../../src/components/DequadLogo';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

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
      setSent(true); // generic response prevents enumeration
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Pressable style={styles.backButton} onPress={() => router.back()} data-testid="forgot-back">
            <Ionicons name="arrow-back" size={20} color="#0F2942" />
          </Pressable>

          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.brandRow}>
              <DequadLogo size={48} />
              <Text style={styles.brandWordmark}>DEQUAD</Text>
            </View>

            <Text style={styles.kicker}>{sent ? 'CHECK YOUR INBOX' : 'PASSWORD HELP'}</Text>
            <Text style={styles.title} data-testid="forgot-title">
              {sent ? "We've sent you a link." : 'Forgot your password?'}
            </Text>
            <Text style={styles.lede}>
              {sent
                ? `If an account exists for ${email.toLowerCase()}, a reset link is on its way. It expires in 1 hour.`
                : "Enter the email tied to your DEQUAD account and we'll send you a reset link."}
            </Text>

            <View style={styles.card}>
              {!sent ? (
                <>
                  <View style={styles.inputWrap}>
                    <Ionicons name="mail-outline" size={18} color="#4F6076" style={styles.inputIcon} />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Email address"
                      placeholderTextColor="#94A3B0"
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
                    style={[styles.primaryBtn, loading && styles.btnDisabled]}
                    data-testid="forgot-submit"
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryBtnText}>Send reset link</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.replace('/(auth)/login')}
                    style={styles.backLink}
                    data-testid="forgot-back-to-login"
                  >
                    <Ionicons name="arrow-back" size={14} color="#4F6076" />
                    <Text style={styles.backLinkText}>Back to sign in</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.instructions}>
                    {[
                      'Check your inbox (and spam folder)',
                      'Click the reset link in the email',
                      'Create a new password (8+ chars)',
                    ].map((t, i) => (
                      <View key={t} style={styles.instructionRow}>
                        <View style={styles.bullet}><Text style={styles.bulletText}>{i + 1}</Text></View>
                        <Text style={styles.instructionText}>{t}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    onPress={() => router.replace('/(auth)/login')}
                    style={styles.primaryBtn}
                    data-testid="forgot-back-to-login"
                  >
                    <Text style={styles.primaryBtnText}>Back to sign in</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => { setSent(false); setEmail(''); }}
                    style={styles.backLink}
                    data-testid="forgot-try-again"
                  >
                    <Text style={styles.backLinkText}>Try a different email</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </Animated.View>
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
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: '#DDE8F2',
    shadowColor: '#0F2942', shadowOpacity: 0.05, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 2,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6FAFE',
    borderRadius: 14, paddingHorizontal: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#DDE8F2',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, color: '#0F2942', fontSize: 15 },
  errorText: { color: '#B91C1C', fontSize: 13, marginBottom: 10, textAlign: 'center' },
  primaryBtn: {
    backgroundColor: '#5B9BD5', paddingVertical: 14, borderRadius: 999, alignItems: 'center',
    minHeight: 52, justifyContent: 'center', marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', letterSpacing: 0.4 },
  backLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14 },
  backLinkText: { color: '#4F6076', fontSize: 13, fontWeight: '500' },
  instructions: { marginBottom: 20 },
  instructionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  bullet: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: '#4FB89F',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  bulletText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  instructionText: { color: '#0F2942', fontSize: 14, flex: 1 },
});
