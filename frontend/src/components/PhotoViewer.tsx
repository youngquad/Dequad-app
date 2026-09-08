import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Modal, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { haptic } from '../utils/haptics';

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;

interface ZoomableProps {
  uri: string;
  width: number;
  height: number;
  onZoomChange: (zoomed: boolean) => void;
  testID?: string;
}

function ZoomableImage({ uri, width, height, onZoomChange, testID }: ZoomableProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  const saved = useRef({ scale: 1, x: 0, y: 0 });
  const [zoomed, setZoomed] = useState(false);

  const setZoomedState = (s: number) => {
    const z = s > 1.02;
    if (z !== zoomed) { setZoomed(z); onZoomChange(z); }
  };

  const clampTranslate = (s: number, x: number, y: number) => {
    const maxX = (width * (s - 1)) / 2;
    const maxY = (height * (s - 1)) / 2;
    return { x: Math.max(-maxX, Math.min(maxX, x)), y: Math.max(-maxY, Math.min(maxY, y)) };
  };

  const animateTo = (s: number, x: number, y: number) => {
    saved.current = { scale: s, x, y };
    Animated.parallel([
      Animated.spring(scale, { toValue: s, useNativeDriver: false, bounciness: 2 }),
      Animated.spring(tx, { toValue: x, useNativeDriver: false, bounciness: 2 }),
      Animated.spring(ty, { toValue: y, useNativeDriver: false, bounciness: 2 }),
    ]).start();
    setZoomedState(s);
  };

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      const s = Math.max(1, Math.min(MAX_SCALE, saved.current.scale * e.scale));
      scale.setValue(s);
      setZoomedState(s);
    })
    .onEnd((e) => {
      const s = Math.max(1, Math.min(MAX_SCALE, saved.current.scale * e.scale));
      if (s <= 1.05) animateTo(1, 0, 0);
      else {
        const c = clampTranslate(s, saved.current.x, saved.current.y);
        animateTo(s, c.x, c.y);
      }
    })
    .runOnJS(true);

  const pan = Gesture.Pan()
    .enabled(zoomed)
    .minPointers(1)
    .maxPointers(2)
    .onUpdate((e) => {
      const c = clampTranslate(saved.current.scale, saved.current.x + e.translationX, saved.current.y + e.translationY);
      tx.setValue(c.x);
      ty.setValue(c.y);
    })
    .onEnd((e) => {
      const c = clampTranslate(saved.current.scale, saved.current.x + e.translationX, saved.current.y + e.translationY);
      saved.current = { ...saved.current, x: c.x, y: c.y };
    })
    .runOnJS(true);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e) => {
      haptic.light();
      if (saved.current.scale > 1.05) return animateTo(1, 0, 0);
      // Zoom towards the tapped point.
      const fx = (width / 2 - e.x) * (DOUBLE_TAP_SCALE - 1);
      const fy = (height / 2 - e.y) * (DOUBLE_TAP_SCALE - 1);
      const c = clampTranslate(DOUBLE_TAP_SCALE, fx, fy);
      animateTo(DOUBLE_TAP_SCALE, c.x, c.y);
    })
    .runOnJS(true);

  const gesture = Gesture.Simultaneous(pinch, pan, doubleTap);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={{ width, height, transform: [{ translateX: tx }, { translateY: ty }, { scale }] }}
        testID={testID}
      >
        <Image source={{ uri }} style={{ width, height }} contentFit="contain" cachePolicy="memory-disk" transition={150} />
      </Animated.View>
    </GestureDetector>
  );
}

interface PhotoViewerProps {
  visible: boolean;
  photos: string[];
  initialIndex?: number;
  title?: string;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

export default function PhotoViewer({ visible, photos, initialIndex = 0, title, onClose, onIndexChange }: PhotoViewerProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const listRef = useRef<FlatList<string>>(null);

  useEffect(() => {
    if (visible) { setIndex(initialIndex); setZoomed(false); }
  }, [visible, initialIndex]);

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(i, photos.length - 1));
    listRef.current?.scrollToIndex({ index: clamped, animated: true });
    setIndex(clamped);
    onIndexChange?.(clamped);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <GestureHandlerRootView style={styles.root}>
        <View style={styles.backdrop} testID="photo-viewer">
          <FlatList
            ref={listRef}
            data={photos}
            horizontal
            pagingEnabled
            scrollEnabled={!zoomed}
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialIndex}
            keyExtractor={(uri, i) => `${i}-${uri}`}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            onMomentumScrollEnd={(e) => {
              const i = Math.round(e.nativeEvent.contentOffset.x / width);
              if (i !== index) { setIndex(i); onIndexChange?.(i); }
            }}
            renderItem={({ item, index: i }) => (
              <View style={{ width, height, justifyContent: 'center' }}>
                <ZoomableImage uri={item} width={width} height={height} onZoomChange={setZoomed} testID={`photo-viewer-image-${i}`} />
              </View>
            )}
          />

          <View style={[styles.header, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
            <TouchableOpacity onPress={onClose} style={styles.iconBtn} hitSlop={10} testID="photo-viewer-close">
              <Ionicons name="close" size={26} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter} pointerEvents="none">
              {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : null}
              {photos.length > 1 && (
                <Text style={styles.counter} testID="photo-viewer-counter">{index + 1} / {photos.length}</Text>
              )}
            </View>
            <View style={styles.iconBtn} />
          </View>

          {!zoomed && photos.length > 1 && index > 0 && (
            <TouchableOpacity style={[styles.navBtn, styles.navLeft]} onPress={() => goTo(index - 1)} testID="photo-viewer-prev">
              <Ionicons name="chevron-back" size={26} color="#fff" />
            </TouchableOpacity>
          )}
          {!zoomed && photos.length > 1 && index < photos.length - 1 && (
            <TouchableOpacity style={[styles.navBtn, styles.navRight]} onPress={() => goTo(index + 1)} testID="photo-viewer-next">
              <Ionicons name="chevron-forward" size={26} color="#fff" />
            </TouchableOpacity>
          )}

          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]} pointerEvents="none">
            {photos.length > 1 && (
              <View style={styles.dots}>
                {photos.map((_, i) => (
                  <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
                ))}
              </View>
            )}
            <Text style={styles.hint}>{zoomed ? 'Double-tap to reset' : 'Pinch or double-tap to zoom'}</Text>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: '#000' },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingBottom: 12,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  counter: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  navBtn: {
    position: 'absolute', top: '50%', marginTop: -22, width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center',
  },
  navLeft: { left: 12 },
  navRight: { right: 12 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', gap: 10 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: '#fff', width: 18 },
  hint: { color: 'rgba(255,255,255,0.55)', fontSize: 12 },
});
