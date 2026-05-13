import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Pressable,
  Image,
  ScrollView,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/services/api';
import { useRouter } from 'expo-router';
import ReportProfileModal from '../../src/components/ReportProfileModal';

const { width } = Dimensions.get('window');

interface LikeData {
  like_id: string;
  user: {
    user_id: string;
    name: string;
    email: string;
    picture?: string;
    photos?: string[];
    interests: string[];
    university?: string;
    course?: string;
    age?: number;
    bio?: string;
  };
  comment?: string;
  liked_section?: string;
  created_at: string;
}

export default function LikesYouScreen() {
  const router = useRouter();
  const { sessionToken } = useAuth();
  const [likes, setLikes] = useState<LikeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<LikeData['user'] | null>(null);

  useEffect(() => {
    loadLikes();
  }, []);

  const loadLikes = async () => {
    try {
      const data = await api.get('/matches/likes-received', sessionToken);
      setLikes(data);
    } catch (error) {
      console.error('Error loading likes:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLikes();
  };

  const handleLikeBack = async (like: LikeData, andMessage: boolean = false) => {
    setRespondingTo(like.like_id);
    try {
      const result = await api.post(
        '/matches/swipe',
        { 
          target_user_id: like.user.user_id, 
          action: 'like',
          comment: null,
          liked_section: 'profile'
        },
        sessionToken
      );
      
      // Remove from list after responding
      setLikes(prev => prev.filter(l => l.like_id !== like.like_id));
      
      if (result.is_mutual) {
        if (andMessage) {
          // Navigate directly to chat with this person
          router.push({
            pathname: '/(main)/chat',
            params: { matchId: result.match_id, userName: like.user.name }
          });
        } else {
          alert(`It's a match with ${like.user.name}! 🎉`);
        }
      }
    } catch (error) {
      console.error('Error liking back:', error);
    } finally {
      setRespondingTo(null);
    }
  };

  const handleSkip = async (like: LikeData) => {
    setRespondingTo(like.like_id);
    try {
      await api.post(
        '/matches/swipe',
        { target_user_id: like.user.user_id, action: 'dislike' },
        sessionToken
      );
      
      // Remove from list after responding
      setLikes(prev => prev.filter(l => l.like_id !== like.like_id));
    } catch (error) {
      console.error('Error skipping:', error);
    } finally {
      setRespondingTo(null);
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

  const getAvatarGradient = (name: string): [string, string] => {
    const gradients: [string, string][] = [
      ['#6366F1', '#8B5CF6'],
      ['#EC4899', '#F472B6'],
      ['#06B6D4', '#22D3EE'],
      ['#10B981', '#34D399'],
      ['#F59E0B', '#FBBF24'],
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  const getSectionLabel = (section?: string): string => {
    if (!section) return 'your profile';
    const labels: Record<string, string> = {
      'photo': 'your photo',
      'photo2': 'your photo',
      'photo3': 'your photo',
      'course': 'your studies',
      'bio': 'your bio',
      'interests': 'your interests',
      'profile': 'your profile',
    };
    return labels[section] || 'your profile';
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderLikeCard = ({ item: like }: { item: LikeData }) => {
    const hasPhoto = like.user.photos && like.user.photos.length > 0;
    const isResponding = respondingTo === like.like_id;

    return (
      <View style={styles.likeCard}>
        {/* Profile Photo */}
        <View style={styles.cardPhotoContainer}>
          {hasPhoto ? (
            <Image source={{ uri: like.user.photos![0] }} style={styles.cardPhoto} />
          ) : (
            <LinearGradient colors={getAvatarGradient(like.user.name)} style={styles.cardPhotoPlaceholder}>
              <Text style={styles.cardPhotoInitials}>{getInitials(like.user.name)}</Text>
            </LinearGradient>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.cardPhotoGradient}
          />
          <View style={styles.cardPhotoOverlay}>
            <Text style={styles.cardName}>{like.user.name}</Text>
            {like.user.age && <Text style={styles.cardAge}>, {like.user.age}</Text>}
          </View>
          {/* Report button */}
          <TouchableOpacity
            style={styles.cardReportButton}
            onPress={() => setReportTarget(like.user)}
            data-testid={`report-like-btn-${like.user.user_id}`}
          >
            <Ionicons name="flag" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Like Info */}
        <View style={styles.likeInfoContainer}>
          <View style={styles.likeMetaRow}>
            <View style={styles.likedSectionBadge}>
              <Ionicons name="heart" size={12} color="#EC4899" />
              <Text style={styles.likedSectionText}>Liked {getSectionLabel(like.liked_section)}</Text>
            </View>
            <Text style={styles.timeAgo}>{formatTimeAgo(like.created_at)}</Text>
          </View>

          {/* Comment Section */}
          {like.comment && (
            <View style={styles.commentContainer}>
              <Ionicons name="chatbubble" size={16} color="#6366F1" />
              <Text style={styles.commentText}>"{like.comment}"</Text>
            </View>
          )}

          {/* User Details */}
          <View style={styles.userDetails}>
            {like.user.university && (
              <View style={styles.detailRow}>
                <Ionicons name="school-outline" size={14} color="#94A3B8" />
                <Text style={styles.detailText}>{like.user.university}</Text>
              </View>
            )}
            {like.user.course && (
              <View style={styles.detailRow}>
                <Ionicons name="book-outline" size={14} color="#94A3B8" />
                <Text style={styles.detailText}>{like.user.course}</Text>
              </View>
            )}
          </View>

          {/* Interests */}
          {like.user.interests && like.user.interests.length > 0 && (
            <View style={styles.interestsRow}>
              {like.user.interests.slice(0, 3).map((interest, i) => (
                <View key={i} style={styles.interestChip}>
                  <Text style={styles.interestChipText}>{interest}</Text>
                </View>
              ))}
              {like.user.interests.length > 3 && (
                <Text style={styles.moreInterests}>+{like.user.interests.length - 3}</Text>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={() => handleSkip(like)}
              disabled={isResponding}
            >
              {isResponding ? (
                <ActivityIndicator size="small" color="#64748B" />
              ) : (
                <>
                  <Ionicons name="close" size={20} color="#64748B" />
                  <Text style={styles.skipButtonText}>Skip</Text>
                </>
              )}
            </TouchableOpacity>

            <Pressable 
              onPress={() => handleLikeBack(like, false)}
              disabled={isResponding}
            >
              <LinearGradient
                colors={['#EC4899', '#F472B6']}
                style={styles.likeBackButton}
              >
                {isResponding ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="heart" size={20} color="#fff" />
                    <Text style={styles.likeBackButtonText}>Like</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>

            <Pressable 
              onPress={() => handleLikeBack(like, true)}
              disabled={isResponding}
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                style={styles.messageButton}
              >
                {isResponding ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="chatbubble" size={18} color="#fff" />
                    <Text style={styles.messageButtonText}>Message</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EC4899" />
          <Text style={styles.loadingText}>Loading likes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ReportProfileModal
        visible={reportTarget !== null}
        onClose={() => setReportTarget(null)}
        reportedUserId={reportTarget?.user_id || ''}
        reportedUserName={reportTarget?.name || 'this profile'}
        sessionToken={sessionToken}
      />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Ionicons name="heart" size={24} color="#EC4899" />
          <Text style={styles.headerText}>Likes You</Text>
          {likes.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{likes.length}</Text>
            </View>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {likes.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="heart-outline" size={64} color="#64748B" />
          </View>
          <Text style={styles.emptyTitle}>No Likes Yet</Text>
          <Text style={styles.emptySubtitle}>
            When someone likes your profile, they'll appear here!
          </Text>
          <Pressable onPress={() => router.push('/(main)/matches')}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.discoverButton}
            >
              <Ionicons name="search" size={18} color="#fff" />
              <Text style={styles.discoverButtonText}>Discover People</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={likes}
          renderItem={renderLikeCard}
          keyExtractor={(item) => item.like_id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#EC4899"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  countBadge: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  likeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  cardPhotoContainer: {
    height: 200,
    position: 'relative',
  },
  cardPhoto: {
    width: '100%',
    height: '100%',
  },
  cardPhotoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPhotoInitials: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
  },
  cardPhotoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  cardPhotoOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardReportButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardAge: {
    fontSize: 20,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  likeInfoContainer: {
    padding: 16,
  },
  likeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  likedSectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  likedSectionText: {
    color: '#EC4899',
    fontSize: 12,
    fontWeight: '500',
  },
  timeAgo: {
    color: '#64748B',
    fontSize: 12,
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  commentText: {
    flex: 1,
    color: '#CBD5E1',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  userDetails: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  interestChip: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interestChipText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '500',
  },
  moreInterests: {
    color: '#64748B',
    fontSize: 12,
    alignSelf: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 4,
  },
  skipButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  likeBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 4,
  },
  likeBackButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 4,
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  discoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  discoverButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
