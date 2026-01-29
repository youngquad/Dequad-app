import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';

export default function MainLayout() {
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#1F2937',
          borderTopColor: '#374151',
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#9CA3AF',
        headerStyle: {
          backgroundColor: '#1F2937',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="mood"
        options={{
          title: 'Mood',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="happy-outline" size={size} color={color} />
          ),
          headerTitle: 'Track Your Mood',
        }}
      />
      <Tabs.Screen
        name="feedback"
        options={{
          title: 'Feedback',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbox-outline" size={size} color={color} />
          ),
          headerTitle: 'Lecture Feedback',
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Connect',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
          headerTitle: 'Find Study Partners',
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          headerTitle: 'My Profile',
        }}
      />
    </Tabs>
  );
}
