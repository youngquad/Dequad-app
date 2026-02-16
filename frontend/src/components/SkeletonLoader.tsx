import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width: w = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: w, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

// Skeleton for mood cards
export function MoodCardSkeleton() {
  return (
    <View style={styles.moodCard}>
      <Skeleton width={48} height={48} borderRadius={24} />
      <View style={styles.moodCardContent}>
        <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={12} />
      </View>
    </View>
  );
}

// Skeleton for match cards
export function MatchCardSkeleton() {
  return (
    <View style={styles.matchCard}>
      <Skeleton width={100} height={100} borderRadius={50} style={{ alignSelf: 'center', marginBottom: 16 }} />
      <Skeleton width="70%" height={24} style={{ alignSelf: 'center', marginBottom: 8 }} />
      <Skeleton width="50%" height={16} style={{ alignSelf: 'center', marginBottom: 16 }} />
      <View style={styles.matchTags}>
        <Skeleton width={80} height={28} borderRadius={14} />
        <Skeleton width={60} height={28} borderRadius={14} />
        <Skeleton width={70} height={28} borderRadius={14} />
      </View>
    </View>
  );
}

// Skeleton for chat messages
export function ChatMessageSkeleton({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <View style={[styles.chatMessage, isOwn && styles.chatMessageOwn]}>
      <Skeleton 
        width={isOwn ? 200 : 180} 
        height={40} 
        borderRadius={16} 
      />
      <Skeleton width={60} height={10} style={{ marginTop: 4 }} />
    </View>
  );
}

// Skeleton for profile
export function ProfileSkeleton() {
  return (
    <View style={styles.profileSkeleton}>
      <Skeleton width={100} height={100} borderRadius={50} style={{ alignSelf: 'center', marginBottom: 16 }} />
      <Skeleton width="60%" height={24} style={{ alignSelf: 'center', marginBottom: 8 }} />
      <Skeleton width="40%" height={16} style={{ alignSelf: 'center', marginBottom: 24 }} />
      <Skeleton width="100%" height={60} borderRadius={12} style={{ marginBottom: 12 }} />
      <Skeleton width="100%" height={60} borderRadius={12} style={{ marginBottom: 12 }} />
      <Skeleton width="100%" height={60} borderRadius={12} />
    </View>
  );
}

// Full screen loading with skeleton
export function ScreenSkeleton({ type = 'list' }: { type?: 'list' | 'card' | 'profile' }) {
  if (type === 'profile') {
    return <ProfileSkeleton />;
  }
  
  if (type === 'card') {
    return <MatchCardSkeleton />;
  }

  return (
    <View style={styles.screenSkeleton}>
      {[1, 2, 3, 4].map((i) => (
        <MoodCardSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  moodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  moodCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  matchCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    borderRadius: 20,
    padding: 24,
    width: width - 40,
  },
  matchTags: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  chatMessage: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  chatMessageOwn: {
    alignItems: 'flex-end',
  },
  profileSkeleton: {
    padding: 20,
  },
  screenSkeleton: {
    padding: 20,
  },
});

export default Skeleton;
