import React, { useState, useEffect, useRef } from 'react';
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
import { api } from '../../src/services/api';
import { useRouter } from 'expo-router';
import { MatchCardSkeleton } from '../../src/components/SkeletonLoader';

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
}

interface SwipeInfo {
  remaining_swipes: number | null;
  is_premium: boolean;
}

interface CommentModalData {
  profile: UserProfile;
  section: string;
  sectionLabel: string;
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
  const [likingSection, setLikingSection] = useState<string | null>(null);
  const [commentModal, setCommentModal] = useState<CommentModalData | null>(null);
  const [comment, setComment] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  
  const scrollRef = useRef<FlatList>(null);

  useEffect(() => {
    loadProfiles();
    loadSwipeStatus();
    loadLikesCount();
  }, []);

  const loadLikesCount = async () => {
    try {
      const data = await api.get('/matches/likes-received', sessionToken);
      setLikesCount(data.length);
    } catch (error) {
      console.error('Error loading likes count:', error);
    }
  };

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
    if (!swipeInfo.is_premium && swipeInfo.remaining_swipes !== null && swipeInfo.remaining_swipes <= 0) {
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
      
      if (result.is_mutual) {
        setMatchAlert(result.matched_user);
      }
      
      if (result.remaining_swipes !== null && result.remaining_swipes !== undefined) {
        setSwipeInfo(prev => ({
          ...prev,
          remaining_swipes: result.remaining_swipes
        }));
      }
      
      setCommentModal(null);
      setComment('');
      goToNext();
    } catch (error: any) {
      if (error?.message?.includes('Already swiped')) {
        setCommentModal(null);
        goToNext();
      }
      console.error('Like error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSkip = async (profile: UserProfile) => {
    if (!swipeInfo.is_premium && swipeInfo.remaining_swipes !== null && swipeInfo.remaining_swipes <= 0) {
      setShowUpgradePrompt(true);
      return;
    }

    try {
      const result = await api.post(
        '/matches/swipe',
        { target_user_id: profile.user_id, action: 'dislike' },
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
            
            {/* Skip Button - Top Left */}
            <TouchableOpacity 
              style={styles.topSkipButton}
              onPress={() => handleSkip(profile)}
              disabled={!isCurrentProfile}
            >
              <Ionicons name="close" size={28} color="#fff" />
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
                <Ionicons name="book" size={20} color="#6366F1" />
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
                <Ionicons name="chatbubble-ellipses" size={20} color="#10B981" />
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
                      <View key={i} style={styles.interestTag}>
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

          {/* Match Score */}
          {profile.match_score !== undefined && (
            <View style={styles.matchScoreSection}>
              <LinearGradient
                colors={['rgba(245, 158, 11, 0.15)', 'rgba(251, 191, 36, 0.1)']}
                style={styles.matchScoreCard}
              >
                <Ionicons name="star" size={24} color="#F59E0B" />
                <Text style={styles.matchScoreText}>
                  {Math.round(profile.match_score * 100)}% Match
                </Text>
                <Text style={styles.matchScoreSubtext}>Based on shared interests & preferences</Text>
              </LinearGradient>
            </View>
          )}

          {/* Additional Photos */}
          {profile.photos && profile.photos.length > 1 && (
            <View style={styles.additionalPhotos}>
              {profile.photos.slice(1, 3).map((photo, i) => (
                <View key={i} style={styles.additionalPhotoContainer}>
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

          {/* Skip Button */}
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={() => handleSkip(profile)}
            disabled={!isCurrentProfile}
          >
            <Ionicons name="close" size={24} color="#64748B" />
            <Text style={styles.skipButtonText}>Skip</Text>
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
                    placeholderTextColor="#64748B"
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
            <Text style={styles.upgradeTitle}>Daily Limit Reached</Text>
            <Text style={styles.upgradeSubtitle}>
              You've used all 5 likes for today.{'\n'}Upgrade to Premium for unlimited connections!
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
              You and {matchAlert.name} liked each other
            </Text>
            <Pressable onPress={() => setMatchAlert(null)}>
              <LinearGradient
                colors={['#EC4899', '#F472B6']}
                style={styles.matchButton}
              >
                <Text style={styles.matchButtonText}>Keep Browsing</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      )}

      {/* Top Banner with Likes You & Swipe Counter */}
      <View style={styles.topBanner}>
        {/* Likes You Button */}
        <TouchableOpacity 
          style={styles.likesYouButton}
          onPress={() => router.push('/(main)/likes-you')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(236, 72, 153, 0.2)', 'rgba(244, 114, 182, 0.1)']}
            style={styles.likesYouGradient}
          >
            <Ionicons name="heart" size={18} color="#EC4899" />
            <Text style={styles.likesYouText}>Likes You</Text>
            {likesCount > 0 && (
              <View style={styles.likesCountBadge}>
                <Text style={styles.likesCountText}>{likesCount}</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Swipe Counter */}
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
                {swipeInfo.remaining_swipes || 0} left
              </Text>
            </View>
            <View style={styles.upgradeBadge}>
              <Ionicons name="diamond" size={14} color="#F59E0B" />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Profiles List */}
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
    backgroundColor: '#1E293B',
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
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
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
    color: '#F8FAFC',
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  bioText: {
    fontSize: 15,
    color: '#CBD5E1',
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
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestTagText: {
    fontSize: 13,
    color: '#818CF8',
    fontWeight: '500',
  },
  matchScoreSection: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  matchScoreCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  matchScoreText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F59E0B',
    marginTop: 8,
  },
  matchScoreSubtext: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
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
    color: '#64748B',
    fontWeight: '600',
  },
  topSkipButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  commentModalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#4B5563',
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
    color: '#F8FAFC',
  },
  commentModalSection: {
    fontSize: 14,
    color: '#EC4899',
    marginTop: 2,
  },
  commentPrompt: {
    fontSize: 15,
    color: '#94A3B8',
    marginBottom: 12,
  },
  commentInputContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    padding: 16,
    marginBottom: 20,
  },
  commentInput: {
    color: '#F8FAFC',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  commentCounter: {
    color: '#64748B',
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
    color: '#94A3B8',
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
  topBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  likesYouButton: {
    flex: 1,
  },
  likesYouGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
    gap: 8,
  },
  likesYouText: {
    color: '#EC4899',
    fontSize: 14,
    fontWeight: '600',
  },
  likesCountBadge: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 22,
    alignItems: 'center',
  },
  likesCountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  swipeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    paddingHorizontal: 12,
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
    backgroundColor: '#EC4899',
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
