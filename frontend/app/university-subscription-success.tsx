import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';

const DEQUAD_LOGO = 'https://customer-assets.emergentagent.com/job_59531f5e-1846-4934-b8bd-d1cc6c47e021/artifacts/7klvdvmk_1C1CFF62-AD62-45CE-B2AC-A8639289ED95.png';

interface SubscriptionResult {
  success: boolean;
  message: string;
  university?: string;
  admin_email?: string;
  temp_password?: string;
}

export default function UniversitySubscriptionSuccessPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<SubscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const backendUrl = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL || '';
  
  useEffect(() => {
    completeSubscription();
  }, []);
  
  const completeSubscription = async () => {
    const pendingId = params.pending_id as string;
    const sessionId = params.session_id as string;
    
    if (!pendingId || !sessionId) {
      setError('Invalid subscription link. Please contact support.');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch(
        `${backendUrl}/api/university/subscription-success?pending_id=${pendingId}&session_id=${sessionId}`
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to complete subscription');
      }
      
      setResult(data);
    } catch (err: any) {
      console.error('Subscription completion error:', err);
      setError(err.message || 'Failed to complete subscription. Please contact support.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.gradient}>
          <View style={styles.loadingContent}>
            <Image source={{ uri: DEQUAD_LOGO }} style={styles.logo} resizeMode="contain" />
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Activating your subscription...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.gradient}>
          <View style={styles.content}>
            <View style={styles.errorIcon}>
              <Ionicons name="close-circle" size={64} color="#EF4444" />
            </View>
            <Text style={styles.errorTitle}>Subscription Error</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => router.push('/(auth)/university-subscribe')}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.gradient}>
        <View style={styles.content}>
          {/* Success Icon */}
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          </View>
          
          <Text style={styles.successTitle}>Welcome to DEQUAD!</Text>
          <Text style={styles.successSubtitle}>
            Your university dashboard is ready
          </Text>
          
          {/* Account Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Your Admin Credentials</Text>
            
            <View style={styles.infoRow}>
              <Ionicons name="school" size={20} color="#6366F1" />
              <Text style={styles.infoLabel}>University:</Text>
              <Text style={styles.infoValue}>{result?.university}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={20} color="#6366F1" />
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{result?.admin_email}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="key" size={20} color="#6366F1" />
              <Text style={styles.infoLabel}>Password:</Text>
              <TouchableOpacity 
                style={styles.passwordContainer}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.infoValue}>
                  {showPassword ? result?.temp_password : '••••••••••'}
                </Text>
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={18} 
                  color="#64748B" 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={20} color="#F59E0B" />
              <Text style={styles.warningText}>
                Please save your password now! You won't be able to see it again.
              </Text>
            </View>
          </View>
          
          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/university-admin-login')}
            data-testid="go-to-login-btn"
          >
            <Ionicons name="log-in" size={20} color="#fff" />
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
          
          {/* Help Text */}
          <Text style={styles.helpText}>
            Need help? Contact support@dequad.com
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  gradient: {
    flex: 1,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 16,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    minWidth: 80,
  },
  infoValue: {
    fontSize: 15,
    color: '#E5E7EB',
    flex: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#F59E0B',
    lineHeight: 18,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 10,
    width: '100%',
    maxWidth: 400,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  helpText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 20,
  },
  errorIcon: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 300,
  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
