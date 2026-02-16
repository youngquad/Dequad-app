import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleLogin = async () => {
    setIsSigningIn(true);
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#0F172A']}
        style={styles.gradient}
        locations={[0, 0.5, 1]}
      >
        {/* Decorative elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

        {/* Back Button */}
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#F8FAFC" />
        </Pressable>

        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <LinearGradient
                colors={['rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.1)']}
                style={styles.iconCircle}
              >
                <Ionicons name="school" size={52} color="#818CF8" />
              </LinearGradient>
            </Animated.View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your wellbeing journey
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            {/* Google Sign In Button */}
            <Pressable
              onPressIn={() => {
                Animated.spring(buttonScale, {
                  toValue: 0.96,
                  useNativeDriver: true,
                }).start();
              }}
              onPressOut={() => {
                Animated.spring(buttonScale, {
                  toValue: 1,
                  useNativeDriver: true,
                }).start();
              }}
              onPress={handleLogin}
              disabled={isSigningIn || isLoading}
            >
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.googleButton}
                >
                  {isSigningIn || isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="logo-google" size={22} color="#fff" />
                      <Text style={styles.googleButtonText}>
                        Continue with Google
                      </Text>
                      <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </>
                  )}
                </LinearGradient>
              </Animated.View>
            </Pressable>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>University Email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Info Cards */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="shield-checkmark" size={22} color="#10B981" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Safe & Secure</Text>
                <Text style={styles.infoDescription}>
                  Your data is protected with enterprise-grade security
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="lock-closed" size={22} color="#6366F1" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Privacy First</Text>
                <Text style={styles.infoDescription}>
                  End-to-end encryption for all your conversations
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="people" size={22} color="#EC4899" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Student Community</Text>
                <Text style={styles.infoDescription}>
                  Connect with verified university students only
                </Text>
              </View>
            </View>
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </Animated.View>
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
    paddingTop: 100,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 280,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 24,
    minHeight: 56,
    gap: 10,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
  },
  dividerText: {
    color: '#64748B',
    fontSize: 13,
    marginHorizontal: 14,
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.08)',
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 3,
  },
  infoDescription: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  adminLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 12,
    gap: 8,
  },
  adminLinkText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '600',
  },
  terms: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
