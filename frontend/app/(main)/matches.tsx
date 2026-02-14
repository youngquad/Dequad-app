import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/services/api';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  picture?: string;
  interests: string[];
  university?: string;
  university_location?: string;
  campus_name?: string;
  course?: string;
  age?: number;
  study_style?: string;
  bio?: string;
  ethnicity?: string;
  gender?: string;
  match_score?: number;
}

interface SwipeInfo {
  remaining_swipes: number | null;
  is_premium: boolean;
}

export default function MatchesScreen() {
  const router = useRouter();
  const { sessionToken } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [matchAlert, setMatchAlert] = useState<UserProfile | null>(null);
  const [swipeInfo, setSwipeInfo] = useState<SwipeInfo>({ remaining_swipes: 5, is_premium: false });
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [0, 1],
  });

  const dislikeOpacity = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1, 0],
  });

  const nextCardOpacity = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: [1, 0.5, 1],
  });

  const nextCardScale = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: [1, 0.9, 1],
  });

  useEffect(() => {
    loadProfiles();
    loadSwipeStatus();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await api.get('/matches/discover', sessionToken);
      setProfiles(data);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSwipeStatus = async () => {
    try {
      const data = await api.get('/subscription/status', sessionToken);
      setSwipeInfo({
        remaining_swipes: data.remaining_swipes,
        is_premium: data.is_premium
      });
    } catch (error) {
      console.error('Error loading swipe status:', error);
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        swipeRight();
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        swipeLeft();
      } else {
        resetPosition();
      }
    },
  });

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const handleSwipeError = (error: any) => {
    // Check if it's a swipe limit error
    if (error?.response?.status === 403) {
      const detail = error?.response?.data?.detail;
      if (detail?.upgrade_required) {
        setShowUpgradePrompt(true);
        return true;
      }
    }
    return false;
  };

  const swipeRight = async () => {
    // Check if free user has swipes left
    if (!swipeInfo.is_premium && swipeInfo.remaining_swipes !== null && swipeInfo.remaining_swipes <= 0) {
      setShowUpgradePrompt(true);
      resetPosition();
      return;
    }

    const currentProfile = profiles[currentIndex];
    
    Animated.timing(position, {
      toValue: { x: width + 100, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(async () => {
      try {
        const result = await api.post(
          '/matches/swipe',
          { target_user_id: currentProfile.user_id, action: 'like' },
          sessionToken
        );
        
        if (result.is_mutual) {
          setMatchAlert(result.matched_user);
        }
        
        // Update swipe info
        if (result.remaining_swipes !== null && result.remaining_swipes !== undefined) {
          setSwipeInfo(prev => ({
            ...prev,
            remaining_swipes: result.remaining_swipes
          }));
        }
        
        goToNext();
      } catch (error: any) {
        if (!handleSwipeError(error)) {
          console.error('Swipe error:', error);
        }
        resetPosition();
      }
    });
  };

  const swipeLeft = async () => {
    // Check if free user has swipes left
    if (!swipeInfo.is_premium && swipeInfo.remaining_swipes !== null && swipeInfo.remaining_swipes <= 0) {
      setShowUpgradePrompt(true);
      resetPosition();
      return;
    }

    const currentProfile = profiles[currentIndex];
    
    Animated.timing(position, {
      toValue: { x: -width - 100, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(async () => {
      try {
        const result = await api.post(
          '/matches/swipe',
          { target_user_id: currentProfile.user_id, action: 'dislike' },
          sessionToken
        );
        
        // Update swipe info
        if (result.remaining_swipes !== null && result.remaining_swipes !== undefined) {
          setSwipeInfo(prev => ({
            ...prev,
            remaining_swipes: result.remaining_swipes
          }));
        }
        
        goToNext();
      } catch (error: any) {
        if (!handleSwipeError(error)) {
          console.error('Swipe error:', error);
        }
        resetPosition();
      }
    });
  };

  const goToNext = () => {
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex((prev) => prev + 1);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderCard = (profile: UserProfile, index: number) => {
    if (index < currentIndex) return null;

    const isFirst = index === currentIndex;
    const cardStyle = isFirst
      ? [
          styles.card,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { rotate },
            ],
          },
        ]
      : [
          styles.card,
          {
            opacity: nextCardOpacity,
            transform: [{ scale: nextCardScale }],
          },
        ];

    return (
      <Animated.View
        key={profile.user_id}
        style={cardStyle}
        {...(isFirst ? panResponder.panHandlers : {})}
      >
        {isFirst && (
          <>
            <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
              <Text style={styles.likeLabelText}>LIKE</Text>
            </Animated.View>
            <Animated.View style={[styles.nopeLabel, { opacity: dislikeOpacity }]}>
              <Text style={styles.nopeLabelText}>NOPE</Text>
            </Animated.View>
          </>
        )}

        <View style={styles.cardContent}>
          <View style={styles.avatar}>
            {profile.picture ? (
              <View style={styles.avatarImage}>
                <Text style={styles.avatarText}>{getInitials(profile.name)}</Text>
              </View>
            ) : (
              <View style={styles.avatarImage}>
                <Text style={styles.avatarText}>{getInitials(profile.name)}</Text>
              </View>
            )}
          </View>

          <Text style={styles.cardName}>
            {profile.name}
            {profile.age && <Text style={styles.cardAge}>, {profile.age}</Text>}
          </Text>

          {profile.course && (
            <View style={styles.infoRow}>
              <Ionicons name="library-outline" size={16} color="#9CA3AF" />
              <Text style={styles.infoText}>{profile.course}</Text>
            </View>
          )}

          {profile.university && (
            <View style={styles.infoRow}>
              <Ionicons name="school-outline" size={16} color="#9CA3AF" />
              <Text style={styles.infoText}>
                {profile.university}
                {profile.campus_name && ` - ${profile.campus_name}`}
              </Text>
            </View>
          )}

          {profile.university_location && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="#9CA3AF" />
              <Text style={styles.infoText}>{profile.university_location}</Text>
            </View>
          )}

          {profile.study_style && (
            <View style={styles.infoRow}>
              <Ionicons name="book-outline" size={16} color="#9CA3AF" />
              <Text style={styles.infoText}>{profile.study_style} learner</Text>
            </View>
          )}

          {profile.match_score !== undefined && (
            <View style={styles.matchScore}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.matchScoreText}>
                {Math.round(profile.match_score * 100)}% Match
              </Text>
            </View>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <View style={styles.interestsContainer}>
              <Text style={styles.interestsLabel}>Interests</Text>
              <View style={styles.interestTags}>
                {profile.interests.slice(0, 5).map((interest, i) => (
                  <View key={i} style={styles.interestTag}>
                    <Text style={styles.interestTagText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {profile.bio && (
            <Text style={styles.bio} numberOfLines={3}>
              {profile.bio}
            </Text>
          )}
        </View>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Finding study partners...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <View style={styles.matchOverlay}>
          <View style={styles.upgradeModal}>
            <Ionicons name="diamond" size={60} color="#F59E0B" />
            <Text style={styles.upgradeTitle}>Daily Limit Reached</Text>
            <Text style={styles.upgradeSubtitle}>
              You've used all 5 swipes for today. Upgrade to Premium for unlimited swipes!
            </Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => {
                setShowUpgradePrompt(false);
                router.push('/(main)/subscription');
              }}
            >
              <Ionicons name="diamond" size={20} color="#fff" />
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.laterButton}
              onPress={() => setShowUpgradePrompt(false)}
            >
              <Text style={styles.laterButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {matchAlert && (
        <View style={styles.matchOverlay}>
          <View style={styles.matchModal}>
            <Ionicons name="heart" size={60} color="#EC4899" />
            <Text style={styles.matchTitle}>It's a Match!</Text>
            <Text style={styles.matchSubtitle}>
              You and {matchAlert.name} liked each other
            </Text>
            <TouchableOpacity
              style={styles.matchButton}
              onPress={() => setMatchAlert(null)}
            >
              <Text style={styles.matchButtonText}>Keep Swiping</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Swipe Counter Banner (for free users) */}
      {!swipeInfo.is_premium && (
        <TouchableOpacity 
          style={styles.swipeBanner}
          onPress={() => router.push('/(main)/subscription')}
        >
          <View style={styles.swipeBannerContent}>
            <Text style={styles.swipeBannerText}>
              {swipeInfo.remaining_swipes !== null && swipeInfo.remaining_swipes > 0
                ? `${swipeInfo.remaining_swipes} swipes left today`
                : 'No swipes left today'}
            </Text>
            <View style={styles.upgradeBadge}>
              <Ionicons name="diamond" size={14} color="#F59E0B" />
              <Text style={styles.upgradeBadgeText}>Upgrade</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.cardsContainer}>
        {currentIndex >= profiles.length ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#4B5563" />
            <Text style={styles.emptyTitle}>No More Profiles</Text>
            <Text style={styles.emptySubtitle}>
              Check back later for new study partners
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={loadProfiles}>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {profiles
              .slice(currentIndex, currentIndex + 2)
              .reverse()
              .map((profile, index) =>
                renderCard(profile, currentIndex + (1 - index))
              )}
          </>
        )}
      </View>

      {currentIndex < profiles.length && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.dislikeButton]}
            onPress={swipeLeft}
          >
            <Ionicons name="close" size={32} color="#EF4444" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={swipeRight}
          >
            <Ionicons name="heart" size={32} color="#10B981" />
          </TouchableOpacity>
        </View>
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
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 16,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    position: 'absolute',
    width: width - 40,
    height: height * 0.6,
    backgroundColor: '#1F2937',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  cardContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  avatar: {
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  cardAge: {
    fontWeight: 'normal',
    color: '#9CA3AF',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 6,
  },
  matchScore: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  matchScoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
  },
  interestsContainer: {
    width: '100%',
    marginTop: 12,
  },
  interestsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  interestTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  interestTagText: {
    fontSize: 12,
    color: '#818CF8',
  },
  bio: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  likeLabel: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    transform: [{ rotate: '-15deg' }],
  },
  likeLabelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  nopeLabel: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    transform: [{ rotate: '15deg' }],
  },
  nopeLabelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 32,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  dislikeButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  likeButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  emptyState: {
    alignItems: 'center',
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
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  matchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  matchModal: {
    backgroundColor: '#1F2937',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: width - 48,
  },
  matchTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#EC4899',
    marginTop: 16,
    marginBottom: 8,
  },
  matchSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  matchButton: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  matchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
