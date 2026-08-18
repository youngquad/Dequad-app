import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Platform, StyleSheet, View } from 'react-native';

const COLORS = ['#5B9BD5', '#EC4899', '#F59E0B', '#4FB89F', '#F472B6', '#FFD166', '#8B5CF6', '#60A5FA'];

interface Piece {
  x: number;
  delay: number;
  duration: number;
  drift: number;
  size: number;
  color: string;
  rounded: boolean;
  spin: number;
  progress: Animated.Value;
}

export const ConfettiBurst = ({ count = 40 }: { count?: number }) => {
  const { width, height } = Dimensions.get('window');
  const pieces = useRef<Piece[]>(
    Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width,
      delay: Math.random() * 500,
      duration: 2400 + Math.random() * 1600,
      drift: (Math.random() - 0.5) * 180,
      size: 7 + Math.random() * 8,
      color: COLORS[i % COLORS.length],
      rounded: Math.random() > 0.5,
      spin: Math.random() > 0.5 ? 1 : -1,
      progress: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    const anims = pieces.map((p) =>
      Animated.timing(p.progress, {
        toValue: 1,
        duration: p.duration,
        delay: p.delay,
        easing: Easing.in(Easing.quad),
        useNativeDriver: Platform.OS !== 'web',
      }),
    );
    Animated.parallel(anims).start();
  }, [pieces]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" data-testid="match-confetti">
      {pieces.map((p, i) => {
        const translateY = p.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [-40, height + 60],
        });
        const translateX = p.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, p.drift],
        });
        const rotate = p.progress.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${p.spin * 900}deg`],
        });
        const opacity = p.progress.interpolate({
          inputRange: [0, 0.75, 1],
          outputRange: [1, 1, 0],
        });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              top: 0,
              left: p.x,
              width: p.size,
              height: p.size * (p.rounded ? 1 : 0.5),
              borderRadius: p.rounded ? p.size / 2 : 2,
              backgroundColor: p.color,
              opacity,
              transform: [{ translateY }, { translateX }, { rotate }],
            }}
          />
        );
      })}
    </View>
  );
};

export default ConfettiBurst;
