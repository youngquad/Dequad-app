import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/services/api';

// Custom Tab Bar Icon with indicator + optional unread badge
function TabIcon({
  name,
  focused,
  color,
  badgeCount,
}: { name: string; focused: boolean; color: string; badgeCount?: number }) {
  return (
    <View style={styles.tabIconContainer}>
      {focused && <View style={[styles.activeIndicator, { backgroundColor: color }]} />}
      <Ionicons name={name as any} size={24} color={color} />
      {badgeCount && badgeCount > 0 ? (
        <View style={styles.tabUnreadDot}>
          <Text style={styles.tabUnreadText}>
            {badgeCount > 9 ? '9+' : badgeCount}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function MainLayout() {
  const { sessionToken } = useAuth();
  const [chatUnread, setChatUnread] = useState(0);

  // Poll the unread chat count so the Chat tab badge updates even while the
  // user is on another tab. Cheap aggregation on the new pair_id index.
  useEffect(() => {
    if (!sessionToken) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        const r = await api.get('/chat/unread-count', sessionToken);
        if (!cancelled) setChatUnread(r?.unread ?? 0);
      } catch {}
    };
    refresh();
    const id = setInterval(refresh, 20_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [sessionToken]);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#64748B',
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        headerStyle: styles.header,
        headerTintColor: '#F8FAFC',
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="mood"
        options={{
          title: 'Mood',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'heart' : 'heart-outline'} focused={focused} color={color} />
          ),
          headerTitle: 'Mood Tracker',
        }}
      />
      <Tabs.Screen
        name="feedback"
        options={{
          title: 'Feedback',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'chatbox' : 'chatbox-outline'} focused={focused} color={color} />
          ),
          headerTitle: 'Lecture Feedback',
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Connect',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'people' : 'people-outline'} focused={focused} color={color} />
          ),
          headerTitle: 'Find Friends',
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              focused={focused}
              color={color}
              badgeCount={chatUnread}
            />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} color={color} />
          ),
          headerTitle: 'My Profile',
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{
          href: null, // Hide from tab bar - accessible from Profile
        }}
      />
      <Tabs.Screen
        name="likes-you"
        options={{
          href: null, // Hide from tab bar - accessible from Connect screen
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          href: null, // Hide from tab bar - accessible from Profile
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.1)',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    height: Platform.OS === 'ios' ? 88 : 70,
    position: 'absolute',
    elevation: 0,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 3,
    borderRadius: 2,
  },
  tabUnreadDot: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  tabUnreadText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  header: {
    backgroundColor: '#0F172A',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 18,
    color: '#F8FAFC',
  },
});
