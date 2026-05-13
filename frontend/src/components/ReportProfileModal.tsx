import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../services/api';

type Props = {
  visible: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUserName: string;
  sessionToken: string | null;
};

const REASONS: { value: string; label: string; icon: any }[] = [
  { value: 'hate_speech_or_racism', label: 'Hate speech / Racism', icon: 'warning-outline' },
  { value: 'harassment_or_bullying', label: 'Harassment / Bullying', icon: 'sad-outline' },
  { value: 'inappropriate_photos', label: 'Inappropriate photos', icon: 'image-outline' },
  { value: 'sexual_content', label: 'Sexual content', icon: 'eye-off-outline' },
  { value: 'violence_or_threats', label: 'Violence / Threats', icon: 'alert-circle-outline' },
  { value: 'spam_or_scam', label: 'Spam / Scam', icon: 'mail-unread-outline' },
  { value: 'fake_profile', label: 'Fake profile', icon: 'person-remove-outline' },
  { value: 'underage', label: 'Underage user', icon: 'school-outline' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal-circle-outline' },
];

export default function ReportProfileModal({
  visible,
  onClose,
  reportedUserId,
  reportedUserName,
  sessionToken,
}: Props) {
  const [selected, setSelected] = useState<string>('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setSelected('');
    setDetails('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const showFeedback = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSubmit = async () => {
    if (!selected) {
      showFeedback('Select a reason', 'Please choose why you are reporting this profile.');
      return;
    }
    const labelObj = REASONS.find((r) => r.value === selected);
    const reasonText = details.trim()
      ? `${labelObj?.label}: ${details.trim()}`
      : labelObj?.label || selected;

    setIsSubmitting(true);
    try {
      const res = await api.post(
        '/reports',
        { reported_user_id: reportedUserId, reason: reasonText },
        sessionToken,
      );
      showFeedback('Report submitted', res?.message || 'Thank you for keeping DEQUAD safe.');
      reset();
      onClose();
    } catch (err: any) {
      const msg = err?.message || 'Could not submit report. Please try again.';
      showFeedback('Unable to submit', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="flag" size={22} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} data-testid="report-modal-title">
                Report {reportedUserName}
              </Text>
              <Text style={styles.subtitle}>
                Your report is anonymous. Our safeguarding team reviews it within 24h.
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} data-testid="report-modal-close">
              <Ionicons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>What's wrong?</Text>
            {REASONS.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[styles.reason, selected === r.value && styles.reasonSelected]}
                onPress={() => setSelected(r.value)}
                data-testid={`report-reason-${r.value}`}
              >
                <Ionicons
                  name={r.icon}
                  size={20}
                  color={selected === r.value ? '#F87171' : '#94A3B8'}
                />
                <Text
                  style={[
                    styles.reasonText,
                    selected === r.value && styles.reasonTextSelected,
                  ]}
                >
                  {r.label}
                </Text>
                {selected === r.value && (
                  <Ionicons name="checkmark-circle" size={20} color="#EF4444" />
                )}
              </TouchableOpacity>
            ))}

            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>
              Add details (optional)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Tell us more so we can act faster..."
              placeholderTextColor="#64748B"
              value={details}
              onChangeText={setDetails}
              multiline
              maxLength={500}
              data-testid="report-details-input"
            />
            <Text style={styles.counter}>{details.length}/500</Text>

            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting || !selected}
              data-testid="report-submit-btn"
            >
              <LinearGradient
                colors={
                  selected && !isSubmitting
                    ? ['#EF4444', '#DC2626']
                    : ['#4B5563', '#6B7280']
                }
                style={styles.submitBtn}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="flag" size={18} color="#fff" />
                    <Text style={styles.submitText}>Submit report</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    maxHeight: '88%',
  },
  handle: {
    width: 44,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  subtitle: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  body: { maxHeight: 520 },
  sectionLabel: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reasonSelected: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  reasonText: { color: '#E2E8F0', fontSize: 15, flex: 1, fontWeight: '500' },
  reasonTextSelected: { color: '#FCA5A5' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    color: '#F8FAFC',
    fontSize: 14,
    textAlignVertical: 'top',
  },
  counter: { color: '#64748B', fontSize: 11, alignSelf: 'flex-end', marginTop: 4 },
  submitBtn: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 20,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
