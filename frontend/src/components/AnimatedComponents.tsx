import React, { useEffect, useRef } from 'react';
import { 
  TouchableOpacity, 
  Animated, 
  StyleSheet, 
  View, 
  Text,
  Pressable,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'premium';
}

export function AnimatedButton({ 
  onPress, 
  children, 
  style, 
  disabled = false,
  variant = 'primary' 
}: AnimatedButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'danger':
        return styles.dangerButton;
      case 'premium':
        return styles.premiumButton;
      default:
        return styles.primaryButton;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.button,
          getVariantStyle(),
          { transform: [{ scale: scaleAnim }] },
          disabled && styles.disabledButton,
          style,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

// Animated card with hover/press effect
interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function AnimatedCard({ children, onPress, style }: AnimatedCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const elevationAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 50,
      }),
      Animated.timing(elevationAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
      }),
      Animated.timing(elevationAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: scaleAnim }] },
            style,
          ]}
        >
          {children}
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Animated.View style={[styles.card, style]}>
      {children}
    </Animated.View>
  );
}

// Animated mood emoji
interface AnimatedMoodProps {
  mood: number;
  isSelected: boolean;
  onPress: () => void;
  color: string;
}

export function AnimatedMoodEmoji({ mood, isSelected, onPress, color }: AnimatedMoodProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
          speed: 50,
          bounciness: 12,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
          speed: 50,
        }),
      ]).start();

      // Bounce animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
      bounceAnim.setValue(0);
    }
  }, [isSelected]);

  const getMoodEmoji = () => {
    if (mood <= 3) return '😢';
    if (mood <= 5) return '😐';
    if (mood <= 7) return '🙂';
    if (mood <= 9) return '😊';
    return '🤩';
  };

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={[
          styles.moodEmoji,
          isSelected && { backgroundColor: color + '30', borderColor: color },
          {
            transform: [
              { scale: scaleAnim },
              { translateY: isSelected ? bounceAnim : 0 },
            ],
          },
        ]}
      >
        <Text style={styles.moodEmojiText}>{getMoodEmoji()}</Text>
        <Text style={[styles.moodNumber, isSelected && { color }]}>{mood}</Text>
      </Animated.View>
    </Pressable>
  );
}

// Floating action button with pulse
interface FabProps {
  onPress: () => void;
  icon: string;
  color?: string;
}

export function FloatingActionButton({ onPress, icon, color = '#6366F1' }: FabProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          useNativeDriver: true,
        }).start();
      }}
      onPressOut={() => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }}
    >
      <View style={styles.fabContainer}>
        <Animated.View
          style={[
            styles.fabPulse,
            {
              backgroundColor: color + '30',
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.fab,
            { backgroundColor: color, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Ionicons name={icon as any} size={28} color="#fff" />
        </Animated.View>
      </View>
    </Pressable>
  );
}

// Success checkmark animation
export function SuccessAnimation({ visible }: { visible: boolean }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 15,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.successContainer,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.successCircle}>
        <Ionicons name="checkmark" size={48} color="#fff" />
      </View>
      <Text style={styles.successText}>Success!</Text>
    </Animated.View>
  );
}

// Gradient badge
interface GradientBadgeProps {
  text: string;
  colors?: string[];
  icon?: string;
}

export function GradientBadge({ text, colors = ['#6366F1', '#8B5CF6'], icon }: GradientBadgeProps) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientBadge}
    >
      {icon && <Ionicons name={icon as any} size={14} color="#fff" style={{ marginRight: 4 }} />}
      <Text style={styles.gradientBadgeText}>{text}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
  },
  secondaryButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  dangerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  premiumButton: {
    backgroundColor: '#F59E0B',
  },
  disabledButton: {
    opacity: 0.5,
  },
  card: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  moodEmoji: {
    width: 64,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  moodEmojiText: {
    fontSize: 28,
  },
  moodNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginTop: 4,
  },
  fabContainer: {
    position: 'relative',
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabPulse: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 100,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  gradientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  gradientBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AnimatedButton;
