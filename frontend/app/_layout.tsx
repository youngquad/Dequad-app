import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function useProtectedRoute(isAuthenticated: boolean, isLoading: boolean, userRole?: string) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inMainGroup = segments[0] === '(main)';
    const inAdminGroup = segments[0] === '(admin)';
    const inUniversityAdminGroup = segments[0] === '(university-admin)';
    const isAdminLogin = inAdminGroup && segments[1] === 'login';
    const isAdminDashboard =
      inAdminGroup && (segments[1] === 'dashboard' || segments[1] === 'university-dashboard');
    const isLandingPage = segments.length === 0 || segments[0] === 'index';

    // ALWAYS allow admin login page - for both authenticated and non-authenticated users
    if (isAdminLogin) {
      return; // Don't redirect, allow access
    }

    if (!isAuthenticated) {
      // If user is not authenticated and trying to access protected routes
      if (inMainGroup || isAdminDashboard) {
        router.replace('/');
      }
    } else {
      // If user is authenticated
      if (isLandingPage || inAuthGroup) {
        // Redirect to appropriate screen based on role
        if (userRole === 'admin') {
          router.replace('/(admin)/dashboard');
        } else {
          router.replace('/(main)/mood');
        }
      }
      // Admin dashboard protection - only admins can access dashboard
      if (isAdminDashboard && userRole !== 'admin') {
        router.replace('/(main)/mood');
      }
      // The (university-admin) login flow never calls this AuthContext's
      // setUser/setSessionToken and stores its token under its own storage
      // key (see app/(auth)/university-admin-login.tsx), so `isAuthenticated`
      // here stays false for someone who only used that flow — this branch
      // only catches a different role (student or platform admin, already
      // authenticated through the normal flow) wandering into this group.
      if (inUniversityAdminGroup && userRole !== 'university_admin') {
        router.replace('/(main)/mood');
      }
    }
  }, [isAuthenticated, isLoading, segments, userRole]);
}

function RootLayoutNav() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const { theme: t, isDark } = useTheme();

  // Apply route protection
  useProtectedRoute(isAuthenticated, isLoading, user?.role);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: t.bg }]}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: t.headerBg,
          },
          headerTintColor: t.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: t.bg,
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="privacy" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="terms" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="contact" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="(auth)" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="(main)" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="(admin)" 
          options={{ headerShown: false }} 
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
