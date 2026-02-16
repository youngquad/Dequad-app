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
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/services/api';
import { useRouter } from 'expo-router';
import { MatchCardSkeleton } from '../../src/components/SkeletonLoader';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  picture?: string;
  photos?: string[];
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
  const buttonScale = useRef(new Animated.Value(1)).current;

  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-12deg', '0deg', '12deg'],
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
    outputRange: [1, 0.6, 1],
  });

  const nextCardScale = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: [1, 0.92, 1],
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
      tension: 40,
      friction: 7,
    }).start();
  };

  const handleSwipeError = (error: any) => {
    if (error?.response?.status === 403) {
      const detail = error?.response?.data?.detail;
      if (detail?.upgrade_required) {
        setShowUpgradePrompt(true);
        return { shouldReset: true, shouldMoveNext: false };
      }
    }
    
    if (error?.response?.status === 400) {
      const detail = error?.response?.data?.detail;
      if (detail && (detail.includes('Already swiped') || detail.includes('already swiped'))) {
        return { shouldReset: false, shouldMoveNext: true };
      }
    }
    
    return { shouldReset: true, shouldMoveNext: false };
  };

  const swipeRight = async () => {
    if (!swipeInfo.is_premium && swipeInfo.remaining_swipes !== null && swipeInfo.remaining_swipes <= 0) {
      setShowUpgradePrompt(true);
      resetPosition();
      return;
    }

    const currentProfile = profiles[currentIndex];
    if (!currentProfile) {
      resetPosition();
      return;
    }
    
    Animated.timing(position, {
      toValue: { x: width + 100, y: 0 },
      duration: 250,
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
        
        if (result.remaining_swipes !== null && result.remaining_swipes !== undefined) {
          setSwipeInfo(prev => ({
            ...prev,
            remaining_swipes: result.remaining_swipes
          }));
        }
        
        goToNext();
      } catch (error: any) {
        const { shouldReset, shouldMoveNext } = handleSwipeError(error);
        if (shouldMoveNext) {
          goToNext();
        } else if (shouldReset) {
          resetPosition();
        }
        console.error('Swipe error:', error?.response?.data || error);
      }
    });
  };

  const swipeLeft = async () => {
    if (!swipeInfo.is_premium && swipeInfo.remaining_swipes !== null && swipeInfo.remaining_swipes <= 0) {
      setShowUpgradePrompt(true);
      resetPosition();
      return;
    }

    const currentProfile = profiles[currentIndex];
    if (!currentProfile) {
      resetPosition();
      return;
    }
    
    Animated.timing(position, {
      toValue: { x: -width - 100, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(async () => {
      try {
        const result = await api.post(
          '/matches/swipe',
          { target_user_id: currentProfile.user_id, action: 'dislike' },
          sessionToken
        );
        
        if (result.remaining_swipes !== null && result.remaining_swipes !== undefined) {
          setSwipeInfo(prev => ({
            ...prev,
            remaining_swipes: result.remaining_swipes
          }));
        }
        
        goToNext();
      } catch (error: any) {
        const { shouldReset, shouldMoveNext } = handleSwipeError(error);
        if (shouldMoveNext) {
          goToNext();
        } else if (shouldReset) {
          resetPosition();
        }
        console.error('Swipe error:', error?.response?.data || error);
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
          styles.nextCard,
          {
            opacity: nextCardOpacity,
            transform: [{ scale: nextCardScale }],
          },
        ];

    // Get profile photo or use gradient avatar
    const hasPhoto = profile.photos && profile.photos.length > 0;

    return (
      <Animated.View
        key={profile.user_id}
        style={cardStyle}
        {...(isFirst ? panResponder.panHandlers : {})}
      >
        {/* Card Background */}
        <LinearGradient
          colors={['#1E293B', '#0F172A']}
          style={StyleSheet.absoluteFill}
        />

        {isFirst && (
          <>
            <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
              <LinearGradient colors={['#10B981', '#34D399']} style={styles.labelGradient}>
                <Text style={styles.labelText}>LIKE 💚</Text>
              </LinearGradient>
            </Animated.View>
            <Animated.View style={[styles.nopeLabel, { opacity: dislikeOpacity }]}>
              <LinearGradient colors={['#EF4444', '#F87171']} style={styles.labelGradient}>
                <Text style={styles.labelText}>NOPE ✕</Text>
              </LinearGradient>
            </Animated.View>
          </>
        )}

        <View style={styles.cardContent}>
          {/* Avatar - Priority: uploaded photos > Google picture > initials */}
          <View style={styles.avatarContainer}>
            {hasPhoto ? (
              <Image source={{ uri: profile.photos![0] }} style={styles.avatarImage} />
            ) : profile.picture && profile.picture.trim() !== '' ? (
              <Image source={{ uri: profile.picture }} style={styles.avatarImage} />
            ) : (
              <LinearGradient colors={getAvatarGradient(profile.name)} style={styles.avatarGradient}>
                <Text style={styles.avatarText}>{getInitials(profile.name)}</Text>
              </LinearGradient>
            )}
          </View>

          {/* Name & Age */}
          <View style={styles.nameRow}>
            <Text style={styles.cardName}>{profile.name}</Text>
            {profile.age && <Text style={styles.cardAge}>, {profile.age}</Text>}
          </View>

          {/* Course & University */}
          {profile.course && (
            <View style={styles.infoRow}>
              <Ionicons name="school" size={15} color="#94A3B8" />
              <Text style={styles.infoText}>{profile.course}</Text>
            </View>
          )}

          {profile.university && (
            <View style={styles.infoRow}>
              <Ionicons name="location" size={15} color="#94A3B8" />
              <Text style={styles.infoText}>
                {profile.university}
                {profile.campus_name && ` • ${profile.campus_name}`}
              </Text>
            </View>
          )}

          {/* Match Score */}
          {profile.match_score !== undefined && (
            <View style={styles.matchScoreContainer}>
              <LinearGradient
                colors={['rgba(245, 158, 11, 0.2)', 'rgba(251, 191, 36, 0.15)']}
                style={styles.matchScoreBg}
              >
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.matchScoreText}>
                  {Math.round(profile.match_score * 100)}% Match
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <View style={styles.interestsContainer}>
              <View style={styles.interestTags}>
                {profile.interests.slice(0, 4).map((interest, i) => (
                  <View key={i} style={styles.interestTag}>
                    <Text style={styles.interestTagText}>{interest}</Text>
                  </View>
                ))}
                {profile.interests.length > 4 && (
                  <View style={styles.interestTagMore}>
                    <Text style={styles.interestTagMoreText}>+{profile.interests.length - 4}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Bio */}
          {profile.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              "{profile.bio}"
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
          <MatchCardSkeleton />
          <Text style={styles.loadingText}>Finding study partners...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.upgradeModal}>
            <LinearGradient
              colors={['rgba(245, 158, 11, 0.2)', 'transparent']}
              style={styles.upgradeGlow}
            />
            <View style={styles.upgradeIcon}>
              <Ionicons name="diamond" size={48} color="#F59E0B" />
            </View>
            <Text style={styles.upgradeTitle}>Daily Limit Reached</Text>
            <Text style={styles.upgradeSubtitle}>
              You've used all 5 swipes for today.{'\n'}Upgrade to Premium for unlimited connections!
            </Text>
            <Pressable
              onPress={() => {
                setShowUpgradePrompt(false);
                router.push('/(main)/subscription');
              }}
            >
              <LinearGradient
                colors={['#F59E0B', '#FBBF24']}
                style={styles.upgradeButton}
              >
                <Ionicons name="diamond" size={18} color="#fff" />
                <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
              </LinearGradient>
            </Pressable>
            <TouchableOpacity
              style={styles.laterButton}
              onPress={() => setShowUpgradePrompt(false)}
            >
              <Text style={styles.laterButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* Match Alert */}
      {matchAlert && (
        <View style={styles.modalOverlay}>
          <View style={styles.matchModal}>
            <View style={styles.matchHearts}>
              <Text style={styles.matchEmoji}>💕</Text>
            </View>
            <Text style={styles.matchTitle}>It's a Match!</Text>
            <Text style={styles.matchSubtitle}>
              You and {matchAlert.name} liked each other
            </Text>
            <Pressable onPress={() => setMatchAlert(null)}>
              <LinearGradient
                colors={['#EC4899', '#F472B6']}
                style={styles.matchButton}
              >
                <Text style={styles.matchButtonText}>Keep Swiping</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      )}

      {/* Swipe Counter Banner */}
      {!swipeInfo.is_premium && (
        <TouchableOpacity 
          style={styles.swipeBanner}
          onPress={() => router.push('/(main)/subscription')}
          activeOpacity={0.8}
        >
          <View style={styles.swipeCounter}>
            <View style={styles.swipeDotsContainer}>
              {[...Array(5)].map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.swipeDot,
                    i < (swipeInfo.remaining_swipes || 0) && styles.swipeDotActive
                  ]} 
                />
              ))}
            </View>
            <Text style={styles.swipeCounterText}>
              {swipeInfo.remaining_swipes || 0} swipes left
            </Text>
          </View>
          <View style={styles.upgradeBadge}>
            <Ionicons name="diamond" size={14} color="#F59E0B" />
            <Text style={styles.upgradeBadgeText}>Go Premium</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Cards Container */}
      <View style={styles.cardsContainer}>
        {currentIndex >= profiles.length ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="search" size={48} color="#64748B" />
            </View>
            <Text style={styles.emptyTitle}>No More Profiles</Text>
            <Text style={styles.emptySubtitle}>
              Check back later for new study partners
            </Text>
            <Pressable onPress={loadProfiles}>
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                style={styles.refreshButton}
              >
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </LinearGradient>
            </Pressable>
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

      {/* Action Buttons */}
      {currentIndex < profiles.length && (
        <View style={styles.buttonsContainer}>
          <Pressable
            onPressIn={() => {
              Animated.spring(buttonScale, { toValue: 0.9, useNativeDriver: true }).start();
            }}
            onPressOut={() => {
              Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();
            }}
            onPress={swipeLeft}
          >
            <Animated.View style={[styles.actionButton, styles.dislikeButton, { transform: [{ scale: buttonScale }] }]}>
              <Ionicons name="close" size={32} color="#EF4444" />
            </Animated.View>
          </Pressable>
          <Pressable
            onPressIn={() => {
              Animated.spring(buttonScale, { toValue: 0.9, useNativeDriver: true }).start();
            }}
            onPressOut={() => {
              Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();
            }}
            onPress={swipeRight}
          >
            <Animated.View style={[styles.actionButton, styles.likeButton, { transform: [{ scale: buttonScale }] }]}>
              <Ionicons name="heart" size={30} color="#10B981" />
            </Animated.View>
          </Pressable>
        </View>
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
    padding: 20,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 20,
    fontWeight: '500',
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    position: 'absolute',
    width: width - 32,
    height: height * 0.58,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  nextCard: {
    top: 10,
  },
  cardContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  cardName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  cardAge: {
    fontSize: 22,
    color: '#94A3B8',
    fontWeight: '400',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  matchScoreContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  matchScoreBg: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  matchScoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  interestsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  interestTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  interestTagText: {
    fontSize: 12,
    color: '#818CF8',
    fontWeight: '500',
  },
  interestTagMore: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  interestTagMoreText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  bio: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  likeLabel: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
    transform: [{ rotate: '-15deg' }],
  },
  nopeLabel: {
    position: 'absolute',
    top: 40,
    right: 16,
    zIndex: 10,
    transform: [{ rotate: '15deg' }],
  },
  labelGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  labelText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingBottom: 90,
    gap: 40,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dislikeButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  likeButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#94A3B8',
    marginBottom: 24,
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  upgradeModal: {
    backgroundColor: '#1E293B',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    width: width - 48,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    overflow: 'hidden',
  },
  upgradeGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  upgradeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  upgradeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  upgradeSubtitle: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  laterButton: {
    marginTop: 16,
    paddingVertical: 10,
  },
  laterButtonText: {
    color: '#64748B',
    fontSize: 14,
  },
  matchModal: {
    backgroundColor: '#1E293B',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    width: width - 48,
  },
  matchHearts: {
    marginBottom: 16,
  },
  matchEmoji: {
    fontSize: 64,
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#EC4899',
    marginBottom: 8,
  },
  matchSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  matchButton: {
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 24,
  },
  matchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  swipeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  swipeCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  swipeDotsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  swipeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
  },
  swipeDotActive: {
    backgroundColor: '#6366F1',
  },
  swipeCounterText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  upgradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  upgradeBadgeText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
  },
});
