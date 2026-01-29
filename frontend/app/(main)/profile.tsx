import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/services/api';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

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
  const router = useRouter();
  const { user, logout, refreshUser, sessionToken } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'basic' | 'preferences' | 'interests'>('basic');
  
  // Basic Info
  const [university, setUniversity] = useState(user?.university || '');
  const [universityLocation, setUniversityLocation] = useState(user?.university_location || '');
  const [campusName, setCampusName] = useState(user?.campus_name || '');
  const [course, setCourse] = useState(user?.course || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [gender, setGender] = useState(user?.gender || '');
  
  // Preferences
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || []);
  const [studyStyle, setStudyStyle] = useState(user?.study_style || '');
  const [ethnicity, setEthnicity] = useState(user?.ethnicity || '');
  const [interestedIn, setInterestedIn] = useState<string[]>(user?.interested_in || []);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notifications_enabled ?? true);

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  const registerForPushNotifications = async () => {
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
      
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      
      // Save push token to backend
      if (token && sessionToken) {
        await api.put('/profile', { push_token: token }, sessionToken);
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
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
          interests: selectedInterests,
          study_style: studyStyle || null,
          ethnicity: ethnicity || null,
          interested_in: interestedIn,
          notifications_enabled: notificationsEnabled,
        },
        sessionToken
      );
      await refreshUser();
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
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
        <Text style={styles.fieldLabel}>Age</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="Enter your age"
            placeholderTextColor="#6B7280"
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
            placeholderTextColor="#6B7280"
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
            placeholderTextColor="#6B7280"
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
            placeholderTextColor="#6B7280"
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
            placeholderTextColor="#6B7280"
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
            placeholderTextColor="#6B7280"
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
                  <Ionicons name="pencil" size={18} color="#6366F1" />
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
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}

            {/* Section Tabs */}
            {renderSectionTabs()}

            {/* Section Content */}
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
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
    backgroundColor: '#6366F1',
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
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#9CA3AF',
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
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#6366F1',
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
    backgroundColor: '#6366F1',
  },
  sectionTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
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
    color: '#9CA3AF',
    marginBottom: 8,
    fontWeight: '600',
  },
  fieldValue: {
    fontSize: 16,
    color: '#fff',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
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
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: '#6366F1',
  },
  optionText: {
    color: '#9CA3AF',
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
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: '#6366F1',
  },
  ethnicityText: {
    color: '#9CA3AF',
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
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  studyStyleLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  studyStyleLabelSelected: {
    color: '#6366F1',
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#374151',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#6366F1',
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
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: '#6366F1',
  },
  interestChipText: {
    color: '#9CA3AF',
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
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
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
    backgroundColor: '#6366F1',
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
    marginBottom: 32,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});
