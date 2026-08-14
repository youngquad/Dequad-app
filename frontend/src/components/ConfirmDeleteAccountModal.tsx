import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

const CONFIRM_WORD = 'DELETE';

// Cross-platform replacement for window.prompt (web) / Alert.prompt (native).
// Alert.prompt is iOS-only — on Android it silently does nothing, so the
// delete-account flow was effectively broken there before this component.
export default function ConfirmDeleteAccountModal({ visible, onClose, onConfirm }: Props) {
  const [typed, setTyped] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const canConfirm = typed.trim() === CONFIRM_WORD && !isDeleting;

  const handleClose = () => {
    if (isDeleting) return;
    setTyped('');
    onClose();
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
      setTyped('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={styles.content}>
          <View style={styles.handle} />

          <View style={styles.iconWrap}>
            <Ionicons name="warning" size={28} color="#EF4444" />
          </View>

          <Text style={styles.title}>Permanently delete your account?</Text>
          <Text style={styles.body}>
            This is irreversible. You will lose your profile, photos and bio, every match and
            chat, all mood-tracker history, and your premium subscription (active subs are
            auto-cancelled — no refund).
          </Text>

          <Text style={styles.confirmLabel}>
            Type <Text style={styles.confirmWord}>{CONFIRM_WORD}</Text> to confirm
          </Text>
          <TextInput
            style={styles.input}
            value={typed}
            onChangeText={setTyped}
            placeholder={CONFIRM_WORD}
            placeholderTextColor="#4B5563"
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!isDeleting}
            data-testid="delete-account-confirm-input"
          />

          <TouchableOpacity
            style={[styles.deleteButton, !canConfirm && styles.deleteButtonDisabled]}
            onPress={handleConfirm}
            disabled={!canConfirm}
            data-testid="delete-account-confirm-btn"
          >
            {isDeleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.deleteButtonText}>Delete forever</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={handleClose} disabled={isDeleting}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  content: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#4B5563',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  confirmLabel: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 8,
  },
  confirmWord: {
    color: '#EF4444',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    padding: 14,
    color: '#F8FAFC',
    fontSize: 16,
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButtonDisabled: {
    backgroundColor: 'rgba(127, 29, 29, 0.35)',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
  },
});
