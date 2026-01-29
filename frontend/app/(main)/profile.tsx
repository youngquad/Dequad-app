import React, { useState } from 'react';
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

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshUser, sessionToken } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [university, setUniversity] = useState(user?.university || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    user?.interests || []
  );
  const [studyStyle, setStudyStyle] = useState(user?.study_style || '');

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else if (selectedInterests.length < 5) {
      setSelectedInterests([...selectedInterests, interest]);
    } else {
      Alert.alert('Limit Reached', 'You can select up to 5 interests');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put(
        '/profile',
        {
          university: university.trim() || null,
          age: age ? parseInt(age) : null,
          bio: bio.trim() || null,
          interests: selectedInterests,
          study_style: studyStyle || null,
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

            {/* Profile Details */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Profile Details</Text>
                {!isEditing ? (
                  <TouchableOpacity onPress={() => setIsEditing(true)}>
                    <Text style={styles.editButton}>Edit</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => setIsEditing(false)}>
                    <Text style={styles.cancelButton}>Cancel</Text>
                  </TouchableOpacity>
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
                  <Text style={styles.fieldValue}>
                    {user?.university || 'Not specified'}
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
                  <Text style={styles.fieldValue}>
                    {user?.age || 'Not specified'}
                  </Text>
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
                  <Text style={styles.fieldValue}>
                    {user?.bio || 'Not specified'}
                  </Text>
                )}
              </View>
            </View>

            {/* Study Style */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Learning Style</Text>
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
                  {STUDY_STYLES.find((s) => s.value === user?.study_style)?.label ||
                    'Not specified'}
                </Text>
              )}
            </View>

            {/* Interests */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Interests {isEditing && `(${selectedInterests.length}/5)`}
              </Text>
              {isEditing ? (
                <View style={styles.interestsGrid}>
                  {INTERESTS.map((interest) => (
                    <TouchableOpacity
                      key={interest}
                      style={[
                        styles.interestChip,
                        selectedInterests.includes(interest) &&
                          styles.interestChipSelected,
                      ]}
                      onPress={() => toggleInterest(interest)}
                    >
                      <Text
                        style={[
                          styles.interestChipText,
                          selectedInterests.includes(interest) &&
                            styles.interestChipTextSelected,
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
    marginBottom: 24,
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
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  adminButtonText: {
    flex: 1,
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  editButton: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
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
