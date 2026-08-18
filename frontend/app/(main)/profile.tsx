import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme, Theme } from '../../src/contexts/ThemeContext';
import { api, API_URL } from '../../src/services/api';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { notify } from '../../src/utils/alert';
import ConfirmDeleteAccountModal from '../../src/components/ConfirmDeleteAccountModal';

const INTEREST_CATEGORIES: { label: string; icon: string; items: string[] }[] = [
  {
    label: 'Academic',
    icon: 'school-outline',
    items: ['Computer Science', 'Mathematics', 'Physics', 'Biology', 'Chemistry', 'Literature', 'History', 'Psychology', 'Economics', 'Philosophy', 'Law', 'Medicine', 'Engineering', 'Architecture', 'Education', 'Data Science'],
  },
  {
    label: 'Creative',
    icon: 'color-palette-outline',
    items: ['Art', 'Music', 'Photography', 'Film', 'Graphic Design', 'Writing', 'Dance', 'Theatre', 'Fashion', 'Crafts', 'Illustration', 'Podcasting'],
  },
  {
    label: 'Tech',
    icon: 'code-slash-outline',
    items: ['Programming', 'AI & Machine Learning', 'Cybersecurity', 'Robotics', 'Web Development', 'Game Dev', 'Blockchain', '3D Printing'],
  },
  {
    label: 'Lifestyle',
    icon: 'heart-outline',
    items: ['Travel', 'Cooking', 'Fitness', 'Yoga', 'Mindfulness', 'Gardening', 'Reading', 'Hiking', 'Cycling', 'Running', 'Swimming', 'Nutrition'],
  },
  {
    label: 'Social',
    icon: 'people-outline',
    items: ['Volunteering', 'Politics', 'Entrepreneurship', 'Debating', 'Networking', 'Activism', 'Community', 'Sustainability'],
  },
  {
    label: 'Entertainment',
    icon: 'game-controller-outline',
    items: ['Gaming', 'Sports', 'Esports', 'Anime', 'Board Games', 'Comedy', 'Concerts', 'Festivals', 'Binge-watching'],
  },
];

const STUDY_STYLES = [
  { value: 'visual', label: 'Visual', icon: 'eye-outline' },
  { value: 'auditory', label: 'Auditory', icon: 'headset-outline' },
  { value: 'reading', label: 'Reading/Writing', icon: 'book-outline' },
  { value: 'kinesthetic', label: 'Kinesthetic', icon: 'hand-left-outline' },
];

const GENDERS = [
  { value: 'man', label: 'Man' },
  { value: 'woman', label: 'Woman' },
  { value: 'non-binary', label: 'Non-binary' },
];

const PRONOUNS = [
  { value: 'he/him', label: 'He/Him' },
  { value: 'she/her', label: 'She/Her' },
  { value: 'they/them', label: 'They/Them' },
  { value: 'he/they', label: 'He/They' },
  { value: 'she/they', label: 'She/They' },
  { value: 'any', label: 'Any Pronouns' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

const INTERESTED_IN_OPTIONS = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'everyone', label: 'Everyone' },
];

const ETHNICITIES = [
  'African',
  'African American',
  'Asian',
  'Caucasian/White',
  'East Asian',
  'Hispanic/Latino',
  'Indigenous/Native',
  'Middle Eastern',
  'Mixed/Multiracial',
  'Pacific Islander',
  'South Asian',
  'Southeast Asian',
  'Other',
  'Prefer not to say',
];

export default function ProfileScreen() {
  const { theme: t } = useTheme();
  const styles = useMemo(() => createStyles(t), [t]);
  const router = useRouter();
  const { user, logout, refreshUser, sessionToken } = useAuth();
  const { mode: themeMode, setMode: setThemeMode, isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeSection, setActiveSection] = useState<'photos' | 'basic' | 'preferences' | 'interests'>('photos');
  
  // Photos
  const [photos, setPhotos] = useState<string[]>(user?.photos || []);
  
  // Basic Info
  const [university, setUniversity] = useState(user?.university || '');
  const [universityLocation, setUniversityLocation] = useState(user?.university_location || '');
  const [campusName, setCampusName] = useState(user?.campus_name || '');
  const [course, setCourse] = useState(user?.course || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [pronouns, setPronouns] = useState(user?.pronouns || '');
  const [showPronouns, setShowPronouns] = useState(user?.show_pronouns !== false);
  
  // Preferences
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || []);
  const [customInterest, setCustomInterest] = useState('');
  const [studyStyle, setStudyStyle] = useState(user?.study_style || '');
  const [ethnicity, setEthnicity] = useState(user?.ethnicity || '');
  const [interestedIn, setInterestedIn] = useState<string[]>(user?.interested_in || []);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notifications_enabled ?? true);

  useEffect(() => {
    // Update photos when user changes
    if (user?.photos) {
      setPhotos(user.photos);
    }
  }, [user?.photos]);

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  const registerForPushNotifications = async () => {
    // Push notifications only work on physical devices with development builds
    // Expo Go has limitations with push notifications since SDK 53
    if (!Device.isDevice) {
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return;
      }
      
      // Note: Push tokens require a projectId which is only available in development builds
      // In Expo Go, this will fail gracefully
      try {
        const token = (await Notifications.getExpoPushTokenAsync({
          projectId: '0ad6a13c-845f-4ab4-9177-ba5031d2462d'
        })).data;
        
        // Save push token to backend
        if (token && sessionToken) {
          await api.put('/profile', { push_token: token }, sessionToken);
        }
      } catch (tokenError) {
        // This is expected in Expo Go - push notifications require a development build
        console.error('Push notifications require a development build.');
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  const pickImage = async (index: number) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        notify('Permission Required', 'Please allow access to your photo library to upload photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        const newPhotos = [...photos];
        newPhotos[index] = base64Image;
        setPhotos(newPhotos);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      notify('Error', 'Failed to pick image');
    }
  };

  const removePhoto = (index: number) => {
    const doRemove = () => {
      const newPhotos = photos.filter((_, i) => i !== index);
      setPhotos(newPhotos);
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to remove this photo?')) doRemove();
      return;
    }
    Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: doRemove },
    ]);
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else if (selectedInterests.length < 15) {
      setSelectedInterests([...selectedInterests, interest]);
    } else {
      notify('Limit Reached', 'You can select up to 15 interests');
    }
  };

  const addCustomInterest = () => {
    const trimmed = customInterest.trim();
    if (!trimmed) return;
    if (selectedInterests.includes(trimmed)) {
      setCustomInterest('');
      return;
    }
    if (selectedInterests.length >= 15) {
      Alert.alert('Limit Reached', 'You can select up to 15 interests');
      return;
    }
    setSelectedInterests([...selectedInterests, trimmed]);
    setCustomInterest('');
  };

  const toggleInterestedIn = (option: string) => {
    if (option === 'everyone') {
      setInterestedIn(['everyone']);
      return;
    }
    
    // Remove 'everyone' if selecting specific options
    const newInterested = interestedIn.filter(i => i !== 'everyone');
    
    if (newInterested.includes(option)) {
      setInterestedIn(newInterested.filter((i) => i !== option));
    } else {
      setInterestedIn([...newInterested, option]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put(
        '/profile',
        {
          university: university.trim() || null,
          university_location: universityLocation.trim() || null,
          campus_name: campusName.trim() || null,
          course: course.trim() || null,
          age: age ? parseInt(age) : null,
          bio: bio.trim() || null,
          gender: gender || null,
          pronouns: pronouns || null,
          show_pronouns: showPronouns,
          interests: selectedInterests,
          study_style: studyStyle || null,
          ethnicity: ethnicity || null,
          interested_in: interestedIn,
          notifications_enabled: notificationsEnabled,
          photos: photos,
        },
        sessionToken
      );
      await refreshUser();
      setIsEditing(false);
      notify('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      notify('Error', 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    // Web doesn't support Alert.alert, use confirm instead
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (confirmed) {
        try {
          await logout();
        } catch (error) {
          console.error('Logout error:', error);
          window.location.href = '/';
        }
      }
      return;
    }
    
    // Native platforms use Alert
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            // Small delay to ensure state is cleared before navigation
            setTimeout(() => {
              router.replace('/');
            }, 100);
          } catch (error) {
            console.error('Logout error:', error);
            // Force navigation even if logout API fails
            router.replace('/');
          }
        },
      },
    ]);
  };

  /**
   * Permanently delete the user's account and every piece of data linked to
   * it. Required by Apple App Store guideline 5.1.1(v) (in-app deletion)
   * and a Google Play Data Safety commitment too. Irreversible.
   *
   * Confirmation is collected by ConfirmDeleteAccountModal — Alert.prompt is
   * iOS-only (a no-op on Android) and window.prompt looks like stray browser
   * chrome, so both were replaced with one in-app modal for every platform.
   */
  const performAccountDeletion = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sessionToken}` },
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `HTTP ${res.status}`);
      }
      setShowDeleteModal(false);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Your account has been deleted. Goodbye 👋');
        window.location.href = '/';
        return;
      }
      try { await logout(); } catch {}
      router.replace('/');
    } catch (err: any) {
      notify('Error', err?.message || 'Failed to delete account.');
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

  const renderSectionTabs = () => (
    <View style={styles.sectionTabs}>
      <TouchableOpacity
        style={[styles.sectionTab, activeSection === 'photos' && styles.activeTab]}
        onPress={() => setActiveSection('photos')}
      >
        <Text style={[styles.sectionTabText, activeSection === 'photos' && styles.activeTabText]}>
          Photos
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.sectionTab, activeSection === 'basic' && styles.activeTab]}
        onPress={() => setActiveSection('basic')}
      >
        <Text style={[styles.sectionTabText, activeSection === 'basic' && styles.activeTabText]}>
          Basic
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.sectionTab, activeSection === 'preferences' && styles.activeTab]}
        onPress={() => setActiveSection('preferences')}
      >
        <Text style={[styles.sectionTabText, activeSection === 'preferences' && styles.activeTabText]}>
          Preferences
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.sectionTab, activeSection === 'interests' && styles.activeTab]}
        onPress={() => setActiveSection('interests')}
      >
        <Text style={[styles.sectionTabText, activeSection === 'interests' && styles.activeTabText]}>
          Interests
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPhotosSection = () => (
    <View style={styles.section}>
      <Text style={styles.fieldLabel}>Profile Photos (Up to 3)</Text>
      <Text style={styles.photoHint}>Add photos to show in your profile card when matching</Text>
      <View style={styles.photosGrid}>
        {[0, 1, 2].map((index) => (
          <TouchableOpacity
            key={index}
            style={styles.photoSlot}
            onPress={() => isEditing && pickImage(index)}
            disabled={!isEditing}
          >
            {photos[index] ? (
              <View style={styles.photoContainer}>
                <Image
                  source={{ uri: photos[index] }}
                  style={styles.photoImage}
                />
                {isEditing && (
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                )}
                {index === 0 && (
                  <View style={styles.mainPhotoBadge}>
                    <Text style={styles.mainPhotoBadgeText}>Main</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyPhotoSlot}>
                <Ionicons
                  name={isEditing ? "add-circle" : "image-outline"}
                  size={32}
                  color={isEditing ? "#6366F1" : "#4B5563"}
                />
                <Text style={styles.addPhotoText}>
                  {isEditing ? "Add Photo" : "No Photo"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBasicSection = () => (
    <View style={styles.section}>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Gender</Text>
        {isEditing ? (
          <View style={styles.optionGrid}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[styles.optionButton, gender === g.value && styles.optionSelected]}
                onPress={() => setGender(g.value)}
              >
                <Text style={[styles.optionText, gender === g.value && styles.optionTextSelected]}>
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.fieldValue}>
            {GENDERS.find((g) => g.value === user?.gender)?.label || 'Not specified'}
          </Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Pronouns</Text>
        {isEditing ? (
          <>
            <View style={styles.optionGrid}>
              {PRONOUNS.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={[styles.optionButton, pronouns === p.value && styles.optionSelected]}
                  onPress={() => setPronouns(p.value)}
                >
                  <Text style={[styles.optionText, pronouns === p.value && styles.optionTextSelected]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity 
              style={styles.toggleRow}
              onPress={() => setShowPronouns(!showPronouns)}
            >
              <View style={[styles.toggleSwitch, showPronouns && styles.toggleSwitchActive]}>
                <View style={[styles.toggleKnob, showPronouns && styles.toggleKnobActive]} />
              </View>
              <Text style={styles.toggleLabel}>Show pronouns on my profile</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.fieldValue}>
            {PRONOUNS.find((p) => p.value === user?.pronouns)?.label || 'Not specified'}
            {user?.pronouns && !user?.show_pronouns && ' (Hidden)'}
          </Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Age</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="Enter your age"
            placeholderTextColor={t.textFaint}
            keyboardType="numeric"
            maxLength={2}
          />
        ) : (
          <Text style={styles.fieldValue}>{user?.age || 'Not specified'}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>University</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={university}
            onChangeText={setUniversity}
            placeholder="Enter your university"
            placeholderTextColor={t.textFaint}
          />
        ) : (
          <Text style={styles.fieldValue}>{user?.university || 'Not specified'}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>University Location</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={universityLocation}
            onChangeText={setUniversityLocation}
            placeholder="City, Country"
            placeholderTextColor={t.textFaint}
          />
        ) : (
          <Text style={styles.fieldValue}>{user?.university_location || 'Not specified'}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Campus Name</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={campusName}
            onChangeText={setCampusName}
            placeholder="e.g., Main Campus, North Campus"
            placeholderTextColor={t.textFaint}
          />
        ) : (
          <Text style={styles.fieldValue}>{user?.campus_name || 'Not specified'}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Course/Major</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={course}
            onChangeText={setCourse}
            placeholder="e.g., Computer Science"
            placeholderTextColor={t.textFaint}
          />
        ) : (
          <Text style={styles.fieldValue}>{user?.course || 'Not specified'}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Bio</Text>
        {isEditing ? (
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself..."
            placeholderTextColor={t.textFaint}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        ) : (
          <Text style={styles.fieldValue}>{user?.bio || 'Not specified'}</Text>
        )}
      </View>
    </View>
  );

  const renderPreferencesSection = () => (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.discoveryFiltersRow}
        onPress={() => router.push('/(main)/matches?openFilters=1')}
        data-testid="open-discovery-filters"
      >
        <View style={styles.discoveryFiltersIcon}>
          <Ionicons name="options-outline" size={20} color={t.accent} />
        </View>
        <View style={styles.discoveryFiltersTextWrap}>
          <Text style={styles.discoveryFiltersTitle}>Discovery Filters</Text>
          <Text style={styles.discoveryFiltersSubtitle}>Gender, age, university, distance — Premium</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={t.textMuted} />
      </TouchableOpacity>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Interested In</Text>
        {isEditing ? (
          <View style={styles.optionGrid}>
            {INTERESTED_IN_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  interestedIn.includes(option.value) && styles.optionSelected,
                ]}
                onPress={() => toggleInterestedIn(option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    interestedIn.includes(option.value) && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.fieldValue}>
            {user?.interested_in?.length
              ? user.interested_in.map(i => 
                  INTERESTED_IN_OPTIONS.find(o => o.value === i)?.label || i
                ).join(', ')
              : 'Not specified'}
          </Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Ethnicity</Text>
        {isEditing ? (
          <View style={styles.ethnicityScrollWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ethnicityScroll}>
              {ETHNICITIES.map((eth) => (
                <TouchableOpacity
                  key={eth}
                  style={[styles.ethnicityChip, ethnicity === eth && styles.ethnicityChipSelected]}
                  onPress={() => setEthnicity(eth)}
                >
                  <Text
                    style={[
                      styles.ethnicityText,
                      ethnicity === eth && styles.ethnicityTextSelected,
                    ]}
                  >
                    {eth}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* Fade hint — signals there are more chips to scroll to on the right */}
            <LinearGradient
              colors={['transparent', t.bg]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ethnicityFade}
              pointerEvents="none"
            />
          </View>
        ) : (
          <Text style={styles.fieldValue}>{user?.ethnicity || 'Not specified'}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Learning Style</Text>
        {isEditing ? (
          <View style={styles.studyStyleGrid}>
            {STUDY_STYLES.map((style) => (
              <TouchableOpacity
                key={style.value}
                style={[
                  styles.studyStyleItem,
                  studyStyle === style.value && styles.studyStyleSelected,
                ]}
                onPress={() => setStudyStyle(style.value)}
              >
                <Ionicons
                  name={style.icon as any}
                  size={24}
                  color={studyStyle === style.value ? '#6366F1' : '#9CA3AF'}
                />
                <Text
                  style={[
                    styles.studyStyleLabel,
                    studyStyle === style.value && styles.studyStyleLabelSelected,
                  ]}
                >
                  {style.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.fieldValue}>
            {STUDY_STYLES.find((s) => s.value === user?.study_style)?.label || 'Not specified'}
          </Text>
        )}
      </View>

      <View style={styles.field}>
        <View style={styles.notificationRow}>
          <View>
            <Text style={styles.fieldLabel}>Push Notifications</Text>
            <Text style={styles.notificationDesc}>
              Receive alerts for matches and messages
            </Text>
          </View>
          {isEditing && (
            <TouchableOpacity
              style={[styles.toggle, notificationsEnabled && styles.toggleActive]}
              onPress={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              <View style={[styles.toggleKnob, notificationsEnabled && styles.toggleKnobActive]} />
            </TouchableOpacity>
          )}
          {!isEditing && (
            <Text style={[styles.fieldValue, { marginBottom: 0 }]}>
              {user?.notifications_enabled !== false ? 'Enabled' : 'Disabled'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderInterestsSection = () => (
    <View style={styles.section}>
      <View style={styles.interestsHeader}>
        <Text style={styles.fieldLabel}>Interests</Text>
        <View style={styles.interestCountBadge}>
          <Text style={styles.interestCountText}>
            {selectedInterests.length}/15 selected
          </Text>
        </View>
      </View>

      {/* Selected interests summary (always visible) */}
      {selectedInterests.length > 0 && (
        <View style={styles.selectedSummary}>
          <View style={styles.interestsDisplay}>
            {selectedInterests.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={styles.interestTagRemovable}
                onPress={() => isEditing && toggleInterest(interest)}
                disabled={!isEditing}
              >
                <Text style={styles.interestTagText}>{interest}</Text>
                {isEditing && (
                  <Ionicons name="close-circle" size={14} color="#818CF8" style={{ marginLeft: 4 }} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {isEditing && (
        <>
          {/* Custom interest input */}
          <View style={styles.customInterestRow}>
            <TextInput
              style={styles.customInterestInput}
              value={customInterest}
              onChangeText={setCustomInterest}
              placeholder="Add your own interest…"
              placeholderTextColor={t.textFaint}
              onSubmitEditing={addCustomInterest}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.customInterestBtn, !customInterest.trim() && { opacity: 0.4 }]}
              onPress={addCustomInterest}
              disabled={!customInterest.trim()}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Categorised interest grid */}
          {INTEREST_CATEGORIES.map((cat) => (
            <View key={cat.label} style={styles.interestCategory}>
              <View style={styles.interestCategoryHeader}>
                <Ionicons name={cat.icon as any} size={14} color={t.textMuted} />
                <Text style={styles.interestCategoryLabel}>{cat.label}</Text>
              </View>
              <View style={styles.interestsGrid}>
                {cat.items.map((interest) => {
                  const selected = selectedInterests.includes(interest);
                  return (
                    <TouchableOpacity
                      key={interest}
                      style={[styles.interestChip, selected && styles.interestChipSelected]}
                      onPress={() => toggleInterest(interest)}
                    >
                      {selected && (
                        <Ionicons name="checkmark" size={12} color="#818CF8" style={{ marginRight: 4 }} />
                      )}
                      <Text style={[styles.interestChipText, selected && styles.interestChipTextSelected]}>
                        {interest}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </>
      )}

      {!isEditing && selectedInterests.length === 0 && (
        <Text style={styles.fieldValue}>No interests added</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={[styles.content, isEditing && styles.contentEditing]}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(user?.name || 'U')}
                </Text>
              </View>
              <Text style={styles.name}>{user?.name}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              {user?.role === 'admin' && (
                <View style={styles.adminBadge}>
                  <Ionicons name="shield-checkmark" size={16} color="#F59E0B" />
                  <Text style={styles.adminText}>Admin</Text>
                </View>
              )}
            </View>

            {/* Edit Button */}
            <View style={styles.editRow}>
              {!isEditing ? (
                <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                  <Ionicons name="pencil" size={18} color={t.accent} />
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                  <Ionicons name="close" size={18} color="#EF4444" />
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Admin Dashboard Link */}
            {user?.role === 'admin' && (
              <TouchableOpacity
                style={styles.adminButton}
                onPress={() => router.push('/admin/dashboard')}
              >
                <Ionicons name="analytics" size={24} color="#F59E0B" />
                <Text style={styles.adminButtonText}>Admin Dashboard</Text>
                <Ionicons name="chevron-forward" size={20} color={t.textMuted} />
              </TouchableOpacity>
            )}

            {/* Premium Subscription Link */}
            <TouchableOpacity
              style={styles.premiumButton}
              onPress={() => router.push('/(main)/subscription')}
            >
              <View style={styles.premiumIconContainer}>
                <Ionicons name="diamond" size={24} color="#F59E0B" />
              </View>
              <View style={styles.premiumInfo}>
                <Text style={styles.premiumTitle}>DEQUAD Premium</Text>
                <Text style={styles.premiumSubtitle}>
                  {user?.plan === 'premium' ? 'Manage your subscription' : 'Upgrade for unlimited swipes'}
                </Text>
              </View>
              {user?.plan === 'premium' ? (
                <View style={styles.premiumActiveBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={t.success} />
                  <Text style={styles.premiumActiveText}>Active</Text>
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#F59E0B" />
              )}
            </TouchableOpacity>

            {/* Contact Support Button */}
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => router.push('/(main)/support')}
              data-testid="contact-support-btn"
            >
              <View style={styles.supportIconContainer}>
                <Ionicons name="headset" size={22} color={t.accent} />
              </View>
              <View style={styles.supportInfo}>
                <Text style={styles.supportTitle}>Contact Support</Text>
                <Text style={styles.supportSubtitle}>
                  Live chat with our team — replies in seconds
                </Text>
              </View>
              <View style={styles.supportLiveDot} />
              <Ionicons name="chevron-forward" size={20} color={t.accent} />
            </TouchableOpacity>

            {/* Appearance (theme) selector */}
            <View style={themeRowStyles.row} data-testid="appearance-selector">
              <View style={themeRowStyles.labelWrap}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color="#5B9BD5" />
                <Text style={themeRowStyles.label}>Appearance</Text>
              </View>
              <View style={themeRowStyles.pills}>
                {(['light', 'dark', 'system'] as const).map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setThemeMode(m)}
                    style={[themeRowStyles.pill, themeMode === m && themeRowStyles.pillActive]}
                    data-testid={`theme-${m}`}
                  >
                    <Text style={[themeRowStyles.pillText, themeMode === m && themeRowStyles.pillTextActive]}>
                      {m === 'light' ? 'Light' : m === 'dark' ? 'Dark' : 'Auto'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Section Tabs */}
            {renderSectionTabs()}

            {/* Section Content */}
            {activeSection === 'photos' && renderPhotosSection()}
            {activeSection === 'basic' && renderBasicSection()}
            {activeSection === 'preferences' && renderPreferencesSection()}
            {activeSection === 'interests' && renderInterestsSection()}

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

            {/* Delete Account — Apple App Store guideline 5.1.1(v) compliance */}
            <TouchableOpacity
              style={styles.deleteAccountButton}
              onPress={() => setShowDeleteModal(true)}
              data-testid="delete-account-button"
            >
              <Ionicons name="trash-outline" size={20} color="#7F1D1D" />
              <Text style={styles.deleteAccountButtonText}>Delete my account</Text>
            </TouchableOpacity>
            <Text style={styles.deleteAccountCaption}>
              This will permanently erase your profile, matches, chats and mood history. Active premium
              subscriptions are cancelled. This cannot be undone.
            </Text>
          </View>
        </ScrollView>

        <ConfirmDeleteAccountModal
          visible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={performAccountDeletion}
        />
      </KeyboardAvoidingView>

      {/* Sticky save bar — editing spans a long scroll (photos, basic info,
          preferences, interests) and the previous inline Save button at the
          bottom of that scroll meant re-finding it after every edit. */}
      {isEditing && (
        <View style={styles.stickySaveBar}>
          <TouchableOpacity
            style={styles.stickyCancelButton}
            onPress={() => setIsEditing(false)}
            disabled={isSaving}
          >
            <Text style={styles.stickyCancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stickySaveButton}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={t.primaryText} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={t.primaryText} />
                <Text style={styles.stickySaveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 70;

const createStyles = (t: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.bg,
  },
  keyboardView: {
    flex: 1,
  },
  stickySaveBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: TAB_BAR_HEIGHT,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: t.tabBarBg,
    borderTopWidth: 1,
    borderTopColor: t.border,
  },
  stickyCancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: t.danger + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyCancelButtonText: {
    color: t.danger,
    fontSize: 15,
    fontWeight: '600',
  },
  stickySaveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.accent,
    borderRadius: 12,
    gap: 8,
  },
  stickySaveButtonText: {
    color: t.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    // Clears the floating (position: 'absolute') tab bar so the last card
    // isn't hidden underneath it.
    paddingBottom: 100,
  },
  contentEditing: {
    // Also clear the sticky save bar, which sits above the tab bar while editing.
    paddingBottom: 180,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: t.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: t.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: t.textMuted,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  adminText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  editRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(91, 155, 213, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: t.accent,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  adminButtonText: {
    flex: 1,
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  premiumIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  premiumInfo: {
    flex: 1,
  },
  premiumTitle: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '600',
  },
  premiumSubtitle: {
    color: t.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  premiumActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  premiumActiveText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(91, 155, 213, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(91, 155, 213, 0.3)',
  },
  supportIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(91, 155, 213, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  supportInfo: {
    flex: 1,
  },
  supportTitle: {
    color: '#818CF8',
    fontSize: 16,
    fontWeight: '600',
  },
  supportSubtitle: {
    color: t.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  supportLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  photoHint: {
    fontSize: 14,
    color: t.textMuted,
    marginBottom: 16,
    textAlign: 'center',
  },
  photosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  photoSlot: {
    flex: 1,
    aspectRatio: 4/5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoContainer: {
    flex: 1,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  mainPhotoBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(91, 155, 213, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mainPhotoBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyPhotoSlot: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
  },
  addPhotoText: {
    color: t.textMuted,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  sectionTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: t.accent,
  },
  sectionTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: t.textMuted,
  },
  activeTabText: {
    color: '#fff',
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: t.textMuted,
    marginBottom: 8,
    fontWeight: '600',
  },
  fieldValue: {
    fontSize: 16,
    color: t.text,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    color: t.text,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: 'rgba(91, 155, 213, 0.2)',
    borderColor: t.accent,
  },
  optionText: {
    color: t.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#818CF8',
  },
  ethnicityScrollWrap: {
    position: 'relative',
  },
  ethnicityScroll: {
    marginTop: 4,
  },
  ethnicityFade: {
    position: 'absolute',
    top: 4,
    right: 0,
    bottom: 0,
    width: 28,
  },
  ethnicityChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  ethnicityChipSelected: {
    backgroundColor: 'rgba(91, 155, 213, 0.2)',
    borderColor: t.accent,
  },
  ethnicityText: {
    color: t.textMuted,
    fontSize: 14,
  },
  ethnicityTextSelected: {
    color: '#818CF8',
  },
  studyStyleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  studyStyleItem: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  studyStyleSelected: {
    borderColor: t.accent,
    backgroundColor: 'rgba(91, 155, 213, 0.1)',
  },
  studyStyleLabel: {
    color: t.textMuted,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  studyStyleLabelSelected: {
    color: t.accent,
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationDesc: {
    fontSize: 12,
    color: t.textFaint,
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: t.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: t.accent,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: t.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#5B9BD5',
  },
  toggleLabel: {
    color: t.textMuted,
    fontSize: 14,
  },
  interestsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  interestCountBadge: {
    backgroundColor: 'rgba(129, 140, 248, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  interestCountText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedSummary: {
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  customInterestRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  customInterestInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: t.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  },
  customInterestBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: t.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interestCategory: {
    marginBottom: 14,
  },
  interestCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  interestCategoryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: t.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  interestChipSelected: {
    backgroundColor: 'rgba(91, 155, 213, 0.2)',
    borderColor: t.accent,
  },
  interestChipText: {
    color: t.textMuted,
    fontSize: 13,
  },
  interestChipTextSelected: {
    color: '#818CF8',
    fontWeight: '600',
  },
  interestsDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTagRemovable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(91, 155, 213, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.4)',
  },
  interestTag: {
    backgroundColor: 'rgba(91, 155, 213, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestTagText: {
    color: '#818CF8',
    fontSize: 13,
    fontWeight: '500',
  },
  discoveryFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: t.border,
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  discoveryFiltersIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(91, 155, 213, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoveryFiltersTextWrap: {
    flex: 1,
  },
  discoveryFiltersTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: t.text,
  },
  discoveryFiltersSubtitle: {
    fontSize: 12,
    color: t.textMuted,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(127, 29, 29, 0.10)',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  deleteAccountButtonText: {
    color: '#7F1D1D',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteAccountCaption: {
    fontSize: 12,
    color: t.textFaint,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    paddingHorizontal: 8,
    lineHeight: 16,
  },
});

const themeRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(91, 155, 213, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(91, 155, 213, 0.25)',
    padding: 14,
    marginBottom: 16,
  },
  labelWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { color: '#F8FAFC', fontSize: 15, fontWeight: '600' },
  pills: { flexDirection: 'row', gap: 6 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
  },
  pillActive: { backgroundColor: '#5B9BD5' },
  pillText: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  pillTextActive: { color: '#fff' },
});
