import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';

const DEQUAD_LOGO = 'https://customer-assets.emergentagent.com/job_59531f5e-1846-4934-b8bd-d1cc6c47e021/artifacts/7klvdvmk_1C1CFF62-AD62-45CE-B2AC-A8639289ED95.png';

interface PricingInfo {
  price: number;
  currency: string;
  currency_symbol: string;
  formatted_price: string;
  features: string[];
}

export default function UniversitySubscribePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [pricing, setPricing] = useState<PricingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form fields
  const [universityName, setUniversityName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [expectedStudents, setExpectedStudents] = useState('');
  
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || Constants.expoConfig?.extra?.backendUrl || '';
  
  useEffect(() => {
    loadPricing();
  }, []);
  
  const loadPricing = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/university/pricing`);
      const data = await response.json();
      setPricing(data);
    } catch (err) {
      console.error('Error loading pricing:', err);
    }
  };
  
  const handleSubscribe = async () => {
    // Validation
    if (!universityName.trim()) {
      setError('Please enter your university name');
      return;
    }
    if (!adminEmail.trim() || !adminEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!adminName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${backendUrl}/api/university/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          university_name: universityName.trim(),
          admin_email: adminEmail.trim().toLowerCase(),
          admin_name: adminName.trim(),
          contact_phone: contactPhone.trim() || null,
          expected_students: expectedStudents ? parseInt(expectedStudents) : null,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Subscription failed');
      }
      
      // Redirect to Stripe checkout
      if (data.checkout_url) {
        if (Platform.OS === 'web') {
          window.location.href = data.checkout_url;
        } else {
          Linking.openURL(data.checkout_url);
        }
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      setError(err.message || 'Failed to start subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1E293B', '#0F172A', '#1E293B']}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            
            <Image 
              source={{ uri: DEQUAD_LOGO }} 
              style={styles.logo}
              resizeMode="contain"
            />
            
            <Text style={styles.title}>University Dashboard</Text>
            <Text style={styles.subtitle}>
              Monitor your students' wellbeing with powerful analytics
            </Text>
          </View>
          
          {/* Pricing Card */}
          {pricing && (
            <View style={styles.pricingCard}>
              <View style={styles.priceRow}>
                <Text style={styles.priceAmount}>
                  {pricing.currency_symbol}{pricing.price}
                </Text>
                <Text style={styles.priceInterval}>/month</Text>
              </View>
              
              <View style={styles.featuresContainer}>
                {pricing.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Subscription Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Get Started</Text>
            <Text style={styles.formSubtitle}>
              Fill in your details to subscribe and get instant access
            </Text>
            
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>University Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., University of Lagos"
                placeholderTextColor="#64748B"
                value={universityName}
                onChangeText={setUniversityName}
                autoCapitalize="words"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Admin Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="admin@university.edu"
                placeholderTextColor="#64748B"
                value={adminEmail}
                onChangeText={setAdminEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor="#64748B"
                value={adminName}
                onChangeText={setAdminName}
                autoCapitalize="words"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contact Phone (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="+44 123 456 7890"
                placeholderTextColor="#64748B"
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Expected Students (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 5000"
                placeholderTextColor="#64748B"
                value={expectedStudents}
                onChangeText={setExpectedStudents}
                keyboardType="number-pad"
              />
            </View>
            
            <TouchableOpacity
              style={[styles.subscribeButton, isLoading && styles.subscribeButtonDisabled]}
              onPress={handleSubscribe}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="card" size={20} color="#fff" />
                  <Text style={styles.subscribeButtonText}>
                    Subscribe - {pricing?.formatted_price || '£49.99/month'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            
            <Text style={styles.secureText}>
              <Ionicons name="lock-closed" size={14} color="#64748B" /> Secure payment via Stripe
            </Text>
          </View>
          
          {/* FAQ Section */}
          <View style={styles.faqSection}>
            <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How does it work?</Text>
              <Text style={styles.faqAnswer}>
                After subscribing, you'll receive admin credentials to access your university's dedicated dashboard. Students from your university who sign up will automatically appear in your dashboard.
              </Text>
            </View>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
              <Text style={styles.faqAnswer}>
                Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period.
              </Text>
            </View>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Is student data secure?</Text>
              <Text style={styles.faqAnswer}>
                Absolutely. All data is encrypted and we follow strict data protection guidelines. You can only see aggregated analytics and safeguarding alerts - no private conversations.
              </Text>
            </View>
          </View>
          
          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already subscribed?{' '}
              <Text 
                style={styles.footerLink}
                onPress={() => router.push('/(auth)/university-admin-login')}
              >
                Log in here
              </Text>
            </Text>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 300,
  },
  pricingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 20,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: '#6366F1',
  },
  priceInterval: {
    fontSize: 18,
    color: '#94A3B8',
    marginLeft: 4,
  },
  featuresContainer: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#E2E8F0',
    flex: 1,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  subscribeButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 10,
    marginTop: 8,
  },
  subscribeButtonDisabled: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  secureText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 13,
    marginTop: 12,
  },
  faqSection: {
    marginBottom: 24,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  footerLink: {
    color: '#6366F1',
    fontWeight: '600',
  },
});
