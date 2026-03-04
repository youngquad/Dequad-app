# Educare - Complete Source Code

## Table of Contents
1. [Backend - server.py](#backend-serverpy)
2. [Frontend - Landing Page (index.tsx)](#frontend-landing-page)
3. [Frontend - Matches Screen (matches.tsx)](#frontend-matches-screen)
4. [Frontend - Likes You Screen (likes-you.tsx)](#frontend-likes-you-screen)
5. [Frontend - Auth Context](#frontend-auth-context)
6. [Frontend - API Service](#frontend-api-service)
7. [Configuration Files](#configuration-files)

---


## Frontend - Landing Page
**File: `/app/frontend/app/index.tsx`**

```tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Animated,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const FEATURES = [
  { 
    icon: 'heart-outline', 
    title: 'Mood Tracking', 
    description: 'Track your daily emotional wellbeing',
    gradient: ['#EC4899', '#F472B6'],
  },
  { 
    icon: 'people-outline', 
    title: 'Find Friends', 
    description: 'Connect with like-minded students',
    gradient: ['#06B6D4', '#22D3EE'],
  },
  { 
    icon: 'chatbubbles-outline', 
    title: 'Safe Chat', 
    description: 'End-to-end encrypted messaging',
    gradient: ['#10B981', '#34D399'],
  },
];

export default function LandingScreen() {
  const router = useRouter();
  const { isLoading, login } = useAuth();
  const [isSigningIn, setIsSigningIn] = React.useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const featureAnims = useRef(FEATURES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 20,
        friction: 7,
      }),
    ]).start();

    // Staggered feature animations
    featureAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: 400 + (index * 100),
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handleLogin = async () => {
    setIsSigningIn(true);
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#0F172A', '#1E293B']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContent}>
          <View style={styles.loadingLogo}>
            <Ionicons name="school" size={48} color="#6366F1" />
          </View>
          <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 20 }} />
          <Text style={styles.loadingText}>Loading Educare...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#0F172A']}
        style={styles.gradient}
        locations={[0, 0.5, 1]}
      >
        {/* Decorative circles */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.1)']}
              style={styles.iconCircle}
            >
              <Ionicons name="school" size={56} color="#818CF8" />
            </LinearGradient>
            <Text style={styles.title}>Educare</Text>
            <Text style={styles.subtitle}>
              Your wellbeing companion for university life
            </Text>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresContainer}>
            {FEATURES.map((feature, index) => (
              <Animated.View
                key={feature.title}
                style={[
                  styles.featureCard,
                  {
                    opacity: featureAnims[index],
                    transform: [{
                      translateY: featureAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    }],
                  },
                ]}
              >
                <LinearGradient
                  colors={feature.gradient}
                  style={styles.featureIconBg}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={feature.icon as any} size={22} color="#fff" />
                </LinearGradient>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </Animated.View>
            ))}
          </View>

          {/* CTA Button */}
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleLogin}
            disabled={isSigningIn || isLoading}
          >
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButton}
              >
                {isSigningIn || isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={22} color="#fff" />
                    <Text style={styles.loginButtonText}>Continue with Google</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </Animated.View>
          </Pressable>

          {/* Stats/Trust badges */}
          <View style={styles.trustBadges}>
            <View style={styles.trustBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#10B981" />
              <Text style={styles.trustText}>Secure</Text>
            </View>
            <View style={styles.trustDivider} />
            <View style={styles.trustBadge}>
              <Ionicons name="lock-closed" size={16} color="#6366F1" />
              <Text style={styles.trustText}>Private</Text>
            </View>
            <View style={styles.trustDivider} />
            <View style={styles.trustBadge}>
              <Ionicons name="heart" size={16} color="#EC4899" />
              <Text style={styles.trustText}>Student-focused</Text>
            </View>
          </View>

          <Text style={styles.footerText}>
            Built with ❤️ for students everywhere
          </Text>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  gradient: {
    flex: 1,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -50,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingLogo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  featureCard: {
    width: '48%',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  featureIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  trustDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
    marginHorizontal: 14,
  },
  footerText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
  },
});
```

---

## Frontend - Matches Screen (Hinge-Style)
**File: `/app/frontend/app/(main)/matches.tsx`**

```tsx
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
            <View style={styles.photoOverlay}>
              <View style={styles.nameContainer}>
                <Text style={styles.profileName}>{profile.name}</Text>
                {profile.age && <Text style={styles.profileAge}>, {profile.age}</Text>}
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
    flex: 1,
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
```

---

## Frontend - Likes You Screen
**File: `/app/frontend/app/(main)/likes-you.tsx`**

```tsx
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
```

---


## Frontend - Auth Context
**File: `/app/frontend/src/contexts/AuthContext.tsx`**

```tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { api, API_URL } from '../services/api';

interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  role: string;
  interests: string[];
  university?: string;
  age?: number;
  study_style?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  sessionToken: string | null;
  setAdminSession: (token: string, userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const processSessionId = async (sessionId: string) => {
    try {
      console.log('Processing session_id:', sessionId);
      const response = await api.post('/auth/session', { session_id: sessionId });
      
      if (response.user && response.session_token) {
        setUser(response.user);
        setSessionToken(response.session_token);
        await AsyncStorage.setItem('session_token', response.session_token);
        console.log('Auth successful, user:', response.user.name);
      }
    } catch (error) {
      console.error('Session exchange error:', error);
    }
  };

  const checkExistingSession = async () => {
    try {
      const token = await AsyncStorage.getItem('session_token');
      if (token) {
        setSessionToken(token);
        const userData = await api.get('/auth/me', token);
        setUser(userData);
        console.log('Restored session for:', userData.name);
      }
    } catch (error) {
      console.error('Session check error:', error);
      await AsyncStorage.removeItem('session_token');
      setSessionToken(null);
      setUser(null);
    }
  };

  // Handle URL callback
  useEffect(() => {
    const handleUrl = async (url: string) => {
      console.log('Handling URL:', url);
      
      // Parse session_id from hash or query
      let sessionId = null;
      
      if (url.includes('#session_id=')) {
        sessionId = url.split('#session_id=')[1]?.split('&')[0];
      } else if (url.includes('?session_id=')) {
        sessionId = url.split('?session_id=')[1]?.split('&')[0];
      } else if (url.includes('session_id=')) {
        sessionId = url.split('session_id=')[1]?.split('&')[0];
      }
      
      if (sessionId) {
        await processSessionId(sessionId);
      }
    };

    // Cold start check
    const checkInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        await handleUrl(initialUrl);
      }
    };

    // Web platform check
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const hash = window.location.hash;
      const search = window.location.search;
      
      if (hash.includes('session_id=') || search.includes('session_id=')) {
        handleUrl(window.location.href);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    checkInitialUrl();

    // Listen for URL events
    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Check existing session on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await checkExistingSession();
      setIsLoading(false);
    };
    init();
  }, []);

  const login = async () => {
    try {
      const redirectUrl = Platform.OS === 'web'
        ? `${API_URL}/`
        : Linking.createURL('/');
      
      const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
      
      if (Platform.OS === 'web') {
        window.location.href = authUrl;
      } else {
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
        
        if (result.type === 'success' && result.url) {
          // Parse session_id from result URL
          let sessionId = null;
          const url = result.url;
          
          if (url.includes('#session_id=')) {
            sessionId = url.split('#session_id=')[1]?.split('&')[0];
          } else if (url.includes('?session_id=')) {
            sessionId = url.split('?session_id=')[1]?.split('&')[0];
          } else if (url.includes('session_id=')) {
            sessionId = url.split('session_id=')[1]?.split('&')[0];
          }
          
          if (sessionId) {
            await processSessionId(sessionId);
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    // Clear state first before API call to ensure immediate UI update
    setUser(null);
    setSessionToken(null);
    await AsyncStorage.removeItem('session_token');
    
    // Then try to invalidate session on backend (non-blocking)
    try {
      if (sessionToken) {
        await api.post('/auth/logout', {}, sessionToken);
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Ignore API errors - user is already logged out locally
    }
  };

  const refreshUser = async () => {
    if (sessionToken) {
      try {
        const userData = await api.get('/auth/me', sessionToken);
        setUser(userData);
      } catch (error) {
        console.error('Refresh user error:', error);
      }
    }
  };

  const setAdminSession = (token: string, userData: User) => {
    setSessionToken(token);
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
        sessionToken,
        setAdminSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

## Frontend - API Service
**File: `/app/frontend/src/services/api.ts`**

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || 'https://campus-connect-694.preview.emergentagent.com';
export const API_URL = BACKEND_URL;

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${BACKEND_URL}/api`;
  }

  private async getStoredToken(): Promise<string | null> {
    try {
      // On web, try localStorage first as it's more reliable
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        const webToken = window.localStorage.getItem('session_token');
        if (webToken) {
          return webToken;
        }
      }
      // Fall back to AsyncStorage
      return await AsyncStorage.getItem('session_token');
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    try {
      // Store in both localStorage (for web) and AsyncStorage (for mobile)
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('session_token', token);
      }
      await AsyncStorage.setItem('session_token', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  async clearToken(): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('session_token');
      }
      await AsyncStorage.removeItem('session_token');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  private async request(
    method: string,
    endpoint: string,
    data?: any,
    token?: string | null
  ) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Use provided token or fall back to stored token
    let authToken = token;
    if (!authToken) {
      authToken = await this.getStoredToken();
    }
    
    // Also check for admin_session_token if regular token not found
    if (!authToken && Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      authToken = window.localStorage.getItem('admin_session_token');
    }
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
      console.log(`API ${method} ${endpoint} - Token:`, authToken.substring(0, 25) + '...');
    }

    try {
      // Don't include credentials for admin endpoints to avoid cookie conflicts
      const isAdminEndpoint = endpoint.startsWith('/admin');
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        credentials: isAdminEndpoint ? 'omit' : 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API ${method} ${endpoint} error:`, error);
      throw error;
    }
  }

  async get(endpoint: string, token?: string | null) {
    return this.request('GET', endpoint, undefined, token);
  }

  async post(endpoint: string, data: any, token?: string | null) {
    return this.request('POST', endpoint, data, token);
  }

  async put(endpoint: string, data: any, token?: string | null) {
    return this.request('PUT', endpoint, data, token);
  }

  async delete(endpoint: string, token?: string | null) {
    return this.request('DELETE', endpoint, undefined, token);
  }
}

export const api = new ApiService();
```

---

## Frontend - Tab Navigation Layout
**File: `/app/frontend/app/(main)/_layout.tsx`**

```tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

// Custom Tab Bar Icon with indicator
function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  return (
    <View style={styles.tabIconContainer}>
      {focused && <View style={[styles.activeIndicator, { backgroundColor: color }]} />}
      <Ionicons name={name as any} size={24} color={color} />
    </View>
  );
}

export default function MainLayout() {
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
            <TabIcon name={focused ? 'chatbubbles' : 'chatbubbles-outline'} focused={focused} color={color} />
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
```

---


## Configuration Files

### package.json
**File: `/app/frontend/package.json`**

```json
{
  "name": "frontend",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start --web --port 3000 --lan",
    "start:mobile": "expo start",
    "reset-project": "node ./scripts/reset-project.js",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web --port 3000 --lan",
    "lint": "expo lint"
  },
  "dependencies": {
    "@expo/ngrok": "^4.1.3",
    "@expo/vector-icons": "^15.0.3",
    "@expo/webpack-config": "^19.0.1",
    "@react-native-async-storage/async-storage": "^2.2.0",
    "@react-navigation/bottom-tabs": "^7.3.10",
    "@react-navigation/elements": "^2.3.8",
    "@react-navigation/native": "^7.1.6",
    "@shopify/flash-list": "2.0.2",
    "@stripe/stripe-react-native": "0.50.3",
    "@types/crypto-js": "^4.2.2",
    "crypto-js": "^4.2.0",
    "expo": "^54.0.33",
    "expo-blur": "~15.0.8",
    "expo-build-properties": "^1.0.10",
    "expo-constants": "~18.0.13",
    "expo-device": "^8.0.10",
    "expo-font": "~14.0.11",
    "expo-haptics": "~15.0.8",
    "expo-image": "~3.0.11",
    "expo-image-picker": "^17.0.10",
    "expo-linear-gradient": "^15.0.8",
    "expo-linking": "^8.0.11",
    "expo-notifications": "^0.32.16",
    "expo-router": "~6.0.23",
    "expo-secure-store": "^15.0.8",
    "expo-splash-screen": "~31.0.13",
    "expo-status-bar": "~3.0.9",
    "expo-symbols": "~1.0.8",
    "expo-system-ui": "~6.0.9",
    "expo-web-browser": "^15.0.10",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-deck-swiper": "^1.1.7",
    "react-native-dotenv": "^3.4.11",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-gifted-charts": "^1.4.71",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-svg": "15.12.1",
    "react-native-web": "^0.21.2",
    "react-native-webview": "13.15.0",
    "socket.io-client": "^4.8.3"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@types/react": "~19.1.10",
    "eslint": "^9.25.0",
    "eslint-config-expo": "~10.0.0",
    "typescript": "~5.9.2"
  },
  "private": true,
  "packageManager": "yarn@1.22.22+sha512.a6b2f7906b721bba3d67d4aff083df04dad64c399707841b7acf00f6b133b7ac24255f2652fa22ae3534329dc6180534e98d17432037ff6fd140556e2bb3137e"
}
```

### requirements.txt
**File: `/app/backend/requirements.txt`**

```
fastapi==0.110.1
uvicorn==0.25.0
boto3>=1.34.129
requests-oauthlib>=2.0.0
cryptography>=42.0.8
python-dotenv>=1.0.1
pymongo==4.5.0
pydantic>=2.6.4
email-validator>=2.2.0
pyjwt>=2.10.1
bcrypt==4.1.3
passlib>=1.7.4
tzdata>=2024.2
motor==3.3.1
pytest>=8.0.0
black>=24.1.1
isort>=5.13.2
flake8>=7.0.0
mypy>=1.8.0
python-jose>=3.3.0
requests>=2.31.0
pandas>=2.2.0
numpy>=1.26.0
python-multipart>=0.0.9
jq>=1.6.0
typer>=0.9.0
emergentintegrations==0.1.0```

### app.json (Expo Config)
**File: `/app/frontend/app.json`**

```json
{
  "expo": {
    "name": "Educare",
    "slug": "educare",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "educare",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/images/splash-image.png",
      "resizeMode": "contain",
      "backgroundColor": "#0F172A"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.educare.wellbeing",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.educare.wellbeing",
      "versionCode": 2,
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#0F172A"
      }
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {},
      "eas": {
        "projectId": "0ad6a13c-845f-4ab4-9177-ba5031d2462d"
      }
    }
  }
}
```

---


## Backend - server.py

The backend server is 4000+ lines and is available in:
- **Separate file**: `/app/EDUCARE_BACKEND_SERVER.py`
- **ZIP archive**: `/app/educare-complete-code.zip`

### Key Backend Endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/google` | POST | Google OAuth login |
| `/api/auth/admin-login` | POST | Admin login |
| `/api/mood` | GET/POST | Mood tracking |
| `/api/feedback` | GET/POST | Lecture feedback |
| `/api/matches/discover` | GET | Get profiles to match |
| `/api/matches/swipe` | POST | Like/dislike with comment |
| `/api/matches/likes-received` | GET | Who liked you |
| `/api/chat/send` | POST | Send encrypted message |
| `/api/subscription/create-checkout` | POST | Stripe checkout |
| `/api/admin/stats` | GET | Admin dashboard stats |
| `/api/admin/users` | GET | User management |

### Test Profiles Seeded:
```python
test_profiles = [
    {"name": "Emma Wilson", "university": "Manchester", "course": "Computer Science"},
    {"name": "James Chen", "university": "Birmingham", "course": "Data Science"},
    {"name": "Sofia Martinez", "university": "Leeds", "course": "Psychology"},
    {"name": "Alex Thompson", "university": "Bristol", "course": "Environmental Science"},
    {"name": "Priya Patel", "university": "Warwick", "course": "Business Analytics"},
]
```

---

## Summary

### Files Created:
1. `/app/EDUCARE_COMPLETE_CODE.md` - This document with frontend code
2. `/app/EDUCARE_BACKEND_SERVER.py` - Complete backend server
3. `/app/educare-complete-code.zip` - ZIP archive of entire project
4. `/app/EDUCARE_CODE_OVERVIEW.md` - Project overview

### To Run Locally:
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# Frontend
cd frontend
yarn install
yarn start  # or npx expo start --web
```

