import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';

interface AdminInvite {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  invited_by_name?: string;
  invited_by_email?: string;
  note?: string | null;
  created_at: string;
  expires_at: string;
  accepted_at?: string | null;
  invite_link?: string | null;
  email_sent?: boolean;
}

interface Props {
  sessionToken: string | null;
  apiBaseUrl: string;
}

const STATUS_COLOR: Record<AdminInvite['status'], string> = {
  pending: '#7B61FF',
  accepted: '#3FB950',
  revoked: '#7E7794',
  expired: '#D2691E',
};

export default function AdminInviteManager({ sessionToken, apiBaseUrl }: Props) {
  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState('');
  const [latestLink, setLatestLink] = useState<string | null>(null);
  const [latestEmailSent, setLatestEmailSent] = useState<boolean | null>(null);

  const headers = useCallback(
    (): Record<string, string> => ({
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    }),
    [sessionToken],
  );

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/invites`, { headers: headers() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setInvites(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load admin invites', e);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, headers]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    setSubmitErr('');
    setLatestLink(null);
    setLatestEmailSent(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setSubmitErr('Enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/invites`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email: trimmed, note: note.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `HTTP ${res.status}`);
      }
      const created: AdminInvite = await res.json();
      setLatestLink(created.invite_link || null);
      setLatestEmailSent(created.email_sent ?? null);
      setEmail('');
      setNote('');
      await load();
    } catch (e: any) {
      setSubmitErr(e?.message || 'Failed to create invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (inviteId: string) => {
    if (
      Platform.OS === 'web' &&
      typeof window !== 'undefined' &&
      !window.confirm('Revoke this admin invitation?')
    ) {
      return;
    }
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/invites/${inviteId}`, {
        method: 'DELETE',
        headers: headers(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch (e) {
      console.error('Failed to revoke invite', e);
    }
  };

  const copyLink = (link: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(link).catch(() => {});
    }
  };

  return (
    <View style={styles.card} data-testid="admin-invite-manager">
      <Text style={styles.title}>Invite a new admin</Text>
      <Text style={styles.subtitle}>
        Send a one-time secure link to a new staff member. They'll set their own password and become
        an admin on this DEQUAD instance.
      </Text>

      <View style={styles.formRow}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="staff.member@dequad.com"
          placeholderTextColor="#7E7794"
          autoCapitalize="none"
          keyboardType="email-address"
          style={[styles.input, { flexGrow: 2 }]}
          data-testid="admin-invite-email"
        />
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Role / context (optional)"
          placeholderTextColor="#7E7794"
          style={[styles.input, { flexGrow: 1 }]}
          data-testid="admin-invite-note"
        />
        <Pressable
          onPress={handleCreate}
          disabled={submitting}
          style={[styles.button, submitting && { opacity: 0.6 }]}
          data-testid="admin-invite-send"
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send invite</Text>
          )}
        </Pressable>
      </View>

      {!!submitErr && (
        <Text style={styles.errorText} data-testid="admin-invite-error">{submitErr}</Text>
      )}

      {latestLink && (
        <View style={styles.latestBox} data-testid="admin-invite-latest">
          <Text style={styles.latestTitle}>
            Invitation created {latestEmailSent ? '✉️ email sent' : '⚠️ email NOT sent — share link manually'}
          </Text>
          <Text selectable style={styles.latestLink}>{latestLink}</Text>
          <Pressable onPress={() => copyLink(latestLink)} style={styles.copyButton} data-testid="admin-invite-copy-link">
            <Text style={styles.copyText}>Copy link</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.sectionTitle}>Recent invitations</Text>
      {loading ? (
        <ActivityIndicator color="#7B61FF" />
      ) : invites.length === 0 ? (
        <Text style={styles.empty} data-testid="admin-invite-empty">No invitations yet.</Text>
      ) : (
        invites.map((inv) => (
          <View key={inv.id} style={styles.row} data-testid={`admin-invite-row-${inv.id}`}>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.rowEmail}>{inv.email}</Text>
              <Text style={styles.rowMeta}>
                Invited by {inv.invited_by_name || inv.invited_by_email || 'admin'} ·{' '}
                {new Date(inv.created_at).toLocaleDateString()}
                {inv.note ? ` · ${inv.note}` : ''}
              </Text>
              {inv.status === 'pending' && inv.invite_link && (
                <Text selectable style={styles.rowLink}>{inv.invite_link}</Text>
              )}
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.badge, { backgroundColor: STATUS_COLOR[inv.status] }]}>
                {inv.status}
              </Text>
              {inv.status === 'pending' && (
                <Pressable onPress={() => handleRevoke(inv.id)} style={styles.revokeButton} data-testid={`admin-invite-revoke-${inv.id}`}>
                  <Text style={styles.revokeText}>Revoke</Text>
                </Pressable>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#E6E2F0',
    gap: 14,
  },
  title: { fontSize: 18, fontWeight: '800', color: '#1A1530' },
  subtitle: { fontSize: 13, color: '#5A5470', lineHeight: 18 },
  formRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  input: {
    minWidth: 180,
    borderWidth: 1,
    borderColor: '#D5CFE3',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1530',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#7B61FF',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  errorText: { color: '#D63B45', fontSize: 13 },
  latestBox: {
    backgroundColor: '#F4F1FB',
    borderRadius: 10,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#D9CFFB',
  },
  latestTitle: { fontWeight: '700', color: '#1A1530', fontSize: 13 },
  latestLink: { color: '#5A5470', fontSize: 12, fontFamily: Platform.OS === 'web' ? 'monospace' : undefined },
  copyButton: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#7B61FF', borderRadius: 6 },
  copyText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1A1530', marginTop: 6 },
  empty: { color: '#7E7794', fontStyle: 'italic', fontSize: 13 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#EEEAF7',
    gap: 12,
  },
  rowEmail: { fontSize: 14, fontWeight: '700', color: '#1A1530' },
  rowMeta: { fontSize: 12, color: '#7E7794', marginTop: 2 },
  rowLink: { fontSize: 11, color: '#7B61FF', marginTop: 4, fontFamily: Platform.OS === 'web' ? 'monospace' : undefined },
  rowRight: { alignItems: 'flex-end', gap: 6 },
  badge: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    textTransform: 'uppercase',
    overflow: 'hidden',
  },
  revokeButton: { paddingHorizontal: 10, paddingVertical: 5 },
  revokeText: { color: '#D63B45', fontSize: 12, fontWeight: '700' },
});
