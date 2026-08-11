import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Animated,
  Pressable,
  Image,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const DEQUAD_LOGO = 'https://customer-assets.emergentagent.com/job_59531f5e-1846-4934-b8bd-d1cc6c47e021/artifacts/7klvdvmk_1C1CFF62-AD62-45CE-B2AC-A8639289ED95.png';
const DEQUAD_LOGO_TRANSPARENT = require('../assets/images/dequad-logo-transparent.png');

export default function LandingScreen() {
  const router = useRouter();
  const { isLoading } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const floatA = useRef(new Animated.Value(0)).current;
  const floatB = useRef(new Animated.Value(0)).current;
  const floatC = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 24, friction: 7 }),
    ]).start();

    const drift = (val: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ).start();
    drift(floatA, 5200);
    drift(floatB, 6800);
    drift(floatC, 4300);
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true, speed: 50 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
        <View style={styles.loadingContent}>
          <Image source={{ uri: DEQUAD_LOGO }} style={styles.loadingLogoImage} resizeMode="contain" />
          <ActivityIndicator size="large" color="#5B9BD5" style={{ marginTop: 20 }} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0B1F33', '#0F2942', '#123253']}
        style={styles.gradient}
        locations={[0, 0.55, 1]}
      >
        {/* 3D floating spheres */}
        <Animated.View
          style={[
            styles.sphereWrap,
            styles.sphere1Pos,
            { transform: [{ translateY: floatA.interpolate({ inputRange: [0, 1], outputRange: [0, 26] }) }] },
          ]}
        >
          <LinearGradient colors={['#6FB6E8', '#2E5F8A']} start={{ x: 0.2, y: 0.15 }} end={{ x: 0.9, y: 1 }} style={styles.sphere1} />
        </Animated.View>
        <Animated.View
          style={[
            styles.sphereWrap,
            styles.sphere2Pos,
            { transform: [{ translateY: floatB.interpolate({ inputRange: [0, 1], outputRange: [0, -32] }) }] },
          ]}
        >
          <LinearGradient colors={['#7FD8BE', '#2E7A63']} start={{ x: 0.25, y: 0.2 }} end={{ x: 1, y: 1 }} style={styles.sphere2} />
        </Animated.View>
        <Animated.View
          style={[
            styles.sphereWrap,
            styles.sphere3Pos,
            { transform: [{ translateY: floatC.interpolate({ inputRange: [0, 1], outputRange: [0, 18] }) }] },
          ]}
        >
          <LinearGradient colors={['#A9C8E8', '#4A7CAB']} start={{ x: 0.3, y: 0.1 }} end={{ x: 0.9, y: 1 }} style={styles.sphere3} />
        </Animated.View>
        <View style={styles.glowRing} />

        <Animated.View
          style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoGlow}>
              <Image source={DEQUAD_LOGO_TRANSPARENT} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.wordmark}>DEQUAD</Text>
            <Text style={styles.subtitle}>Your wellbeing companion for university life</Text>
          </View>

          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => router.push('/(auth)/login' as any)}
            data-testid="get-started-btn"
          >
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <LinearGradient
                colors={['#5B9BD5', '#4A90C2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaButton}
              >
                <Text style={styles.ctaText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F2942' },
  gradient: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  loadingContent: { alignItems: 'center' },
  loadingLogoImage: { width: 120, height: 120 },
  loadingText: { color: '#94A3B8', fontSize: 16, marginTop: 16, fontWeight: '500' },
  sphereWrap: { position: 'absolute' },
  sphere1Pos: { top: -60, right: -70 },
  sphere1: {
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.55,
  },
  sphere2Pos: { bottom: height * 0.16, left: -90 },
  sphere2: {
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.4,
  },
  sphere3Pos: { top: height * 0.38, right: -40 },
  sphere3: {
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.45,
  },
  glowRing: {
    position: 'absolute',
    top: height * 0.14,
    alignSelf: 'center',
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: width * 0.425,
    borderWidth: 1,
    borderColor: 'rgba(127, 216, 190, 0.18)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    gap: 64,
  },
  logoContainer: { alignItems: 'center' },
  logoGlow: {
    padding: 18,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#5B9BD5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 16,
  },
  logoImage: { width: 130, height: 130 },
  wordmark: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 8,
    marginTop: 22,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 23,
    marginTop: 10,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    paddingHorizontal: 24,
    borderRadius: 999,
    gap: 10,
    shadowColor: '#5B9BD5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
  },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
