import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Animated,
  Pressable,
  Image,
  ScrollView,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme, Theme } from '../../src/contexts/ThemeContext';
import { api } from '../../src/services/api';
import { useRouter } from 'expo-router';
import { MatchCardSkeleton } from '../../src/components/SkeletonLoader';
import ReportProfileModal from '../../src/components/ReportProfileModal';
import MatchFiltersModal from '../../src/components/MatchFiltersModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestCurrentLocation } from '../../src/utils/location';

const { width, height } = Dimensions.get('window');

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
  pronouns?: string;
  show_pronouns?: boolean;
  match_score?: number;
  distance_km?: number;
}

interface SwipeInfo {
  remaining_likes_this_week: number | null;
  is_premium: boolean;
  next_like_reset: string | null;
}

interface CommentModalData {
  profile: UserProfile;
  section: string;
  sectionLabel: string;
}

export default function MatchesScreen() {
  const { theme: t } = useTheme();
  const styles = useMemo(() => createStyles(t), [t]);
  const router = useRouter();
  const { sessionToken } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [matchAlert, setMatchAlert] = useState<{ user: UserProfile; matchId: string } | null>(null);
  const [swipeInfo, setSwipeInfo] = useState<SwipeInfo>({ remaining_likes_this_week: 3, is_premium: false, next_like_reset: null });
  const [now, setNow] = useState<number>(Date.now());
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [likingSection, setLikingSection] = useState<string | null>(null);
  const [commentModal, setCommentModal] = useState<CommentModalData | null>(null);
  const [comment, setComment] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [reportTarget, setReportTarget] = useState<UserProfile | null>(null);
  // Premium-gated filter state (persisted in AsyncStorage across sessions)
  const [filters, setFilters] = useState<{
    gender?: string;
    min_age?: number;
    max_age?: number;
    university?: string;
    education_level?: string;
    city?: string;
    max_distance_km?: number;
  }>({});
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  // Cached "does the current user have a location on file?" flag. Populated
  // from /subscription/status or from a successful location share. Drives the
  // distance-chip vs "enable location" CTA in MatchFiltersModal.
  const [hasLocation, setHasLocation] = useState(false);
  const [locationBusy, setLocationBusy] = useState(false);

  const scrollRef = useRef<FlatList>(null);

  // Load persisted filter prefs once on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('dequad_match_filters');
        if (raw) setFilters(JSON.parse(raw));
      } catch {}
      setFiltersLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (filtersLoaded) {
      AsyncStorage.setItem('dequad_match_filters', JSON.stringify(filters)).catch(() => {});
    }
  }, [filters, filtersLoaded]);

  useEffect(() => {
    loadProfiles();
    loadSwipeStatus();
  }, []);

  const loadProfiles = async (reset: boolean = false) => {
    try {
      if (reset) {
        setProfiles([]);
        setCurrentIndex(0);
        setIsLoading(true);
      }
      // Build query string from active filters + reset flag
      const params = new URLSearchParams();
      if (reset) params.set('reset', 'true');
      const isPremium = !!swipeInfo?.is_premium;
      if (isPremium) {
        if (filters.gender) params.set('gender', filters.gender);
        if (filters.min_age) params.set('min_age', String(filters.min_age));
        if (filters.max_age) params.set('max_age', String(filters.max_age));
        if (filters.university) params.set('university', filters.university);
        if (filters.education_level) params.set('education_level', filters.education_level);
        if (filters.city) params.set('city', filters.city);
        if (filters.max_distance_km && hasLocation) {
          params.set('max_distance_km', String(filters.max_distance_km));
        }
      }
      const qs = params.toString();
      const path = qs ? `/matches/discover?${qs}` : '/matches/discover';
      const data = await api.get(path, sessionToken);
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
      const remaining = data.remaining_likes_this_week ?? data.remaining_swipes ?? null;
      setSwipeInfo({
        remaining_likes_this_week: remaining,
        is_premium: data.is_premium,
        next_like_reset: data.next_like_reset ?? null,
      });
    } catch (error) {
      console.error('Error loading swipe status:', error);
    }
  };

  // Prime hasLocation from the user's stored profile so the distance chip in
  // the filter modal reflects reality on load (not just after we ask again).
  useEffect(() => {
    (async () => {
      try {
        const me = await api.get('/auth/me', sessionToken);
        const coords = me?.location?.coordinates;
        if (Array.isArray(coords) && coords.length === 2) setHasLocation(true);
      } catch {
        /* auth not ready yet — ignore */
      }
    })();
  }, [sessionToken]);

  const requestAndSaveLocation = async () => {
    setLocationBusy(true);
    try {
      const res = await requestCurrentLocation();
      if (!res.ok || !res.coords) {
        alert(res.error || 'Could not get your location.');
        return;
      }
      await api.post(
        '/profile/location',
        { latitude: res.coords.latitude, longitude: res.coords.longitude },
        sessionToken,
      );
      setHasLocation(true);
    } catch (e: any) {
      alert(e?.message || 'Failed to save your location.');
    } finally {
      setLocationBusy(false);
    }
  };

  // Tick once a minute so the "refreshes in X" countdown stays fresh while screen is open.
  useEffect(() => {
    if (swipeInfo.is_premium) return;
    if ((swipeInfo.remaining_likes_this_week ?? 1) > 0) return;
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [swipeInfo.is_premium, swipeInfo.remaining_likes_this_week]);

  const formatResetCountdown = (iso: string | null): string => {
    if (!iso) return 'next week';
    const ms = new Date(iso).getTime() - now;
    if (ms <= 0) return 'any moment';
    const days = Math.floor(ms / 86_400_000);
    const hours = Math.floor((ms % 86_400_000) / 3_600_000);
    const minutes = Math.floor((ms % 3_600_000) / 60_000);
    if (days >= 1) return `${days}d ${hours}h`;
    if (hours >= 1) return `${hours}h ${minutes}m`;
    return `${Math.max(1, minutes)}m`;
  };

  const getSectionLabel = (section: string): string => {
    const labels: Record<string, string> = {
      'photo': 'their photo',
      'photo2': 'their photo',
      'photo3': 'their photo',
      'course': 'their studies',
      'bio': 'their bio',
      'interests': 'their interests',
    };
    return labels[section] || section;
  };

  const openCommentModal = (profile: UserProfile, section: string) => {
    if (!swipeInfo.is_premium && swipeInfo.remaining_likes_this_week !== null && swipeInfo.remaining_likes_this_week <= 0) {
      setShowUpgradePrompt(true);
      return;
    }
    
    setCommentModal({
      profile,
      section,
      sectionLabel: getSectionLabel(section)
    });
    setComment('');
  };

  const handleSendLike = async (withComment: boolean) => {
    if (!commentModal) return;
    
    setIsSending(true);
    
    try {
      const result = await api.post(
        '/matches/swipe',
        { 
          target_user_id: commentModal.profile.user_id, 
          action: 'like',
          comment: withComment ? comment.trim() : null,
          liked_section: commentModal.section
        },
        sessionToken
      );
      
      if (result.is_mutual && result.matched_user && result?.match?.id) {
        setMatchAlert({ user: result.matched_user, matchId: result.match.id });
      }
      
      const remaining = result.remaining_likes_this_week ?? result.remaining_swipes;
      if (remaining !== null && remaining !== undefined) {
        setSwipeInfo(prev => ({
          ...prev,
          remaining_likes_this_week: remaining,
          next_like_reset: result.next_like_reset ?? prev.next_like_reset,
        }));
      }
      
      setCommentModal(null);
      setComment('');
      goToNext();
    } catch (error: any) {
      if (error?.message?.includes('Already swiped')) {
        setCommentModal(null);
        goToNext();
      } else if (error?.message?.toLowerCase().includes('limit')) {
        setCommentModal(null);
        setShowUpgradePrompt(true);
      }
      console.error('Like error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSkip = async (profile: UserProfile) => {
    // Skips are unlimited — no limit check.
    try {
      await api.post(
        '/matches/swipe',
        { target_user_id: profile.user_id, action: 'dislike' },
        sessionToken
      );
      goToNext();
    } catch (error: any) {
      if (error?.message?.includes('Already swiped')) {
        goToNext();
      }
      console.error('Skip error:', error);
    }
  };

  const goToNext = () => {
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    
    if (scrollRef.current && nextIndex < profiles.length) {
      scrollRef.current.scrollToIndex({ index: nextIndex, animated: true });
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

  const LikeButton = ({ onPress, section, disabled, profile }: { onPress: () => void; section: string; disabled?: boolean; profile: UserProfile }) => (
    <Pressable 
      onPress={() => openCommentModal(profile, section)}
      disabled={disabled}
      style={({ pressed }) => [
        styles.likeButton,
        pressed && styles.likeButtonPressed,
      ]}
    >
      <Ionicons name="heart" size={20} color="#EC4899" />
    </Pressable>
  );

  const renderProfile = ({ item: profile, index }: { item: UserProfile; index: number }) => {
    const hasPhoto = profile.photos && profile.photos.length > 0;
    const isCurrentProfile = index === currentIndex;

    return (
      <View style={styles.profileContainer}>
        <ScrollView 
          style={styles.profileScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.profileScrollContent}
          nestedScrollEnabled={true}
        >
          {/* Main Photo Section */}
          <View style={styles.photoSection}>
            {hasPhoto ? (
              <Image source={{ uri: profile.photos![0] }} style={styles.mainPhoto} />
            ) : (
              <LinearGradient colors={getAvatarGradient(profile.name)} style={styles.mainPhotoPlaceholder}>
                <Text style={styles.mainPhotoInitials}>{getInitials(profile.name)}</Text>
              </LinearGradient>
            )}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.photoGradient}
            />
            
            {/* Report Button - Top Right */}
            <TouchableOpacity
              style={styles.topReportButton}
              onPress={() => setReportTarget(profile)}
              disabled={!isCurrentProfile}
              data-testid={`report-profile-btn-${profile.user_id}`}
            >
              <Ionicons name="flag" size={20} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.photoOverlay}>
              <View style={styles.nameContainer}>
                <Text style={styles.profileName}>{profile.name}</Text>
                {profile.age && <Text style={styles.profileAge}>, {profile.age}</Text>}
                {profile.pronouns && profile.show_pronouns !== false && (
                  <View style={styles.pronounsBadge}>
                    <Text style={styles.pronounsText}>{profile.pronouns}</Text>
                  </View>
                )}
              </View>
              {profile.university && (
                <View style={styles.universityBadge}>
                  <Ionicons name="school" size={14} color="#fff" />
                  <Text style={styles.universityText}>{profile.university}</Text>
                </View>
              )}
              {typeof profile.distance_km === 'number' && (
                <View style={styles.distanceBadge} data-testid={`profile-distance-${profile.user_id}`}>
                  <Ionicons name="location" size={12} color="#fff" />
                  <Text style={styles.distanceText}>
                    {profile.distance_km < 1
                      ? '<1 km away'
                      : `${Math.round(profile.distance_km)} km away`}
                  </Text>
                </View>
              )}
            </View>
            <LikeButton 
              onPress={() => {}} 
              section="photo"
              disabled={!isCurrentProfile}
              profile={profile}
            />
          </View>

          {/* Course & Study Style Section */}
          {(profile.course || profile.study_style) && (
            <View style={styles.infoSection}>
              <View style={styles.infoContent}>
                <Ionicons name="book" size={20} color={t.accent} />
                <View style={styles.infoTextContainer}>
                  {profile.course && (
                    <Text style={styles.infoTitle}>{profile.course}</Text>
                  )}
                  {profile.study_style && (
                    <Text style={styles.infoSubtitle}>Study style: {profile.study_style}</Text>
                  )}
                </View>
              </View>
              <LikeButton 
                onPress={() => {}} 
                section="course"
                disabled={!isCurrentProfile}
                profile={profile}
              />
            </View>
          )}

          {/* Bio Section */}
          {profile.bio && (
            <View style={styles.infoSection}>
              <View style={styles.infoContent}>
                <Ionicons name="chatbubble-ellipses" size={20} color={t.success} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoTitle}>About me</Text>
                  <Text style={styles.bioText}>"{profile.bio}"</Text>
                </View>
              </View>
              <LikeButton 
                onPress={() => {}} 
                section="bio"
                disabled={!isCurrentProfile}
                profile={profile}
              />
            </View>
          )}

          {/* Interests Section */}
          {profile.interests && profile.interests.length > 0 && (
            <View style={styles.infoSection}>
              <View style={styles.infoContent}>
                <Ionicons name="sparkles" size={20} color="#F59E0B" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoTitle}>Interests</Text>
                  <View style={styles.interestTags}>
                    {profile.interests.map((interest, i) => (
                      <View key={`${profile.user_id}-interest-${interest}-${i}`} style={styles.interestTag}>
                        <Text style={styles.interestTagText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
              <LikeButton 
                onPress={() => {}} 
                section="interests"
                disabled={!isCurrentProfile}
                profile={profile}
              />
            </View>
          )}

          {/* Additional Photos */}
          {profile.photos && profile.photos.length > 1 && (
            <View style={styles.additionalPhotos}>
              {profile.photos.slice(1, 3).map((photo, i) => (
                <View key={`${profile.user_id}-photo-${i}-${photo.slice(-12)}`} style={styles.additionalPhotoContainer}>
                  <Image source={{ uri: photo }} style={styles.additionalPhoto} />
                  <LikeButton 
                    onPress={() => {}} 
                    section={`photo${i+2}`}
                    disabled={!isCurrentProfile}
                    profile={profile}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Next / Skip Signpost */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => handleSkip(profile)}
            disabled={!isCurrentProfile}
          >
            <Ionicons name="arrow-forward-circle" size={28} color={t.textFaint} />
            <Text style={styles.skipButtonText}>Next</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
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
      {/* Report Profile Modal */}
      <ReportProfileModal
        visible={reportTarget !== null}
        onClose={() => setReportTarget(null)}
        reportedUserId={reportTarget?.user_id || ''}
        reportedUserName={reportTarget?.name || 'this profile'}
        sessionToken={sessionToken}
      />

      {/* Match filters modal — premium gated */}
      <MatchFiltersModal
        visible={filterModalOpen}
        initial={filters}
        onClose={() => setFilterModalOpen(false)}
        hasLocation={hasLocation}
        onRequestLocation={requestAndSaveLocation}
        onApply={(next) => {
          setFilters(next);
          // Reload deck with the new filters applied
          setTimeout(() => loadProfiles(false), 0);
        }}
      />

      {/* Comment Modal */}
      <Modal
        visible={commentModal !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setCommentModal(null)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setCommentModal(null)} />
          <View style={styles.commentModalContent}>
            <View style={styles.commentModalHandle} />
            
            {commentModal && (
              <>
                <View style={styles.commentModalHeader}>
                  <View style={styles.commentModalAvatar}>
                    {commentModal.profile.photos?.[0] ? (
                      <Image 
                        source={{ uri: commentModal.profile.photos[0] }} 
                        style={styles.commentModalAvatarImage} 
                      />
                    ) : (
                      <LinearGradient 
                        colors={getAvatarGradient(commentModal.profile.name)} 
                        style={styles.commentModalAvatarImage}
                      >
                        <Text style={styles.commentModalAvatarText}>
                          {getInitials(commentModal.profile.name)}
                        </Text>
                      </LinearGradient>
                    )}
                  </View>
                  <View style={styles.commentModalInfo}>
                    <Text style={styles.commentModalName}>{commentModal.profile.name}</Text>
                    <Text style={styles.commentModalSection}>
                      You liked {commentModal.sectionLabel}
                    </Text>
                  </View>
                </View>

                <Text style={styles.commentPrompt}>
                  Add a comment to stand out! (optional)
                </Text>

                <View style={styles.commentInputContainer}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Say something nice..."
                    placeholderTextColor={t.textFaint}
                    value={comment}
                    onChangeText={setComment}
                    multiline
                    maxLength={200}
                    autoFocus
                  />
                  <Text style={styles.commentCounter}>{comment.length}/200</Text>
                </View>

                <View style={styles.commentActions}>
                  <TouchableOpacity 
                    style={styles.sendWithoutComment}
                    onPress={() => handleSendLike(false)}
                    disabled={isSending}
                  >
                    <Text style={styles.sendWithoutCommentText}>Send without comment</Text>
                  </TouchableOpacity>
                  
                  <Pressable 
                    onPress={() => handleSendLike(true)}
                    disabled={isSending || !comment.trim()}
                  >
                    <LinearGradient
                      colors={comment.trim() ? ['#EC4899', '#F472B6'] : ['#4B5563', '#6B7280']}
                      style={styles.sendWithCommentButton}
                    >
                      {isSending ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Ionicons name="heart" size={18} color="#fff" />
                          <Text style={styles.sendWithCommentText}>Send with comment</Text>
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <View style={styles.modalOverlay}>
          <View style={styles.upgradeModal}>
            <LinearGradient
              colors={['rgba(245, 158, 11, 0.2)', 'transparent']}
              style={styles.upgradeGlow}
            />
            <View style={styles.upgradeIcon}>
              <Ionicons name="diamond" size={48} color="#F59E0B" />
            </View>
            <Text style={styles.upgradeTitle}>Weekly like limit reached</Text>
            <Text style={styles.upgradeSubtitle}>
              You've used all 3 likes for this week.{'\n'}
              Likes refresh in {formatResetCountdown(swipeInfo.next_like_reset)} — or upgrade to Premium for unlimited likes now.
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
          </View>
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
              You and {matchAlert.user.name} liked each other
            </Text>
            <Pressable
              onPress={() => {
                const target = matchAlert;
                setMatchAlert(null);
                router.push(`/(main)/chat/${target.matchId}?name=${encodeURIComponent(target.user.name)}`);
              }}
              data-testid="match-say-hi-btn"
            >
              <LinearGradient
                colors={['#EC4899', '#F472B6']}
                style={[styles.matchButton, { marginBottom: 10 }]}
              >
                <Ionicons name="chatbubble" size={18} color="#fff" />
                <Text style={[styles.matchButtonText, { marginLeft: 8 }]}>
                  Say Hi to {matchAlert.user.name.split(' ')[0]}
                </Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={() => setMatchAlert(null)} data-testid="match-keep-browsing-btn">
              <View style={styles.matchSecondaryButton}>
                <Text style={styles.matchSecondaryButtonText}>Keep Browsing</Text>
              </View>
            </Pressable>
          </View>
        </View>
      )}

      {/* Top Banner with Swipe Counter */}
      <View style={styles.topBanner}>
        {/* Weekly Likes Counter — switches to a refresh-countdown when limit is hit */}
        {!swipeInfo.is_premium && (() => {
          const remaining = swipeInfo.remaining_likes_this_week ?? 0;
          const limitHit = remaining <= 0;
          return (
            <TouchableOpacity
              style={[styles.swipeBanner, limitHit && styles.swipeBannerLimit]}
              onPress={() => router.push('/(main)/subscription')}
              activeOpacity={0.8}
              data-testid={limitHit ? "likes-reset-banner" : "likes-remaining-banner"}
            >
              {limitHit ? (
                <View style={styles.swipeCounter}>
                  <Ionicons name="time-outline" size={16} color="#FBBF24" />
                  <Text style={styles.swipeResetText} numberOfLines={1}>
                    Likes refresh in {formatResetCountdown(swipeInfo.next_like_reset)}
                  </Text>
                </View>
              ) : (
                <View style={styles.swipeCounter}>
                  <View style={styles.swipeDotsContainer}>
                    {[...Array(3)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.swipeDot,
                          i < remaining && styles.swipeDotActive
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.swipeCounterText}>
                    {remaining} likes left this week
                  </Text>
                </View>
              )}
              <View style={styles.upgradeBadge}>
                <Ionicons name="diamond" size={14} color="#F59E0B" />
              </View>
            </TouchableOpacity>
          );
        })()}

        {/* Filter button — premium gated */}
        <TouchableOpacity
          onPress={() => {
            if (!swipeInfo?.is_premium) {
              setShowUpgradePrompt(true);
              return;
            }
            setFilterModalOpen(true);
          }}
          style={styles.filterPill}
          data-testid="open-filters-button"
        >
          <Ionicons name="options-outline" size={16} color="#1F2937" />
          <Text style={styles.filterPillText}>
            {Object.values(filters).filter(Boolean).length > 0
              ? `Filters · ${Object.values(filters).filter(Boolean).length}`
              : 'Filters'}
          </Text>
          {!swipeInfo?.is_premium && (
            <Ionicons name="lock-closed" size={12} color="#F59E0B" style={{ marginLeft: 4 }} />
          )}
        </TouchableOpacity>
      </View>

      {/* Profiles List */}
      {currentIndex >= profiles.length ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="search" size={48} color={t.textFaint} />
          </View>
          <Text style={styles.emptyTitle}>No More Profiles</Text>
          <Text style={styles.emptySubtitle}>
            Check back later for new study partners
          </Text>
          <Pressable onPress={() => loadProfiles(true)} data-testid="refresh-deck-button">
            <LinearGradient
              colors={t.ctaGradient}
              style={styles.refreshButton}
            >
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        <FlatList
          ref={scrollRef}
          data={profiles}
          renderItem={renderProfile}
          keyExtractor={(item) => item.user_id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          initialScrollIndex={currentIndex}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (t: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: t.textMuted,
    fontSize: 16,
    marginTop: 20,
    fontWeight: '500',
  },
  profileContainer: {
    width: width,
    height: height - 120,
  },
  profileScroll: {
    flex: 1,
  },
  profileScrollContent: {
    paddingBottom: 100,
  },
  photoSection: {
    width: width,
    height: height * 0.5,
    position: 'relative',
  },
  mainPhoto: {
    width: '100%',
    height: '100%',
  },
  mainPhotoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainPhotoInitials: {
    fontSize: 72,
    fontWeight: '700',
    color: '#fff',
  },
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 24,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  profileName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  profileAge: {
    fontSize: 26,
    color: '#fff',
    fontWeight: '400',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  universityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  universityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(91, 155, 213, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  distanceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  pronounsBadge: {
    backgroundColor: 'rgba(91, 155, 213, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  pronounsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  likeButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: t.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EC4899',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  likeButtonPressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: t.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: t.border,
  },
  infoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: t.text,
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 14,
    color: t.textMuted,
  },
  bioText: {
    fontSize: 15,
    color: t.textMuted,
    fontStyle: 'italic',
    lineHeight: 22,
    marginTop: 4,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(91, 155, 213, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestTagText: {
    fontSize: 13,
    color: '#818CF8',
    fontWeight: '500',
  },
  additionalPhotos: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  additionalPhotoContainer: {
    flex: 1,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  additionalPhoto: {
    width: '100%',
    height: '100%',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    gap: 8,
  },
  skipButtonText: {
    fontSize: 16,
    color: t.textFaint,
    fontWeight: '600',
  },
  topReportButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  bottomSpacer: {
    height: 100,
  },
  // Comment Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  commentModalContent: {
    backgroundColor: t.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  commentModalHandle: {
    width: 40,
    height: 4,
    backgroundColor: t.textFaint,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  commentModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  commentModalAvatar: {
    marginRight: 12,
  },
  commentModalAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentModalAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  commentModalInfo: {
    flex: 1,
  },
  commentModalName: {
    fontSize: 20,
    fontWeight: '700',
    color: t.text,
  },
  commentModalSection: {
    fontSize: 14,
    color: '#EC4899',
    marginTop: 2,
  },
  commentPrompt: {
    fontSize: 15,
    color: t.textMuted,
    marginBottom: 12,
  },
  commentInputContainer: {
    backgroundColor: t.bg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: t.border,
    padding: 16,
    marginBottom: 20,
  },
  commentInput: {
    color: t.text,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  commentCounter: {
    color: t.textFaint,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  commentActions: {
    gap: 12,
  },
  sendWithoutComment: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  sendWithoutCommentText: {
    color: t.textMuted,
    fontSize: 15,
    fontWeight: '500',
  },
  sendWithCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  sendWithCommentText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Other modals
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: t.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: t.textMuted,
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
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F2F5FA',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillText: { fontSize: 13, color: t.card, fontWeight: '700' },
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
    backgroundColor: t.card,
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
    color: t.text,
    marginBottom: 8,
  },
  upgradeSubtitle: {
    fontSize: 15,
    color: t.textMuted,
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
    color: t.textFaint,
    fontSize: 14,
  },
  matchModal: {
    backgroundColor: t.card,
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
    color: t.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  matchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 24,
  },
  matchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  matchSecondaryButton: {
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: t.border,
    alignItems: 'center',
  },
  matchSecondaryButtonText: {
    color: t.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  topBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  swipeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: t.card,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: t.border,
  },
  swipeBannerLimit: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  swipeResetText: {
    color: '#FBBF24',
    fontSize: 13,
    fontWeight: '600',
    maxWidth: 200,
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
    backgroundColor: t.border,
  },
  swipeDotActive: {
    backgroundColor: '#EC4899',
  },
  swipeCounterText: {
    color: t.textMuted,
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
