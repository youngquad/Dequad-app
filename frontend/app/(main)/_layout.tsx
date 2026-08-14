import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Notifications from 'expo-notifications';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme, Theme } from '../../src/contexts/ThemeContext';
import { api } from '../../src/services/api';
import { registerPushToken } from '../../src/utils/push';

// Custom Tab Bar Icon with indicator + optional unread badge
function TabIcon({
  name,
  focused,
  color,
  badgeCount,
  dotBorder,
}: { name: string; focused: boolean; color: string; badgeCount?: number; dotBorder?: string }) {
  return (
    <View style={staticStyles.tabIconContainer}>
      {focused && <View style={[staticStyles.activeIndicator, { backgroundColor: color }]} />}
      <Ionicons name={name as any} size={24} color={color} />
      {badgeCount && badgeCount > 0 ? (
        <View style={[staticStyles.tabUnreadDot, { borderColor: dotBorder || 'transparent' }]}>
          <Text style={staticStyles.tabUnreadText}>
            {badgeCount > 9 ? '9+' : badgeCount}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function MainLayout() {
  const { sessionToken } = useAuth();
  const { theme: t } = useTheme();
  const [chatUnread, setChatUnread] = useState(0);
  const [likesCount, setLikesCount] = useState(0);

  // Register the device for push notifications once signed in (no-op on web).
  useEffect(() => {
    if (!sessionToken || Platform.OS === 'web') return;
    registerPushToken(sessionToken);
  }, [sessionToken]);

  // Poll unread chat + pending likes so the Chat and Connect tab badges update
  // even while the user is on another tab. Cheap aggregations on indexed fields.
  useEffect(() => {
    if (!sessionToken) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        const [c, l] = await Promise.all([
          api.get('/chat/unread-count', sessionToken).catch(() => null),
          api.get('/matches/likes-received/count', sessionToken).catch(() => null),
        ]);
        if (cancelled) return;
        const cu = c?.unread ?? 0;
        const lc = l?.count ?? 0;
        setChatUnread(cu);
        setLikesCount(lc);
        // Native app-icon badge (iOS / Android springboard). No-op on web.
        if (Platform.OS !== 'web') {
          try { await Notifications.setBadgeCountAsync(cu + lc); } catch {}
        }
      } catch {}
    };
    refresh();
    const id = setInterval(refresh, 20_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [sessionToken]);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: t.tabBarBg,
          borderTopWidth: 1,
          borderTopColor: t.border,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          height: Platform.OS === 'ios' ? 88 : 70,
          position: 'absolute',
          elevation: 0,
        },
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.textFaint,
        tabBarShowLabel: true,
        tabBarLabelStyle: staticStyles.tabLabel,
        headerStyle: {
          backgroundColor: t.headerBg,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: t.border,
        },
        headerTintColor: t.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 18, color: t.text },
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
            <TabIcon
              name={focused ? 'people' : 'people-outline'}
              focused={focused}
              color={color}
              badgeCount={likesCount}
            />
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
          // Also visually hide the bottom tab bar so it doesn't overlap the chat composer.
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}

const staticStyles = StyleSheet.create({
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
  },
  tabUnreadText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
});
