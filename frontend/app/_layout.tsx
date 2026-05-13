import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function useProtectedRoute(isAuthenticated: boolean, isLoading: boolean, userRole?: string) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inMainGroup = segments[0] === '(main)';
    const inAdminGroup = segments[0] === '(admin)';
    const isAdminLogin = inAdminGroup && segments[1] === 'login';
    const isAdminDashboard = inAdminGroup && segments[1] === 'dashboard';
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
      if (isLandingPage) {
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
    }
  }, [isAuthenticated, isLoading, segments, userRole]);
}

function RootLayoutNav() {
  const { isLoading, isAuthenticated, user } = useAuth();

  // Apply route protection
  useProtectedRoute(isAuthenticated, isLoading, user?.role);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1F2937',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#111827',
          },
        }}
      >
        <Stack.Screen 
          name="index" 
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
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
});
