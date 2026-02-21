import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
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
  match_score?: number;
  prompts?: { question: string; answer: string }[];
}

interface SwipeInfo {
  remaining_swipes: number | null;
  is_premium: boolean;
}

interface LikeTarget {
  type: 'photo' | 'prompt' | 'profile';
  index?: number;
  content?: string;
}

// Default prompts for users without custom prompts
const DEFAULT_PROMPTS = [
  { question: "I'm looking for...", answer: "Study partners who are motivated and supportive" },
  { question: "My ideal study session...", answer: "Coffee, good music, and focused work" },
  { question: "A fact about me...", answer: "I love learning new things!" },
];

export default function MatchesScreen() {
  const router = useRouter();
  const { sessionToken } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [matchAlert, setMatchAlert] = useState<UserProfile | null>(null);
  const [swipeInfo, setSwipeInfo] = useState<SwipeInfo>({ remaining_swipes: 5, is_premium: false });
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [likeTarget, setLikeTarget] = useState<LikeTarget | null>(null);
  const [comment, setComment] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadProfiles();
    loadSwipeStatus();
  }, []);

  useEffect(() => {
    // Fade in animation when profile changes
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    
    // Scroll to top when profile changes
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentIndex]);

  const loadProfiles = async () => {
    try {
      const data = await api.get('/matches/discover', sessionToken);
      // Add default prompts to users who don't have them
      const profilesWithPrompts = data.map((profile: UserProfile) => ({
        ...profile,
        prompts: profile.prompts && profile.prompts.length > 0 ? profile.prompts : DEFAULT_PROMPTS,
      }));
      setProfiles(profilesWithPrompts);
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

  const handleLikePress = (target: LikeTarget) => {
    if (!swipeInfo.is_premium && swipeInfo.remaining_swipes !== null && swipeInfo.remaining_swipes <= 0) {
      setShowUpgradePrompt(true);
      return;
    }
    setLikeTarget(target);
    setComment('');
    setShowCommentModal(true);
  };

  const sendLike = async (withComment: boolean = false) => {
    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    setShowCommentModal(false);

    try {
      const result = await api.post(
        '/matches/swipe',
        { 
          target_user_id: currentProfile.user_id, 
          action: 'like',
          like_type: likeTarget?.type || 'profile',
          like_content: likeTarget?.content || '',
          comment: withComment ? comment : ''
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
      
      goToNext();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        setShowUpgradePrompt(true);
      } else if (error?.response?.status === 400) {
        const detail = error?.response?.data?.detail;
        if (detail && (detail.includes('Already swiped') || detail.includes('already swiped'))) {
          goToNext();
        }
      }
      console.error('Like error:', error?.response?.data || error);
    }
    
    setLikeTarget(null);
    setComment('');
  };

  const handlePass = async () => {
    if (!swipeInfo.is_premium && swipeInfo.remaining_swipes !== null && swipeInfo.remaining_swipes <= 0) {
      setShowUpgradePrompt(true);
      return;
    }

    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

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
      if (error?.response?.status === 400) {
        const detail = error?.response?.data?.detail;
        if (detail && (detail.includes('Already swiped') || detail.includes('already swiped'))) {
          goToNext();
        }
      }
      console.error('Pass error:', error?.response?.data || error);
    }
  };

  const goToNext = () => {
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

  const getProfileImage = (profile: UserProfile) => {
    const hasPhoto = profile.photos && profile.photos.length > 0 && profile.photos[0] && profile.photos[0].trim() !== '';
    if (hasPhoto) return profile.photos![0];
    if (profile.picture && profile.picture.trim() !== '') return profile.picture;
    return null;
  };

  const currentProfile = profiles[currentIndex];

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
        visible={showCommentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCommentModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.commentModal}>
            <View style={styles.commentModalHeader}>
              <Text style={styles.commentModalTitle}>Send a Like</Text>
              <TouchableOpacity onPress={() => setShowCommentModal(false)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            
            {likeTarget && (
              <View style={styles.likePreview}>
                <Text style={styles.likePreviewLabel}>
                  {likeTarget.type === 'photo' ? '📸 Liked their photo' : 
                   likeTarget.type === 'prompt' ? '💬 Liked their answer' : '❤️ Liked their profile'}
                </Text>
                {likeTarget.content && (
                  <Text style={styles.likePreviewContent} numberOfLines={2}>
                    "{likeTarget.content}"
                  </Text>
                )}
              </View>
            )}

            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment (optional)..."
              placeholderTextColor="#64748B"
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={200}
            />

            <View style={styles.commentActions}>
              <TouchableOpacity 
                style={styles.sendWithoutComment}
                onPress={() => sendLike(false)}
              >
                <Text style={styles.sendWithoutCommentText}>Send without comment</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.sendWithComment, !comment.trim() && styles.sendWithCommentDisabled]}
                onPress={() => sendLike(true)}
                disabled={!comment.trim()}
              >
                <LinearGradient
                  colors={comment.trim() ? ['#EC4899', '#F472B6'] : ['#475569', '#475569']}
                  style={styles.sendButtonGradient}
                >
                  <Ionicons name="send" size={18} color="#fff" />
                  <Text style={styles.sendButtonText}>Send</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
            <TouchableOpacity
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
            <TouchableOpacity onPress={() => setMatchAlert(null)}>
              <LinearGradient
                colors={['#EC4899', '#F472B6']}
                style={styles.matchButton}
              >
                <Text style={styles.matchButtonText}>Keep Browsing</Text>
              </LinearGradient>
            </TouchableOpacity>
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
              {swipeInfo.remaining_swipes || 0} likes left today
            </Text>
          </View>
          <View style={styles.upgradeBadge}>
            <Ionicons name="diamond" size={14} color="#F59E0B" />
            <Text style={styles.upgradeBadgeText}>Go Premium</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Main Content */}
      {currentIndex >= profiles.length ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="search" size={48} color="#64748B" />
          </View>
          <Text style={styles.emptyTitle}>No More Profiles</Text>
          <Text style={styles.emptySubtitle}>
            Check back later for new study partners
          </Text>
          <TouchableOpacity onPress={loadProfiles}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.refreshButton}
            >
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : currentProfile && (
        <Animated.View style={[styles.profileContainer, { opacity: fadeAnim }]}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Main Photo Section */}
            <View style={styles.photoSection}>
              {getProfileImage(currentProfile) ? (
                <Image 
                  source={{ uri: getProfileImage(currentProfile)! }} 
                  style={styles.mainPhoto}
                />
              ) : (
                <LinearGradient 
                  colors={getAvatarGradient(currentProfile.name)} 
                  style={styles.mainPhotoPlaceholder}
                >
                  <Text style={styles.mainPhotoInitials}>{getInitials(currentProfile.name)}</Text>
                </LinearGradient>
              )}
              
              {/* Like Photo Button */}
              <TouchableOpacity 
                style={styles.likePhotoButton}
                onPress={() => handleLikePress({ type: 'photo', content: 'their photo' })}
              >
                <LinearGradient
                  colors={['rgba(236, 72, 153, 0.9)', 'rgba(244, 114, 182, 0.9)']}
                  style={styles.likeButtonGradient}
                >
                  <Ionicons name="heart" size={24} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>

              {/* Name & Basic Info Overlay */}
              <LinearGradient
                colors={['transparent', 'rgba(15, 23, 42, 0.95)']}
                style={styles.photoOverlay}
              >
                <View style={styles.basicInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.profileName}>{currentProfile.name}</Text>
                    {currentProfile.age && <Text style={styles.profileAge}>, {currentProfile.age}</Text>}
                  </View>
                  
                  {/* University - Prominently displayed */}
                  {currentProfile.university && (
                    <View style={styles.universityBadge}>
                      <Ionicons name="school" size={16} color="#F59E0B" />
                      <Text style={styles.universityText}>{currentProfile.university}</Text>
                    </View>
                  )}
                  
                  {currentProfile.course && (
                    <View style={styles.infoRow}>
                      <Ionicons name="book" size={14} color="#94A3B8" />
                      <Text style={styles.infoText}>{currentProfile.course}</Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </View>

            {/* Match Score */}
            {currentProfile.match_score !== undefined && (
              <View style={styles.matchScoreSection}>
                <LinearGradient
                  colors={['rgba(245, 158, 11, 0.15)', 'rgba(251, 191, 36, 0.1)']}
                  style={styles.matchScoreBg}
                >
                  <Ionicons name="star" size={18} color="#F59E0B" />
                  <Text style={styles.matchScoreText}>
                    {Math.round(currentProfile.match_score * 100)}% Match
                  </Text>
                </LinearGradient>
              </View>
            )}

            {/* Interests */}
            {currentProfile.interests && currentProfile.interests.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Interests</Text>
                <View style={styles.interestTags}>
                  {currentProfile.interests.map((interest, i) => (
                    <View key={i} style={styles.interestTag}>
                      <Text style={styles.interestTagText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Prompts Section */}
            {currentProfile.prompts && currentProfile.prompts.length > 0 && (
              <View style={styles.promptsSection}>
                {currentProfile.prompts.map((prompt, index) => (
                  <View key={index} style={styles.promptCard}>
                    <Text style={styles.promptQuestion}>{prompt.question}</Text>
                    <Text style={styles.promptAnswer}>{prompt.answer}</Text>
                    
                    {/* Like Prompt Button */}
                    <TouchableOpacity 
                      style={styles.likePromptButton}
                      onPress={() => handleLikePress({ 
                        type: 'prompt', 
                        index, 
                        content: prompt.answer 
                      })}
                    >
                      <Ionicons name="heart-outline" size={22} color="#EC4899" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Additional Photos */}
            {currentProfile.photos && currentProfile.photos.length > 1 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>More Photos</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.additionalPhotosScroll}
                >
                  {currentProfile.photos.slice(1).map((photo, index) => (
                    photo && photo.trim() !== '' && (
                      <TouchableOpacity 
                        key={index} 
                        style={styles.additionalPhotoContainer}
                        onPress={() => handleLikePress({ type: 'photo', index: index + 1, content: 'their photo' })}
                      >
                        <Image source={{ uri: photo }} style={styles.additionalPhoto} />
                        <View style={styles.additionalPhotoLike}>
                          <Ionicons name="heart-outline" size={18} color="#fff" />
                        </View>
                      </TouchableOpacity>
                    )
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Bio */}
            {currentProfile.bio && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <View style={styles.bioCard}>
                  <Text style={styles.bioText}>{currentProfile.bio}</Text>
                </View>
              </View>
            )}

            {/* Study Style */}
            {currentProfile.study_style && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Study Style</Text>
                <View style={styles.studyStyleBadge}>
                  <Ionicons name="library" size={16} color="#6366F1" />
                  <Text style={styles.studyStyleText}>{currentProfile.study_style}</Text>
                </View>
              </View>
            )}

            {/* Spacer for bottom buttons */}
            <View style={{ height: 120 }} />
          </ScrollView>

          {/* Bottom Action Buttons */}
          <View style={styles.bottomActions}>
            <TouchableOpacity 
              style={styles.passButton}
              onPress={handlePass}
            >
              <Ionicons name="close" size={28} color="#EF4444" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.mainLikeButton}
              onPress={() => handleLikePress({ type: 'profile' })}
            >
              <LinearGradient
                colors={['#EC4899', '#F472B6']}
                style={styles.mainLikeGradient}
              >
                <Ionicons name="heart" size={28} color="#fff" />
                <Text style={styles.mainLikeText}>Like</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
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
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  photoSection: {
    width: width,
    height: height * 0.55,
    position: 'relative',
  },
  mainPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mainPhotoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainPhotoInitials: {
    fontSize: 80,
    fontWeight: '700',
    color: '#fff',
  },
  likePhotoButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 10,
  },
  likeButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  basicInfo: {
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  profileName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  profileAge: {
    fontSize: 28,
    color: '#CBD5E1',
    fontWeight: '400',
  },
  universityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 6,
  },
  universityText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  matchScoreSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  matchScoreBg: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    alignSelf: 'flex-start',
  },
  matchScoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F59E0B',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  interestTagText: {
    fontSize: 14,
    color: '#818CF8',
    fontWeight: '500',
  },
  promptsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  promptCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
    position: 'relative',
  },
  promptQuestion: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  promptAnswer: {
    fontSize: 18,
    color: '#F8FAFC',
    lineHeight: 26,
    fontWeight: '500',
    paddingRight: 40,
  },
  likePromptButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  additionalPhotosScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  additionalPhotoContainer: {
    marginRight: 12,
    position: 'relative',
  },
  additionalPhoto: {
    width: 150,
    height: 200,
    borderRadius: 16,
  },
  additionalPhotoLike: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bioCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  bioText: {
    fontSize: 15,
    color: '#CBD5E1',
    lineHeight: 24,
  },
  studyStyleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 8,
  },
  studyStyleText: {
    fontSize: 14,
    color: '#818CF8',
    fontWeight: '500',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: 90,
    gap: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.1)',
  },
  passButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 2,
    borderColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainLikeButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  mainLikeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 8,
  },
  mainLikeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  commentModal: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  commentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  commentModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  likePreview: {
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  likePreviewLabel: {
    fontSize: 14,
    color: '#EC4899',
    fontWeight: '500',
  },
  likePreviewContent: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 6,
    fontStyle: 'italic',
  },
  commentInput: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    color: '#F8FAFC',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  sendWithoutComment: {
    paddingVertical: 12,
  },
  sendWithoutCommentText: {
    color: '#64748B',
    fontSize: 14,
  },
  sendWithComment: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  sendWithCommentDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  upgradeModal: {
    backgroundColor: '#1E293B',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 100,
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
    marginHorizontal: 24,
    marginBottom: 100,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
});
