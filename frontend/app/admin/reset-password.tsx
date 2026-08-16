import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/services/api';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    if (!token) {
      setIsVerifying(false);
      setTokenValid(false);
      return;
    }

    try {
      const response = await api.get(`/auth/verify-reset-token?token=${token}`);
      setTokenValid(response.valid);
      setUserEmail(response.email || '');
    } catch (error) {
      console.error('Token verification error:', error);
      setTokenValid(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Required', 'Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token: token,
        new_password: newPassword,
      });
      
      setResetSuccess(true);
    } catch (error: any) {
      console.error('Reset password error:', error);
      const message = error?.response?.data?.detail || 'Failed to reset password. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    router.replace('/admin/login');
  };

  // Loading state
  if (isVerifying) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Verifying reset link...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="close-circle" size={64} color="#EF4444" />
          </View>
          <Text style={styles.errorTitle}>Invalid or Expired Link</Text>
          <Text style={styles.errorMessage}>
            This password reset link is invalid or has expired.{'\n'}
            Please request a new reset link.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/admin/forgot-password')}>
            <Text style={styles.primaryButtonText}>Request New Link</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={goToLogin}>
            <Text style={styles.secondaryButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Success state
  if (resetSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={64} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>Password Reset!</Text>
          <Text style={styles.successMessage}>
            Your password has been successfully reset.{'\n'}
            You can now login with your new password.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={goToLogin}>
            <Ionicons name="log-in-outline" size={24} color="#fff" />
            <Text style={styles.primaryButtonText}>Login Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Reset form state
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-open" size={48} color="#10B981" />
            </View>
            <Text style={styles.title}>Create New Password</Text>
            <Text style={styles.subtitle}>
              Enter a new password for{'\n'}
              <Text style={styles.emailHighlight}>{userEmail}</Text>
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor="#6B7280"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.hint}>Minimum 6 characters</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor="#6B7280"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword && newPassword !== confirmPassword && (
                <Text style={styles.errorHint}>Passwords do not match</Text>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <Text style={styles.successHint}>Passwords match ✓</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  <Text style={styles.resetButtonText}>Reset Password</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={goToLogin}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    color: '#6366F1',
    fontWeight: '600',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    color: '#fff',
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  errorHint: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 8,
  },
  successHint: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  resetButtonDisabled: {
    backgroundColor: '#4B5563',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  // Error state styles
  errorIconContainer: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  // Success state styles
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  // Buttons
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
    width: '100%',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
