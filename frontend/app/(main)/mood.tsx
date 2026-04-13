import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/services/api';
import SafeguardingAlert from '../../src/components/SafeguardingAlert';
import { MoodCardSkeleton } from '../../src/components/SkeletonLoader';

const MOODS = [
  { value: 1, emoji: '😢', label: 'Awful', color: '#EF4444', gradient: ['#EF4444', '#F87171'] },
  { value: 2, emoji: '😞', label: 'Bad', color: '#F97316', gradient: ['#F97316', '#FB923C'] },
  { value: 3, emoji: '😔', label: 'Down', color: '#F59E0B', gradient: ['#F59E0B', '#FBBF24'] },
  { value: 4, emoji: '😕', label: 'Meh', color: '#EAB308', gradient: ['#EAB308', '#FACC15'] },
  { value: 5, emoji: '😐', label: 'Okay', color: '#84CC16', gradient: ['#84CC16', '#A3E635'] },
  { value: 6, emoji: '🙂', label: 'Fine', color: '#22C55E', gradient: ['#22C55E', '#4ADE80'] },
  { value: 7, emoji: '😊', label: 'Good', color: '#10B981', gradient: ['#10B981', '#34D399'] },
  { value: 8, emoji: '😄', label: 'Great', color: '#14B8A6', gradient: ['#14B8A6', '#2DD4BF'] },
  { value: 9, emoji: '😁', label: 'Amazing', color: '#06B6D4', gradient: ['#06B6D4', '#22D3EE'] },
  { value: 10, emoji: '🤩', label: 'Perfect', color: '#6366F1', gradient: ['#6366F1', '#818CF8'] },
];

interface MoodEntry {
  id: string;
  mood: number;
  notes?: string;
  created_at: string;
}

function AnimatedMoodButton({ mood, isSelected, onPress }: { mood: typeof MOODS[0], isSelected: boolean, onPress: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.15,
          useNativeDriver: true,
          speed: 50,
          bounciness: 15,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.08,
          useNativeDriver: true,
          speed: 50,
        }),
      ]).start();

      // Continuous gentle bounce
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -4,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
      bounceAnim.setValue(0);
    }
  }, [isSelected]);

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={[
          styles.moodItem,
          isSelected && { 
            backgroundColor: mood.color + '25',
            borderColor: mood.color,
          },
          {
            transform: [
              { scale: scaleAnim },
              { translateY: isSelected ? bounceAnim : 0 },
            ],
          },
        ]}
      >
        <Text style={styles.moodEmoji}>{mood.emoji}</Text>
        <Text style={[styles.moodValue, isSelected && { color: mood.color }]}>
          {mood.value}
        </Text>
        <Text style={[styles.moodLabel, isSelected && { color: mood.color }]}>
          {mood.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function MoodScreen() {
  const { sessionToken } = useAuth();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [safeguardingAlert, setSafeguardingAlert] = useState<any>(null);
  const [showSafeguardingModal, setShowSafeguardingModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Animations
  const buttonScale = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadMoodHistory();
    // Header entrance animation
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadMoodHistory = async () => {
    try {
      const data = await api.get('/mood', sessionToken);
      setMoodHistory(data);
    } catch (error) {
      console.error('Error loading mood history:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadMoodHistory();
  };

  const handleSubmit = async () => {
    if (!selectedMood) {
      Alert.alert('Select Mood', 'Please select your current mood');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/mood', { mood: selectedMood, notes }, sessionToken);
      
      if (response.safeguarding_alert && response.safeguarding_alert.flagged) {
        setSafeguardingAlert(response.safeguarding_alert);
        setShowSafeguardingModal(true);
      } else {
        // Show success animation
        setShowSuccess(true);
        Animated.sequence([
          Animated.spring(successAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
            bounciness: 12,
          }),
          Animated.delay(1500),
          Animated.timing(successAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => setShowSuccess(false));
      }
      
      setSelectedMood(null);
      setNotes('');
      loadMoodHistory();
    } catch (error) {
      console.error('Error submitting mood:', error);
      Alert.alert('Error', 'Failed to record mood. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMoodInfo = (value: number) => {
    return MOODS.find((m) => m.value === value) || MOODS[4];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const selectedMoodInfo = selectedMood ? getMoodInfo(selectedMood) : null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Success Animation Overlay */}
      {showSuccess && (
        <Animated.View
          style={[
            styles.successOverlay,
            {
              opacity: successAnim,
              transform: [{ scale: successAnim }],
            },
          ]}
        >
          <View style={styles.successContent}>
            <Text style={styles.successEmoji}>✨</Text>
            <Text style={styles.successText}>Mood Logged!</Text>
          </View>
        </Animated.View>
      )}

      {/* Safeguarding Alert Modal */}
      <SafeguardingAlert
        visible={showSafeguardingModal}
        onClose={() => {
          setShowSafeguardingModal(false);
          Alert.alert('Mood Recorded', 'Your mood has been saved. Remember, support is always available.');
        }}
        alertData={safeguardingAlert}
      />

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#6366F1"
            colors={['#6366F1']}
          />
        }
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: headerAnim,
              transform: [{
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>How are you feeling?</Text>
            <Text style={styles.subtitle}>
              Take a moment to check in with yourself
            </Text>
          </View>

          {/* Selected Mood Display */}
          {selectedMoodInfo && (
            <LinearGradient
              colors={selectedMoodInfo.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.selectedDisplay}
            >
              <Text style={styles.selectedEmoji}>{selectedMoodInfo.emoji}</Text>
              <View>
                <Text style={styles.selectedLabel}>Feeling {selectedMoodInfo.label}</Text>
                <Text style={styles.selectedValue}>{selectedMoodInfo.value}/10</Text>
              </View>
            </LinearGradient>
          )}

          {/* Mood Grid - Scrollable Horizontal */}
          <View style={styles.moodSection}>
            <Text style={styles.sectionLabel}>Select your mood</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moodScrollContent}
            >
              {MOODS.map((mood) => (
                <AnimatedMoodButton
                  key={mood.value}
                  mood={mood}
                  isSelected={selectedMood === mood.value}
                  onPress={() => setSelectedMood(mood.value)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Notes Input */}
          <View style={styles.notesContainer}>
            <Text style={styles.sectionLabel}>Add a note (optional)</Text>
            <View style={styles.notesInputContainer}>
              <TextInput
                style={styles.notesInput}
                placeholder="What's on your mind today?"
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
              {notes.length > 0 && (
                <Text style={styles.charCount}>{notes.length}/500</Text>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <Pressable
            onPressIn={() => {
              Animated.spring(buttonScale, {
                toValue: 0.96,
                useNativeDriver: true,
              }).start();
            }}
            onPressOut={() => {
              Animated.spring(buttonScale, {
                toValue: 1,
                useNativeDriver: true,
              }).start();
            }}
            onPress={handleSubmit}
            disabled={!selectedMood || isSubmitting}
          >
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <LinearGradient
                colors={selectedMood ? ['#6366F1', '#8B5CF6'] : ['#374151', '#4B5563']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButton}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={22} color="#fff" />
                    <Text style={styles.submitButtonText}>Log My Mood</Text>
                  </>
                )}
              </LinearGradient>
            </Animated.View>
          </Pressable>

          {/* History Section */}
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Recent Entries</Text>
              {moodHistory.length > 5 && (
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              )}
            </View>

            {isLoading ? (
              <View>
                {[1, 2, 3].map((i) => (
                  <MoodCardSkeleton key={i} />
                ))}
              </View>
            ) : moodHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="analytics-outline" size={40} color="#64748B" />
                </View>
                <Text style={styles.emptyText}>No mood entries yet</Text>
                <Text style={styles.emptySubtext}>
                  Start tracking to see your emotional journey
                </Text>
              </View>
            ) : (
              moodHistory.slice(0, 5).map((entry, index) => {
                const moodInfo = getMoodInfo(entry.mood);
                return (
                  <Animated.View 
                    key={entry.id} 
                    style={[
                      styles.historyItem,
                      { opacity: 1 },
                    ]}
                  >
                    <LinearGradient
                      colors={moodInfo.gradient}
                      style={styles.historyIconBg}
                    >
                      <Text style={styles.historyEmoji}>{moodInfo.emoji}</Text>
                    </LinearGradient>
                    <View style={styles.historyContent}>
                      <View style={styles.historyHeaderRow}>
                        <Text style={styles.historyMood}>
                          {moodInfo.label}
                        </Text>
                        <View style={styles.moodBadge}>
                          <Text style={[styles.moodBadgeText, { color: moodInfo.color }]}>
                            {entry.mood}/10
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.historyDate}>
                        {formatDate(entry.created_at)}
                      </Text>
                      {entry.notes && (
                        <Text style={styles.historyNotes} numberOfLines={2}>
                          {entry.notes}
                        </Text>
                      )}
                    </View>
                  </Animated.View>
                );
              })
            )}
          </View>

          {/* Wellbeing Signposting Section */}
          <View style={styles.signpostSection} data-testid="wellbeing-signposting">
            <View style={styles.signpostHeader}>
              <View style={styles.signpostIconBg}>
                <Ionicons name="shield-checkmark" size={22} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.signpostTitle}>Wellbeing Support</Text>
                <Text style={styles.signpostSubtext}>Help is always available. You are not alone.</Text>
              </View>
            </View>

            <View style={styles.signpostCards}>
              <TouchableOpacity style={styles.signpostCard} data-testid="signpost-samaritans">
                <View style={[styles.signpostCardIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Ionicons name="call" size={18} color="#EF4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.signpostCardTitle}>Samaritans</Text>
                  <Text style={styles.signpostCardPhone}>116 123</Text>
                  <Text style={styles.signpostCardDesc}>Free 24/7 emotional support</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.signpostCard} data-testid="signpost-shout">
                <View style={[styles.signpostCardIcon, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                  <Ionicons name="chatbubble-ellipses" size={18} color="#6366F1" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.signpostCardTitle}>Shout Crisis Text Line</Text>
                  <Text style={styles.signpostCardPhone}>Text SHOUT to 85258</Text>
                  <Text style={styles.signpostCardDesc}>Free, confidential text support 24/7</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.signpostCard} data-testid="signpost-papyrus">
                <View style={[styles.signpostCardIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Ionicons name="people" size={18} color="#F59E0B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.signpostCardTitle}>PAPYRUS HOPELineUK</Text>
                  <Text style={styles.signpostCardPhone}>0800 068 4141</Text>
                  <Text style={styles.signpostCardDesc}>For young people under 35</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.signpostCard} data-testid="signpost-student-minds">
                <View style={[styles.signpostCardIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Ionicons name="school" size={18} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.signpostCardTitle}>Student Minds</Text>
                  <Text style={styles.signpostCardPhone}>studentminds.org.uk</Text>
                  <Text style={styles.signpostCardDesc}>UK student mental health charity</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.signpostCard} data-testid="signpost-calm">
                <View style={[styles.signpostCardIcon, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                  <Ionicons name="heart" size={18} color="#06B6D4" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.signpostCardTitle}>CALM</Text>
                  <Text style={styles.signpostCardPhone}>0800 58 58 58</Text>
                  <Text style={styles.signpostCardDesc}>5pm-midnight every day</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.emergencyCard} data-testid="signpost-emergency">
                <Ionicons name="warning" size={20} color="#EF4444" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.emergencyTitle}>In immediate danger?</Text>
                  <Text style={styles.emergencyText}>Call 999 or go to your nearest A&E</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
  },
  selectedDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 16,
  },
  selectedEmoji: {
    fontSize: 44,
  },
  selectedLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  selectedValue: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  moodSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moodScrollContent: {
    paddingVertical: 8,
    gap: 8,
  },
  moodItem: {
    width: 72,
    height: 96,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  moodLabel: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesInputContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  notesInput: {
    padding: 16,
    color: '#F1F5F9',
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: '#64748B',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  historySection: {
    marginBottom: 24,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  viewAllText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.08)',
  },
  historyIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  historyEmoji: {
    fontSize: 24,
  },
  historyContent: {
    flex: 1,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  historyMood: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  moodBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  moodBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  historyDate: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  historyNotes: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginTop: 4,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  successContent: {
    alignItems: 'center',
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  successText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  signpostSection: {
    marginBottom: 40,
    marginTop: 8,
  },
  signpostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  signpostIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signpostTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  signpostSubtext: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  signpostCards: {
    gap: 8,
  },
  signpostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.08)',
    gap: 12,
  },
  signpostCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signpostCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  signpostCardPhone: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366F1',
    marginTop: 2,
  },
  signpostCardDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginTop: 4,
  },
  emergencyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  emergencyText: {
    fontSize: 13,
    color: '#FCA5A5',
    marginTop: 2,
  },
});
