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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/services/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendResetEmail = async () => {
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });
      
      setEmailSent(true);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      // Still show success to prevent email enumeration
      setEmailSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Ionicons name="arrow-back" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Ionicons name="mail" size={48} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successMessage}>
              If an admin account exists with the email{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
              {'\n'}you will receive a password reset link shortly.
            </Text>
            
            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsTitle}>Next Steps:</Text>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>1</Text>
                <Text style={styles.instructionText}>Check your inbox (and spam folder)</Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>2</Text>
                <Text style={styles.instructionText}>Click the reset link in the email</Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>3</Text>
                <Text style={styles.instructionText}>Create a new password</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => router.replace('/admin/login')}
            >
              <Ionicons name="arrow-back" size={20} color="#6366F1" />
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => {
                setEmailSent(false);
                setEmail('');
              }}
            >
              <Text style={styles.resendText}>Try a different email</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Ionicons name="arrow-back" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="key" size={48} color="#6366F1" />
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              No worries! Enter your admin email address and we'll send you a link to reset your password.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your admin email"
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
              onPress={handleSendResetEmail}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#fff" />
                  <Text style={styles.resetButtonText}>Send Reset Link</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={goBack}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#6366F1" />
            <Text style={styles.infoText}>
              The reset link will expire in 1 hour for security reasons.
            </Text>
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
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
    paddingHorizontal: 20,
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
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 'auto',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#9CA3AF',
    marginLeft: 12,
    lineHeight: 18,
  },
  // Success state styles
  successContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emailHighlight: {
    color: '#6366F1',
    fontWeight: '600',
  },
  instructionsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 32,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#D1D5DB',
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  resendButton: {
    paddingVertical: 12,
  },
  resendText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
