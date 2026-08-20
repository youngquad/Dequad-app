import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { useTheme, Theme } from '../../../../src/contexts/ThemeContext';
import { api } from '../../../../src/services/api';

interface MatchedUserProfile {
  user_id: string;
  name: string;
  age?: number;
  picture?: string;
  photos?: string[];
  university?: string;
  campus_name?: string;
  course?: string;
  bio?: string;
  interests?: string[];
  distance_km?: number;
  verified?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MatchProfileScreen() {
  const { matchId, name } = useLocalSearchParams<{ matchId: string; name?: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { theme: t } = useTheme();
  const styles = useMemo(() => createStyles(t), [t]);
  const { sessionToken } = useAuth();
  const [profile, setProfile] = useState<MatchedUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: name || 'Profile' });
  }, [name]);

  useEffect(() => {
    let isMounted = true;
    if (!matchId || !sessionToken) return;

    api
      .get(`/matches/${matchId}/profile`, sessionToken)
      .then((data) => {
        if (isMounted) setProfile(data);
      })
      .catch(() => {
        if (isMounted) setError("Couldn't load this profile.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [matchId, sessionToken]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={t.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color={t.textFaint} />
          <Text style={styles.errorText}>{error || "Couldn't load this profile."}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const photos = profile.photos && profile.photos.length > 0 ? profile.photos : profile.picture ? [profile.picture] : [];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {photos.length > 0 ? (
          <Image source={{ uri: photos[0] }} style={styles.heroPhoto} />
        ) : (
          <View style={[styles.heroPhoto, styles.heroPhotoFallback]}>
            <Text style={styles.heroPhotoFallbackText}>
              {profile.name?.slice(0, 1).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {profile.name}{profile.age ? `, ${profile.age}` : ''}
            </Text>
            {profile.verified && (
              <Ionicons name="checkmark-circle" size={20} color={t.accent} style={styles.verifiedIcon} />
            )}
          </View>

          {(profile.course || profile.university) && (
            <View style={styles.metaRow}>
              <Ionicons name="school-outline" size={16} color={t.textMuted} />
              <Text style={styles.metaText}>
                {[profile.course, profile.university].filter(Boolean).join(' · ')}
              </Text>
            </View>
          )}

          {profile.campus_name && (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={16} color={t.textMuted} />
              <Text style={styles.metaText}>{profile.campus_name}</Text>
            </View>
          )}

          {typeof profile.distance_km === 'number' && (
            <View style={styles.metaRow}>
              <Ionicons name="navigate-outline" size={16} color={t.textMuted} />
              <Text style={styles.metaText}>{profile.distance_km} km away</Text>
            </View>
          )}

          {profile.bio ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>About</Text>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>
          ) : null}

          {profile.interests && profile.interests.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Interests</Text>
              <View style={styles.chipRow}>
                {profile.interests.map((interest) => (
                  <View key={interest} style={styles.chip}>
                    <Text style={styles.chipText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {photos.length > 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Photos</Text>
              <View style={styles.photoGrid}>
                {photos.slice(1).map((photo, i) => (
                  <Image key={i} source={{ uri: photo }} style={styles.gridPhoto} />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (t: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: t.textMuted, fontSize: 15, marginTop: 12, textAlign: 'center' },
  backButton: {
    marginTop: 20, paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 999, backgroundColor: t.primary,
  },
  backButtonText: { color: t.primaryText, fontWeight: '600' },
  scrollContent: { paddingBottom: 40 },
  heroPhoto: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
  heroPhotoFallback: { backgroundColor: t.accent, justifyContent: 'center', alignItems: 'center' },
  heroPhotoFallbackText: { color: '#fff', fontSize: 64, fontWeight: 'bold' },
  body: { padding: 20 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 24, fontWeight: 'bold', color: t.text },
  verifiedIcon: { marginLeft: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  metaText: { fontSize: 14, color: t.textMuted },
  section: { marginTop: 20 },
  sectionLabel: {
    fontSize: 12, fontWeight: '600', letterSpacing: 0.04, textTransform: 'uppercase',
    color: t.textFaint, marginBottom: 8,
  },
  bioText: { fontSize: 15, lineHeight: 22, color: t.text },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    backgroundColor: t.isDark ? 'rgba(91,155,213,0.15)' : 'rgba(15,41,66,0.06)',
    borderWidth: 1, borderColor: t.border,
  },
  chipText: { fontSize: 13, color: t.text },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridPhoto: {
    width: (SCREEN_WIDTH - 40 - 16) / 3, height: (SCREEN_WIDTH - 40 - 16) / 3,
    borderRadius: 10,
  },
});
