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

const INTERESTS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Biology',
  'Chemistry',
  'Literature',
  'History',
  'Psychology',
  'Economics',
  'Art',
  'Music',
  'Sports',
  'Gaming',
  'Photography',
  'Travel',
  'Cooking',
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
      console.log('Push notifications require a physical device');
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
        console.log('Push notification permission denied');
        return;
      }
      
      // Note: Push tokens require a projectId which is only available in development builds
      // In Expo Go, this will fail gracefully
      try {
        const token = (await Notifications.getExpoPushTokenAsync({
          projectId: 'dequad-app'
        })).data;
        
        // Save push token to backend
        if (token && sessionToken) {
          await api.put('/profile', { push_token: token }, sessionToken);
          console.log('Push token registered successfully');
        }
      } catch (tokenError) {
        // This is expected in Expo Go - push notifications require a development build
        console.log('Push notifications require a development build. Using Expo Go has limitations.');
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  const pickImage = async (index: number) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload photos.');
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
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removePhoto = (index: number) => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const newPhotos = photos.filter((_, i) => i !== index);
          setPhotos(newPhotos);
        },
      },
    ]);
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else if (selectedInterests.length < 5) {
      setSelectedInterests([...selectedInterests, interest]);
    } else {
      Alert.alert('Limit Reached', 'You can select up to 5 interests');
    }
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
      if (Platform.OS === 'web') {
        alert('Profile updated successfully');
      } else {
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      if (Platform.OS === 'web') {
        alert('Failed to save profile');
      } else {
        Alert.alert('Error', 'Failed to save profile');
      }
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
   */
  const handleDeleteAccount = async () => {
    const confirmMessage =
      "PERMANENTLY DELETE YOUR ACCOUNT?\n\n" +
      "This is irreversible. You will lose:\n" +
      "• Your profile, photos and bio\n" +
      "• Every match and chat\n" +
      "• All mood-tracker history\n" +
      "• Your premium subscription (active subs are auto-cancelled — no refund)\n\n" +
      "Type-to-confirm in the next prompt to proceed.";

    const proceed = async () => {
      try {
        const apiBase = API_URL;
        const res = await fetch(`${apiBase}/api/auth/me`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${sessionToken}` },
          credentials: 'include',
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || `HTTP ${res.status}`);
        }
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert('Your account has been deleted. Goodbye 👋');
          window.location.href = '/';
          return;
        }
        // Native: clear local state then bounce to landing
        try { await logout(); } catch {}
        router.replace('/');
      } catch (err: any) {
        const msg = err?.message || 'Failed to delete account.';
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert(`Error: ${msg}`);
        } else {
          Alert.alert('Error', msg);
        }
      }
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (!window.confirm(confirmMessage)) return;
      const typed = window.prompt('Type DELETE (in capitals) to confirm.');
      if (typed !== 'DELETE') {
        window.alert('Cancelled — your account is safe.');
        return;
      }
      await proceed();
      return;
    }

    Alert.alert(
      'Delete account',
      confirmMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete forever',
          style: 'destructive',
          onPress: async () => {
            Alert.prompt(
              'Final confirmation',
              'Type DELETE (in capitals) to confirm permanent deletion.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete forever',
                  style: 'destructive',
                  onPress: async (value?: string) => {
                    if (value !== 'DELETE') {
                      Alert.alert('Cancelled', 'Your account is safe.');
                      return;
                    }
                    await proceed();
                  },
                },
              ],
              'plain-text',
            );
          },
        },
      ],
    );
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
      <Text style={styles.fieldLabel}>
        Interests {isEditing && `(${selectedInterests.length}/5)`}
      </Text>
      {isEditing ? (
        <View style={styles.interestsGrid}>
          {INTERESTS.map((interest) => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.interestChip,
                selectedInterests.includes(interest) && styles.interestChipSelected,
              ]}
              onPress={() => toggleInterest(interest)}
            >
              <Text
                style={[
                  styles.interestChipText,
                  selectedInterests.includes(interest) && styles.interestChipTextSelected,
                ]}
              >
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.interestsDisplay}>
          {user?.interests && user.interests.length > 0 ? (
            user.interests.map((interest) => (
              <View key={interest} style={styles.interestTag}>
                <Text style={styles.interestTagText}>{interest}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.fieldValue}>No interests added</Text>
          )}
        </View>
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
          <View style={styles.content}>
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
                onPress={() => router.push('/(admin)/dashboard')}
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

            {/* Save Button */}
            {isEditing && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

            {/* Delete Account — Apple App Store guideline 5.1.1(v) compliance */}
            <TouchableOpacity
              style={styles.deleteAccountButton}
              onPress={handleDeleteAccount}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (t: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.bg,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
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
  ethnicityScroll: {
    marginTop: 4,
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
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  interestChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 14,
    paddingVertical: 8,
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
    fontSize: 14,
  },
  interestChipTextSelected: {
    color: '#818CF8',
  },
  interestsDisplay: {
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
    color: '#818CF8',
    fontSize: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.accent,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
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
