import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DequadLogo } from '../../src/components/DequadLogo';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { setAdminSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAdminLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter email and password');
      return;
    }

    setIsLoading(true);
    try {
      const authResponse = await api.post('/auth/admin-login', {
        email: email.trim().toLowerCase(),
        password: password.trim(),
        admin_code: adminCode.trim() || null,
      });

      if (authResponse.error) {
        Alert.alert('Access Denied', authResponse.error);
        return;
      }
      if (!authResponse.is_admin) {
        Alert.alert('Access Denied', 'This account does not have admin privileges.');
        return;
      }

      const token = authResponse.session_token;
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('session_token', token);
        window.localStorage.setItem('admin_session_token', token);
      }
      await AsyncStorage.setItem('session_token', token);
      await AsyncStorage.setItem('admin_session_token', token);
      await api.setToken(token);
      if (setAdminSession) setAdminSession(token, authResponse.user);
      await new Promise((resolve) => setTimeout(resolve, 250));
      router.replace('/(admin)/dashboard');
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.message || 'Login failed. Please check your credentials.';
      Alert.alert('Login Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable style={styles.backButton} onPress={() => router.back()} data-testid="admin-login-back">
            <Ionicons name="arrow-back" size={20} color="#0F2942" />
          </Pressable>

          <View style={styles.content}>
            <View style={styles.brandRow}>
              <DequadLogo size={48} />
              <Text style={styles.brandWordmark}>DEQUAD</Text>
            </View>

            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={13} color="#7A5A00" />
              <Text style={styles.adminBadgeText}>ADMIN PORTAL</Text>
            </View>

            <Text style={styles.title} data-testid="admin-login-title">Staff sign-in.</Text>
            <Text style={styles.lede}>
              Restricted to authorised DEQUAD staff. All actions in the admin dashboard are logged for safeguarding and audit.
            </Text>

            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={18} color="#4F6076" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="admin@dequad.com"
                    placeholderTextColor="#94A3B0"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    data-testid="admin-email-input"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color="#4F6076" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#94A3B0"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    data-testid="admin-password-input"
                  />
                  <TouchableOpacity onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#4F6076" />
                  </TouchableOpacity>
                </View>
              </View>

              {showAdvanced ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Admin code (first-time setup)</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="key-outline" size={18} color="#4F6076" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="One-time admin code"
                      placeholderTextColor="#94A3B0"
                      value={adminCode}
                      onChangeText={setAdminCode}
                      autoCapitalize="none"
                      data-testid="admin-code-input"
                    />
                  </View>
                  <Text style={styles.hint}>
                    Only needed when activating admin access for a new @dequad.com account.
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowAdvanced(true)}
                  style={styles.advancedToggle}
                  data-testid="admin-advanced-toggle"
                >
                  <Ionicons name="settings-outline" size={14} color="#4F6076" />
                  <Text style={styles.advancedToggleText}>First-time setup? Enter admin code</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
                onPress={handleAdminLogin}
                disabled={isLoading}
                data-testid="admin-login-submit"
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Access dashboard</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.forgotLink}
                onPress={() => router.push('/(admin)/forgot-password')}
                data-testid="admin-forgot-password"
              >
                <Text style={styles.forgotLinkText}>Forgot your password?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.notice}>
              <Ionicons name="information-circle-outline" size={16} color="#4F6076" />
              <Text style={styles.noticeText}>
                Not a staff member? <Text style={styles.noticeLink} onPress={() => router.replace('/(auth)/login')}>Return to student sign-in</Text>.
              </Text>
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
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  brandWordmark: { color: '#0F2942', fontWeight: '800', fontSize: 13, letterSpacing: 2.4 },
  adminBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FEF3C7', borderColor: '#FCD34D', borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
    alignSelf: 'flex-start', marginBottom: 14,
  },
  adminBadgeText: { color: '#7A5A00', fontSize: 11, fontWeight: '800', letterSpacing: 1.6 },
  title: {
    color: '#0F2942', fontSize: 36, fontWeight: '700',
    fontFamily: 'Playfair Display, Georgia, serif',
    lineHeight: 42, marginBottom: 14, letterSpacing: -0.5,
  },
  lede: { color: '#4F6076', fontSize: 15, lineHeight: 23, marginBottom: 28 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: '#DDE8F2',
    shadowColor: '#0F2942', shadowOpacity: 0.05, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 2,
  },
  inputGroup: { marginBottom: 16 },
  label: { color: '#0F2942', fontSize: 13, fontWeight: '700', marginBottom: 8, letterSpacing: 0.3 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6FAFE',
    borderRadius: 14, paddingHorizontal: 14,
    borderWidth: 1, borderColor: '#DDE8F2',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, color: '#0F2942', fontSize: 15 },
  hint: { color: '#4F6076', fontSize: 12, marginTop: 6, lineHeight: 17 },
  advancedToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 8, marginBottom: 12,
  },
  advancedToggleText: { color: '#4F6076', fontSize: 12, fontWeight: '500' },
  primaryBtn: {
    backgroundColor: '#0F2942', paddingVertical: 14, borderRadius: 999, alignItems: 'center',
    minHeight: 52, justifyContent: 'center', marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', letterSpacing: 0.4 },
  forgotLink: { paddingVertical: 14, alignItems: 'center' },
  forgotLinkText: { color: '#5B9BD5', fontSize: 13, fontWeight: '600' },
  notice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#EDF4FB', borderRadius: 14, padding: 14, marginTop: 20,
    borderWidth: 1, borderColor: '#DDE8F2',
  },
  noticeText: { flex: 1, color: '#4F6076', fontSize: 13, lineHeight: 19 },
  noticeLink: { color: '#0F2942', fontWeight: '700', textDecorationLine: 'underline' },
});
