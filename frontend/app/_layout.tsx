import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function RootLayoutNav() {
  const { isLoading, isAuthenticated, user } = useAuth();

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
