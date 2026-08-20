import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useTheme, Theme } from '../../../src/contexts/ThemeContext';
import { api } from '../../../src/services/api';
import { decrypt } from '../../../src/utils/encryption';
import { MoodCardSkeleton } from '../../../src/components/SkeletonLoader';

interface MatchedUser {
  match_id: string;
  user: {
    user_id: string;
    name: string;
    email: string;
    course?: string;
    picture?: string;
  };
  last_message?: string | null;
  last_message_at?: string | null;
  last_sender_id?: string | null;
}

function formatRelative(iso?: string | null): string {
  if (!iso) return '';
  const ts = new Date(iso).getTime();
  if (isNaN(ts)) return '';
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  if (diff < 172_800_000) return 'yesterday';
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d`;
  return new Date(iso).toLocaleDateString([], { day: '2-digit', month: 'short' });
}

function previewMessage(text?: string | null): string {
  if (!text) return '';
  return decrypt(text);
}

export default function ChatListScreen() {
  const router = useRouter();
  const { sessionToken, user } = useAuth();
  const { theme: t } = useTheme();
  const styles = useMemo(() => createStyles(t), [t]);
  const [matches, setMatches] = useState<MatchedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMatches = useCallback(async () => {
    try {
      const data = await api.get('/matches/accepted', sessionToken);
      setMatches(data);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionToken]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Refresh whenever the user comes back to the inbox so the "last message"
  // preview stays in sync after sending/receiving in a thread.
  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [loadMatches]),
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderMatch = ({ item }: { item: MatchedUser }) => {
    const preview = previewMessage(item.last_message);
    const isMine = item.last_sender_id && user && item.last_sender_id === user.user_id;
    const subtitle = preview
      ? (isMine ? `You: ${preview}` : preview)
      : (item.user.course || 'Tap to start the conversation');
    return (
      <TouchableOpacity
        style={styles.matchItem}
        onPress={() => router.push(`/(main)/chat/${item.match_id}?name=${encodeURIComponent(item.user.name)}&picture=${encodeURIComponent(item.user.picture || '')}`)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.user.name)}</Text>
        </View>
        <View style={styles.matchInfo}>
          <View style={styles.matchTopRow}>
            <Text style={styles.matchName} numberOfLines={1}>{item.user.name}</Text>
            {item.last_message_at ? (
              <Text style={styles.matchTime}>{formatRelative(item.last_message_at)}</Text>
            ) : null}
          </View>
          <Text style={styles.matchSubtitle} numberOfLines={1}>{subtitle}</Text>
        </View>
        <View style={styles.lockIcon}>
          <Ionicons name="shield-checkmark" size={16} color={t.success} />
        </View>
        <Ionicons name="chevron-forward" size={24} color={t.textFaint} />
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.listContent}>
          {[1, 2, 3, 4].map((i) => (
            <MoodCardSkeleton key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {matches.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={64} color={t.textFaint} />
          <Text style={styles.emptyTitle}>No Matches Yet</Text>
          <Text style={styles.emptySubtitle}>
            Match with other students to start chatting
          </Text>
          <TouchableOpacity
            style={styles.goToMatchesButton}
            onPress={() => router.push('/(main)/matches')}
          >
            <Ionicons name="people" size={20} color="#fff" />
            <Text style={styles.goToMatchesText}>Find Study Partners</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={20} color={t.success} />
            <Text style={styles.headerText}>
              Conversations are protected and monitored for safety
            </Text>
          </View>
          <FlatList
            data={matches}
            keyExtractor={(item) => item.match_id}
            renderItem={renderMatch}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const createStyles = (t: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: t.isDark ? 'rgba(79, 184, 159, 0.1)' : 'rgba(15, 122, 94, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: t.border,
  },
  headerText: {
    color: t.success,
    fontSize: 14,
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: t.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: t.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  matchInfo: {
    flex: 1,
    minWidth: 0,
  },
  matchTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchTime: {
    color: t.textFaint,
    fontSize: 11,
    marginLeft: 'auto',
  },
  matchName: {
    fontSize: 16,
    fontWeight: '600',
    color: t.text,
    flex: 1,
  },
  matchEmail: {
    fontSize: 14,
    color: t.textMuted,
  },
  matchSubtitle: {
    fontSize: 13,
    color: t.textMuted,
    marginTop: 2,
  },
  lockIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.isDark ? 'rgba(79, 184, 159, 0.15)' : 'rgba(15, 122, 94, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  lockText: {
    color: t.success,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: t.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: t.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  goToMatchesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },
  goToMatchesText: {
    color: t.primaryText,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
