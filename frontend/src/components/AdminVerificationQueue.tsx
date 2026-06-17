/**
 * Admin "Pending student verification" queue.
 *
 * Backed by:
 *   GET    /api/admin/pending-verifications
 *   POST   /api/admin/pending-verifications/:user_id/approve
 *   POST   /api/admin/pending-verifications/:user_id/reject
 *
 * Surfaces every user whose `student_verification` is `self_declared`
 * (email/password sign-up — checked the UK-student box) or `pending_review`
 * (Google sign-in with a bare `.ac.uk` domain). Admin can approve to mark
 * them `verified`, or reject to hard-delete the account.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';

type PendingUser = {
  user_id: string;
  email: string;
  name?: string | null;
  role: string;
  student_verification: 'self_declared' | 'pending_review';
  university: string;
  created_at: string | null;
  auth_method: 'password' | 'google';
};

type Props = { sessionToken: string | null };

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function confirmAsync(title: string, message: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      // `Alert.alert` on react-native-web doesn't show buttons. Fall back to
      // the browser confirm which is good enough for an admin tool.
      // eslint-disable-next-line no-alert
      resolve(window.confirm(`${title}\n\n${message}`));
      return;
    }
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Confirm', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

export const AdminVerificationQueue: React.FC<Props> = ({ sessionToken }) => {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!sessionToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/admin/pending-verifications', sessionToken);
      setUsers(data?.users ?? []);
    } catch (e: any) {
      setError(e?.message?.replace(/^Error:\s*/, '') ?? 'Failed to load queue.');
    } finally {
      setLoading(false);
    }
  }, [sessionToken]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (u: PendingUser) => {
    setBusyId(u.user_id);
    try {
      await api.post(
        `/admin/pending-verifications/${u.user_id}/approve`,
        {},
        sessionToken,
      );
      setUsers((prev) => prev.filter((x) => x.user_id !== u.user_id));
    } catch (e: any) {
      setError(e?.message?.replace(/^Error:\s*/, '') ?? 'Failed to approve.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (u: PendingUser) => {
    const ok = await confirmAsync(
      'Delete this account?',
      `Reject ${u.email}? Their account and sessions will be permanently removed. This cannot be undone.`,
    );
    if (!ok) return;
    setBusyId(u.user_id);
    try {
      await api.post(
        `/admin/pending-verifications/${u.user_id}/reject`,
        {},
        sessionToken,
      );
      setUsers((prev) => prev.filter((x) => x.user_id !== u.user_id));
    } catch (e: any) {
      setError(e?.message?.replace(/^Error:\s*/, '') ?? 'Failed to reject.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center} data-testid="verifications-loading">
        <ActivityIndicator color="#6366F1" />
      </View>
    );
  }

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.headerCount} data-testid="verifications-count">
          {users.length} pending
        </Text>
        <TouchableOpacity
          onPress={load}
          style={styles.refreshBtn}
          data-testid="verifications-refresh"
        >
          <Ionicons name="refresh" size={16} color="#6366F1" />
          <Text style={styles.refreshBtnText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBox} data-testid="verifications-error">
          <Ionicons name="alert-circle" size={16} color="#B91C1C" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {users.length === 0 ? (
        <View style={styles.emptyBox} data-testid="verifications-empty">
          <Ionicons name="checkmark-circle" size={36} color="#10B981" />
          <Text style={styles.emptyTitle}>All clear</Text>
          <Text style={styles.emptyText}>
            No accounts are waiting for student verification right now.
          </Text>
        </View>
      ) : (
        users.map((u) => (
          <View
            key={u.user_id}
            style={styles.card}
            data-testid={`verification-row-${u.user_id}`}
          >
            <View style={styles.cardLeft}>
              <Text style={styles.name} numberOfLines={1}>
                {u.name || u.email.split('@')[0]}
              </Text>
              <Text style={styles.email} numberOfLines={1}>{u.email}</Text>
              <View style={styles.metaRow}>
                <View style={styles.tag}>
                  <Ionicons name="school-outline" size={11} color="#4F6076" />
                  <Text style={styles.tagText}>{u.university || 'unknown'}</Text>
                </View>
                <View
                  style={[
                    styles.tag,
                    u.student_verification === 'self_declared'
                      ? styles.tagAmber
                      : styles.tagBlue,
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      u.student_verification === 'self_declared'
                        ? styles.tagTextAmber
                        : styles.tagTextBlue,
                    ]}
                  >
                    {u.student_verification === 'self_declared'
                      ? 'Self-declared'
                      : 'Google · pending review'}
                  </Text>
                </View>
                <View style={styles.tag}>
                  <Ionicons
                    name={u.auth_method === 'google' ? 'logo-google' : 'mail-outline'}
                    size={11}
                    color="#4F6076"
                  />
                  <Text style={styles.tagText}>{u.auth_method}</Text>
                </View>
                <Text style={styles.dateText}>{formatDate(u.created_at)}</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => handleApprove(u)}
                disabled={busyId === u.user_id}
                style={[
                  styles.actionBtn,
                  styles.approveBtn,
                  busyId === u.user_id && styles.btnDisabled,
                ]}
                data-testid={`verification-approve-${u.user_id}`}
              >
                <Ionicons name="checkmark" size={15} color="#FFFFFF" />
                <Text style={styles.approveBtnText}>Verify</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleReject(u)}
                disabled={busyId === u.user_id}
                style={[
                  styles.actionBtn,
                  styles.rejectBtn,
                  busyId === u.user_id && styles.btnDisabled,
                ]}
                data-testid={`verification-reject-${u.user_id}`}
              >
                <Ionicons name="trash-outline" size={15} color="#B91C1C" />
                <Text style={styles.rejectBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  center: { paddingVertical: 28, alignItems: 'center' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerCount: { color: '#0F2942', fontWeight: '800', fontSize: 14, letterSpacing: 0.3 },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  refreshBtnText: { color: '#6366F1', fontSize: 12, fontWeight: '700' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: { color: '#B91C1C', flex: 1, fontSize: 13 },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    backgroundColor: '#F0FDF4',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  emptyTitle: { color: '#0F2942', fontSize: 17, fontWeight: '800', marginTop: 10 },
  emptyText: { color: '#4F6076', fontSize: 13, textAlign: 'center', marginTop: 4, lineHeight: 19 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardLeft: { flex: 1, minWidth: 0 },
  name: { color: '#0F2942', fontWeight: '700', fontSize: 14 },
  email: { color: '#4F6076', fontSize: 12, marginTop: 2 },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  tagText: { color: '#4F6076', fontSize: 11, fontWeight: '600' },
  tagAmber: { backgroundColor: '#FEF3C7' },
  tagTextAmber: { color: '#92400E' },
  tagBlue: { backgroundColor: '#DBEAFE' },
  tagTextBlue: { color: '#1E40AF' },
  dateText: { color: '#94A3B0', fontSize: 11, marginLeft: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    minWidth: 88,
    justifyContent: 'center',
  },
  approveBtn: { backgroundColor: '#10B981' },
  approveBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  rejectBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectBtnText: { color: '#B91C1C', fontSize: 12, fontWeight: '800' },
  btnDisabled: { opacity: 0.5 },
});

export default AdminVerificationQueue;
