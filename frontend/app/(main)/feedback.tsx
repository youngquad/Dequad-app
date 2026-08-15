import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/services/api';
import SafeguardingAlert from '../../src/components/SafeguardingAlert';
import { MoodCardSkeleton } from '../../src/components/SkeletonLoader';
import { getMoodInfo } from '../../src/utils/moods';
import { notify } from '../../src/utils/alert';

interface FeedbackEntry {
  id: string;
  mood: number;
  feedback: string;
  lecture_topic?: string;
  created_at: string;
}

export default function FeedbackScreen() {
  const { sessionToken } = useAuth();
  const [mood, setMood] = useState<number>(5);
  const [lectureTopic, setLectureTopic] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [safeguardingAlert, setSafeguardingAlert] = useState<any>(null);
  const [showSafeguardingModal, setShowSafeguardingModal] = useState(false);

  useEffect(() => {
    loadFeedbackHistory();
  }, []);

  const loadFeedbackHistory = async () => {
    try {
      const data = await api.get('/feedback', sessionToken);
      setFeedbackHistory(data);
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadFeedbackHistory();
  };

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      notify('Required', 'Please enter your feedback');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await api.post(
        '/feedback',
        {
          mood,
          feedback: feedback.trim(),
          lecture_topic: lectureTopic.trim() || null,
        },
        sessionToken
      );
      
      // Check for safeguarding alert
      if (result.safeguarding_alert && result.safeguarding_alert.flagged) {
        setSafeguardingAlert(result.safeguarding_alert);
        setShowSafeguardingModal(true);
      } else {
        notify('Thank You!', 'Your feedback has been submitted successfully.');
      }

      setFeedback('');
      setLectureTopic('');
      setMood(5);
      loadFeedbackHistory();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      notify('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMoodEmoji = (value: number) => getMoodInfo(value).emoji;
  const getMoodColor = (value: number) => getMoodInfo(value).color;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Safeguarding Alert Modal */}
      <SafeguardingAlert
        visible={showSafeguardingModal}
        onClose={() => {
          setShowSafeguardingModal(false);
          notify('Feedback Submitted', 'Your feedback has been saved. Remember, support is always available.');
        }}
        alertData={safeguardingAlert}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
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
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.headerCard}>
              <Ionicons name="chatbox-ellipses" size={32} color="#5B9BD5" />
              <Text style={styles.headerTitle}>Lecture Feedback</Text>
              <Text style={styles.headerSubtitle}>
                Share your thoughts about your lectures to help us improve your experience
              </Text>
            </View>

            {/* Feedback Form */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>How did you feel during the lecture?</Text>
              <View style={styles.moodSlider}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.moodDot,
                      mood === value && [styles.moodDotActive, { backgroundColor: getMoodColor(value) }],
                    ]}
                    onPress={() => setMood(value)}
                  >
                    <Text
                      style={[
                        styles.moodDotText,
                        mood === value && styles.moodDotTextActive,
                      ]}
                    >
                      {value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.moodIndicator}>
                <Text style={styles.moodEmoji}>{getMoodEmoji(mood)}</Text>
                <Text style={[styles.moodLabel, { color: getMoodColor(mood) }]}>
                  {getMoodInfo(mood).label}
                </Text>
              </View>

              <Text style={styles.inputLabel}>Lecture Topic (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Introduction to Psychology"
                placeholderTextColor="#6B7280"
                value={lectureTopic}
                onChangeText={setLectureTopic}
              />

              <Text style={styles.inputLabel}>Your Feedback *</Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Share your thoughts about the lecture, how you felt, any challenges or suggestions..."
                  placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={4}
                  maxLength={1000}
                  value={feedback}
                  onChangeText={setFeedback}
                />
                {feedback.length > 0 && (
                  <Text style={styles.charCount}>{feedback.length}/1000</Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !feedback.trim() && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!feedback.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="send" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Submit Feedback</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#5B9BD5" />
              <Text style={styles.infoText}>
                Your feedback helps us understand how you're doing and improve the learning experience. 
                All feedback is confidential.
              </Text>
            </View>

            {/* Feedback History */}
            <View style={styles.historySection}>
              <Text style={styles.historyTitle}>Your Feedback History</Text>
              {isLoading ? (
                <View>
                  {[1, 2, 3].map((i) => (
                    <MoodCardSkeleton key={i} />
                  ))}
                </View>
              ) : feedbackHistory.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={48} color="#4B5563" />
                  <Text style={styles.emptyText}>No feedback submitted yet</Text>
                  <Text style={styles.emptySubtext}>Your submissions will appear here</Text>
                </View>
              ) : (
                feedbackHistory.slice(0, 10).map((entry) => (
                  <View key={entry.id} style={styles.historyItem}>
                    <View style={styles.historyHeader}>
                      <View style={styles.historyTopicRow}>
                        <Text style={styles.historyMoodEmoji}>{getMoodEmoji(entry.mood)}</Text>
                        <Text style={styles.historyTopic}>
                          {entry.lecture_topic || 'General Feedback'}
                        </Text>
                      </View>
                      <Text style={styles.historyDate}>
                        {formatDate(entry.created_at)}
                      </Text>
                    </View>
                    <Text style={styles.historyFeedback} numberOfLines={3}>
                      {entry.feedback}
                    </Text>
                    <View style={[styles.moodBadge, { backgroundColor: getMoodColor(entry.mood) + '20' }]}>
                      <Text style={[styles.moodBadgeText, { color: getMoodColor(entry.mood) }]}>
                        Mood: {entry.mood}/10
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    // Extra bottom padding so the last history item clears the floating
    // (position: 'absolute') tab bar instead of being hidden under it.
    paddingBottom: 100,
  },
  headerCard: {
    backgroundColor: 'rgba(91, 155, 213, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  moodSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  moodDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodDotActive: {
    backgroundColor: '#6366F1',
  },
  moodDotText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  moodDotTextActive: {
    color: '#fff',
  },
  moodIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  moodEmoji: {
    fontSize: 28,
    marginRight: 8,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  textAreaContainer: {
    position: 'relative',
  },
  charCount: {
    position: 'absolute',
    bottom: 24,
    right: 12,
    fontSize: 12,
    color: '#64748B',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B9BD5',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#374151',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(91, 155, 213, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#9CA3AF',
    marginLeft: 12,
    lineHeight: 18,
  },
  historySection: {
    marginBottom: 24,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  historyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historyTopicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyMoodEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  historyTopic: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  historyDate: {
    fontSize: 11,
    color: '#6B7280',
  },
  historyFeedback: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
    lineHeight: 20,
  },
  moodBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moodBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
