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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/services/api';
import SafeguardingAlert from '../../src/components/SafeguardingAlert';

const MOODS = [
  { value: 1, emoji: 'sad-outline', label: 'Very Bad', color: '#EF4444' },
  { value: 2, emoji: 'sad-outline', label: 'Bad', color: '#F97316' },
  { value: 3, emoji: 'sad-outline', label: 'Poor', color: '#F59E0B' },
  { value: 4, emoji: 'remove-outline', label: 'Below Avg', color: '#EAB308' },
  { value: 5, emoji: 'remove-outline', label: 'Average', color: '#84CC16' },
  { value: 6, emoji: 'remove-outline', label: 'Okay', color: '#22C55E' },
  { value: 7, emoji: 'happy-outline', label: 'Good', color: '#10B981' },
  { value: 8, emoji: 'happy-outline', label: 'Great', color: '#14B8A6' },
  { value: 9, emoji: 'happy-outline', label: 'Excellent', color: '#06B6D4' },
  { value: 10, emoji: 'happy-outline', label: 'Amazing', color: '#6366F1' },
];

interface MoodEntry {
  id: string;
  mood: number;
  notes?: string;
  created_at: string;
}

export default function MoodScreen() {
  const { sessionToken } = useAuth();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [safeguardingAlert, setSafeguardingAlert] = useState<any>(null);
  const [showSafeguardingModal, setShowSafeguardingModal] = useState(false);

  useEffect(() => {
    loadMoodHistory();
  }, []);

  const loadMoodHistory = async () => {
    try {
      const data = await api.get('/mood', sessionToken);
      setMoodHistory(data);
    } catch (error) {
      console.error('Error loading mood history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) {
      Alert.alert('Select Mood', 'Please select your current mood');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/mood', { mood: selectedMood, notes }, sessionToken);
      
      // Check for safeguarding alert
      if (response.safeguarding_alert && response.safeguarding_alert.flagged) {
        setSafeguardingAlert(response.safeguarding_alert);
        setShowSafeguardingModal(true);
      } else {
        Alert.alert('Success', 'Your mood has been recorded!');
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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
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
          Alert.alert('Mood Recorded', 'Your mood has been saved. Remember, support is always available.');
        }}
        alertData={safeguardingAlert}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>How are you feeling?</Text>
          <Text style={styles.subtitle}>
            Select your current mood on a scale of 1-10
          </Text>

          <View style={styles.moodGrid}>
            {MOODS.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={[
                  styles.moodItem,
                  selectedMood === mood.value && {
                    backgroundColor: mood.color + '30',
                    borderColor: mood.color,
                  },
                ]}
                onPress={() => setSelectedMood(mood.value)}
              >
                <Ionicons
                  name={mood.emoji as any}
                  size={28}
                  color={selectedMood === mood.value ? mood.color : '#9CA3AF'}
                />
                <Text
                  style={[
                    styles.moodValue,
                    selectedMood === mood.value && { color: mood.color },
                  ]}
                >
                  {mood.value}
                </Text>
                <Text
                  style={[
                    styles.moodLabel,
                    selectedMood === mood.value && { color: mood.color },
                  ]}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Add a note (optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="How's your day going?"
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              !selectedMood && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!selectedMood || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.submitButtonText}>Log Mood</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Recent Moods</Text>
            {isLoading ? (
              <ActivityIndicator color="#6366F1" style={{ marginTop: 20 }} />
            ) : moodHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="analytics-outline" size={48} color="#4B5563" />
                <Text style={styles.emptyText}>No mood entries yet</Text>
                <Text style={styles.emptySubtext}>
                  Start tracking to see your history
                </Text>
              </View>
            ) : (
              moodHistory.slice(0, 5).map((entry) => {
                const moodInfo = getMoodInfo(entry.mood);
                return (
                  <View key={entry.id} style={styles.historyItem}>
                    <View
                      style={[
                        styles.historyIcon,
                        { backgroundColor: moodInfo.color + '20' },
                      ]}
                    >
                      <Ionicons
                        name={moodInfo.emoji as any}
                        size={24}
                        color={moodInfo.color}
                      />
                    </View>
                    <View style={styles.historyContent}>
                      <View style={styles.historyHeader}>
                        <Text style={styles.historyMood}>
                          {moodInfo.label} ({entry.mood}/10)
                        </Text>
                        <Text style={styles.historyDate}>
                          {formatDate(entry.created_at)}
                        </Text>
                      </View>
                      {entry.notes && (
                        <Text style={styles.historyNotes}>{entry.notes}</Text>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  moodItem: {
    width: '18%',
    aspectRatio: 0.8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    padding: 4,
  },
  moodValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginTop: 4,
  },
  moodLabel: {
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
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
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyMood: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  historyDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  historyNotes: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
