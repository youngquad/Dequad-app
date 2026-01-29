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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/services/api';

interface FeedbackEntry {
  id: string;
  mood: number;
  feedback: string;
  lecture_topic?: string;
  risk_score?: number;
  ai_analysis?: string;
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
  const [lastAnalysis, setLastAnalysis] = useState<FeedbackEntry | null>(null);

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
    }
  };

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      Alert.alert('Required', 'Please enter your feedback');
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
      
      setLastAnalysis(result);
      Alert.alert('Feedback Submitted', 'Your feedback has been analyzed by our AI!');
      setFeedback('');
      setLectureTopic('');
      setMood(5);
      loadFeedbackHistory();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRiskColor = (score?: number) => {
    if (!score) return '#6B7280';
    if (score < 30) return '#10B981';
    if (score < 60) return '#F59E0B';
    return '#EF4444';
  };

  const getRiskLabel = (score?: number) => {
    if (!score) return 'Unknown';
    if (score < 30) return 'Low Risk';
    if (score < 60) return 'Moderate Risk';
    return 'High Risk';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.headerCard}>
              <Ionicons name="analytics" size={32} color="#6366F1" />
              <Text style={styles.headerTitle}>AI-Powered Analysis</Text>
              <Text style={styles.headerSubtitle}>
                Submit your lecture feedback and get personalized wellbeing insights
              </Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Your Mood During Lecture</Text>
              <View style={styles.moodSlider}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.moodDot,
                      mood === value && styles.moodDotActive,
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

              <Text style={styles.inputLabel}>Lecture Topic (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Introduction to Psychology"
                placeholderTextColor="#6B7280"
                value={lectureTopic}
                onChangeText={setLectureTopic}
              />

              <Text style={styles.inputLabel}>Your Feedback</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Share your thoughts about the lecture, how you felt during it, any challenges or concerns..."
                placeholderTextColor="#6B7280"
                multiline
                numberOfLines={4}
                value={feedback}
                onChangeText={setFeedback}
              />

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
                    <Ionicons name="sparkles" size={24} color="#fff" />
                    <Text style={styles.submitButtonText}>
                      Analyze with AI
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {lastAnalysis && (
              <View style={styles.analysisCard}>
                <View style={styles.analysisHeader}>
                  <Ionicons name="bulb" size={24} color="#F59E0B" />
                  <Text style={styles.analysisTitle}>Latest AI Analysis</Text>
                </View>
                <View
                  style={[
                    styles.riskBadge,
                    { backgroundColor: getRiskColor(lastAnalysis.risk_score) + '20' },
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={20}
                    color={getRiskColor(lastAnalysis.risk_score)}
                  />
                  <Text
                    style={[
                      styles.riskText,
                      { color: getRiskColor(lastAnalysis.risk_score) },
                    ]}
                  >
                    {getRiskLabel(lastAnalysis.risk_score)} ({lastAnalysis.risk_score}/100)
                  </Text>
                </View>
                <Text style={styles.analysisText}>{lastAnalysis.ai_analysis}</Text>
              </View>
            )}

            <View style={styles.historySection}>
              <Text style={styles.historyTitle}>Feedback History</Text>
              {isLoading ? (
                <ActivityIndicator color="#6366F1" style={{ marginTop: 20 }} />
              ) : feedbackHistory.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={48} color="#4B5563" />
                  <Text style={styles.emptyText}>No feedback submitted yet</Text>
                </View>
              ) : (
                feedbackHistory.slice(0, 5).map((entry) => (
                  <View key={entry.id} style={styles.historyItem}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyTopic}>
                        {entry.lecture_topic || 'General Feedback'}
                      </Text>
                      <Text style={styles.historyDate}>
                        {formatDate(entry.created_at)}
                      </Text>
                    </View>
                    <Text style={styles.historyFeedback} numberOfLines={2}>
                      {entry.feedback}
                    </Text>
                    {entry.risk_score !== undefined && (
                      <View
                        style={[
                          styles.historyRisk,
                          { backgroundColor: getRiskColor(entry.risk_score) + '20' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.historyRiskText,
                            { color: getRiskColor(entry.risk_score) },
                          ]}
                        >
                          {getRiskLabel(entry.risk_score)}
                        </Text>
                      </View>
                    )}
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
  headerCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  moodSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  moodDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodDotActive: {
    backgroundColor: '#6366F1',
  },
  moodDotText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  moodDotTextActive: {
    color: '#fff',
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
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#374151',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  analysisCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  riskText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  analysisText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 22,
  },
  historySection: {
    marginBottom: 24,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  historyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTopic: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  historyDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  historyFeedback: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  historyRisk: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyRiskText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
