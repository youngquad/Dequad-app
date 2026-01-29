import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { api } from '../../../src/services/api';

interface MatchedUser {
  match_id: string;
  user: {
    user_id: string;
    name: string;
    email: string;
    picture?: string;
  };
}

export default function ChatListScreen() {
  const router = useRouter();
  const { sessionToken } = useAuth();
  const [matches, setMatches] = useState<MatchedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const data = await api.get('/matches/accepted', sessionToken);
      setMatches(data);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderMatch = ({ item }: { item: MatchedUser }) => (
    <TouchableOpacity
      style={styles.matchItem}
      onPress={() => router.push(`/(main)/chat/${item.match_id}?name=${encodeURIComponent(item.user.name)}`)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(item.user.name)}</Text>
      </View>
      <View style={styles.matchInfo}>
        <Text style={styles.matchName}>{item.user.name}</Text>
        <Text style={styles.matchEmail}>{item.user.email}</Text>
      </View>
      <View style={styles.lockIcon}>
        <Ionicons name="lock-closed" size={16} color="#10B981" />
        <Text style={styles.lockText}>E2E</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#6B7280" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {matches.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={64} color="#4B5563" />
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
            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            <Text style={styles.headerText}>
              All conversations are end-to-end encrypted
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerText: {
    color: '#10B981',
    fontSize: 14,
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6366F1',
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
  },
  matchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  matchEmail: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  lockIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  lockText: {
    color: '#10B981',
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
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  goToMatchesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  goToMatchesText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
