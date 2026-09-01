import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Theme } from '../contexts/ThemeContext';

interface PreviewProfile {
  name?: string;
  age?: number | string;
  pronouns?: string;
  show_pronouns?: boolean;
  university?: string;
  course?: string;
  study_style?: string;
  bio?: string;
  interests?: string[];
  photos?: string[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  profile: PreviewProfile;
}

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

export const ProfileCardPreview = ({ visible, onClose, profile }: Props) => {
  const { theme: t } = useTheme();
  const { width: winWidth, height: winHeight } = useWindowDimensions();
  const cardWidth = Math.min(winWidth, 480);
  const photoHeight = Math.min(winHeight * 0.5, 460);
  const [photoIndex, setPhotoIndex] = useState(0);
  const scrollRef = React.useRef<ScrollView | null>(null);

  const styles = createStyles(t, cardWidth, photoHeight);
  const photoList = (profile.photos || []).filter(Boolean);
  const photoCount = photoList.length;
  const activeIndex = Math.min(photoIndex, Math.max(photoCount - 1, 0));

  const goToPhoto = (idx: number) => {
    const clamped = Math.max(0, Math.min(idx, photoCount - 1));
    scrollRef.current?.scrollTo({ x: clamped * cardWidth, animated: true });
    setPhotoIndex(clamped);
  };

  const onScrollEnd = (e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
    if (newIndex !== activeIndex) setPhotoIndex(newIndex);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet} testID="profile-preview-modal">
          <View style={styles.header}>
            <View style={styles.headerBadge}>
              <Ionicons name="eye" size={14} color={t.accent} />
              <Text style={styles.headerBadgeText}>This is how others see you</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} testID="profile-preview-close">
              <Ionicons name="close" size={22} color={t.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
            {/* Photo carousel */}
            <View style={styles.photoSection}>
              {photoCount > 0 ? (
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={onScrollEnd}
                  ref={(r) => { scrollRef.current = r; }}
                  testID="preview-photo-carousel"
                >
                  {photoList.map((photo, i) => (
                    <Image key={`preview-slide-${i}`} source={{ uri: photo }} style={styles.photoSlide} />
                  ))}
                </ScrollView>
              ) : (
                <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.photoPlaceholder}>
                  <Text style={styles.photoInitials}>{getInitials(profile.name || 'U')}</Text>
                  <Text style={styles.noPhotoHint}>No photos yet — add some so people can see you!</Text>
                </LinearGradient>
              )}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.photoGradient}
                pointerEvents="none"
              />
              {photoCount > 1 && (
                <View style={styles.photoDots} pointerEvents="none">
                  {photoList.map((_, i) => (
                    <View key={`preview-dot-${i}`} style={[styles.photoDot, i === activeIndex && styles.photoDotActive]} />
                  ))}
                </View>
              )}
              {photoCount > 1 && activeIndex > 0 && (
                <TouchableOpacity style={[styles.navBtn, styles.navLeft]} onPress={() => goToPhoto(activeIndex - 1)} testID="preview-photo-prev">
                  <Ionicons name="chevron-back" size={22} color="#fff" />
                </TouchableOpacity>
              )}
              {photoCount > 1 && activeIndex < photoCount - 1 && (
                <TouchableOpacity style={[styles.navBtn, styles.navRight]} onPress={() => goToPhoto(activeIndex + 1)} testID="preview-photo-next">
                  <Ionicons name="chevron-forward" size={22} color="#fff" />
                </TouchableOpacity>
              )}
              <View style={styles.photoOverlay}>
                <View style={styles.nameRow}>
                  <Text style={styles.nameText}>{profile.name}</Text>
                  {!!profile.age && <Text style={styles.ageText}>, {profile.age}</Text>}
                  {!!profile.pronouns && profile.show_pronouns !== false && (
                    <View style={styles.pronounsBadge}>
                      <Text style={styles.pronounsText}>{profile.pronouns}</Text>
                    </View>
                  )}
                </View>
                {!!profile.university && (
                  <View style={styles.universityBadge}>
                    <Ionicons name="school" size={14} color="#fff" />
                    <Text style={styles.universityText}>{profile.university}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Course & Study Style */}
            {(profile.course || profile.study_style) ? (
              <View style={styles.infoSection}>
                <Ionicons name="book" size={20} color={t.accent} />
                <View style={styles.infoTextContainer}>
                  {!!profile.course && <Text style={styles.infoTitle}>{profile.course}</Text>}
                  {!!profile.study_style && <Text style={styles.infoSubtitle}>Study style: {profile.study_style}</Text>}
                </View>
              </View>
            ) : null}

            {/* Bio */}
            <View style={styles.infoSection}>
              <Ionicons name="chatbubble-ellipses" size={20} color={t.success} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>About me</Text>
                {profile.bio ? (
                  <Text style={styles.bioText}>"{profile.bio}"</Text>
                ) : (
                  <Text style={styles.missingText}>No bio yet — profiles with a bio get more likes</Text>
                )}
              </View>
            </View>

            {/* Interests */}
            <View style={styles.infoSection}>
              <Ionicons name="heart-circle" size={20} color="#EC4899" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Interests</Text>
                {profile.interests && profile.interests.length > 0 ? (
                  <View style={styles.interestsWrap}>
                    {profile.interests.map((interest, i) => (
                      <View key={`preview-interest-${i}`} style={styles.interestTag}>
                        <Text style={styles.interestTagText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.missingText}>No interests added yet</Text>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (t: Theme, cardWidth: number, photoHeight: number) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    sheet: {
      width: cardWidth,
      height: '92%',
      backgroundColor: t.bg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: t.card,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
    headerBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    headerBadgeText: {
      color: t.text,
      fontSize: 14,
      fontWeight: '600',
    },
    closeBtn: {
      padding: 4,
    },
    photoSection: {
      width: cardWidth,
      height: photoHeight,
      position: 'relative',
    },
    photoSlide: {
      width: cardWidth,
      height: '100%',
    },
    photoPlaceholder: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    photoInitials: {
      fontSize: 64,
      fontWeight: '700',
      color: '#fff',
    },
    noPhotoHint: {
      marginTop: 12,
      color: 'rgba(255,255,255,0.85)',
      fontSize: 13,
      textAlign: 'center',
    },
    photoGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 140,
    },
    photoDots: {
      position: 'absolute',
      bottom: 14,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
    },
    photoDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255,255,255,0.45)',
    },
    photoDotActive: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#fff',
    },
    navBtn: {
      position: 'absolute',
      top: '45%',
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: 'rgba(0,0,0,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5,
    },
    navLeft: { left: 12 },
    navRight: { right: 12 },
    photoOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
      paddingBottom: 28,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    nameText: {
      fontSize: 28,
      fontWeight: '700',
      color: '#fff',
    },
    ageText: {
      fontSize: 24,
      color: '#fff',
    },
    pronounsBadge: {
      marginLeft: 8,
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    pronounsText: {
      color: '#fff',
      fontSize: 12,
    },
    universityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: 8,
      gap: 6,
    },
    universityText: {
      color: '#fff',
      fontSize: 13,
    },
    infoSection: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: t.card,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      padding: 16,
      gap: 12,
    },
    infoTextContainer: {
      flex: 1,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: t.text,
    },
    infoSubtitle: {
      fontSize: 14,
      color: t.textMuted,
      marginTop: 2,
    },
    bioText: {
      fontSize: 14,
      color: t.textMuted,
      fontStyle: 'italic',
      marginTop: 4,
    },
    missingText: {
      fontSize: 13,
      color: t.textMuted,
      fontStyle: 'italic',
      marginTop: 4,
    },
    interestsWrap: {
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
      color: t.accent,
      fontSize: 13,
    },
  });

export default ProfileCardPreview;
