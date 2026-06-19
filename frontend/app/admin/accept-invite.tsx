import { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { api } from '../../src/services/api';

type LoadState = 'loading' | 'valid' | 'invalid' | 'submitting' | 'success';

export default function AcceptInvite() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const token = (params.token as string) || '';

  const [state, setState] = useState<LoadState>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [invitedEmail, setInvitedEmail] = useState('');
  const [invitedByName, setInvitedByName] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitErr, setSubmitErr] = useState('');

  useEffect(() => {
    if (!token) {
      setState('invalid');
      setErrorMsg('No invitation token in the link.');
      return;
    }
    (async () => {
      try {
        const data = await api.get(`/admin/invites/by-token/${encodeURIComponent(token)}`);
        setInvitedEmail(data.email || '');
        setInvitedByName(data.invited_by_name || 'a DEQUAD admin');
        setState('valid');
      } catch (err: any) {
        setState('invalid');
        setErrorMsg(err?.message || 'This invitation is no longer valid.');
      }
    })();
  }, [token]);

  const handleAccept = async () => {
    setSubmitErr('');
    if (!name.trim()) {
      setSubmitErr('Please enter your full name.');
      return;
    }
    if (password.length < 8) {
      setSubmitErr('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setSubmitErr('Passwords do not match.');
      return;
    }
    setState('submitting');
    try {
      const res = await api.post('/admin/invites/accept', {
        token,
        name: name.trim(),
        password,
      });
      if (res?.success) {
        setState('success');
      } else {
        setSubmitErr('Could not accept invitation.');
        setState('valid');
      }
    } catch (err: any) {
      setSubmitErr(err?.message || 'Could not accept invitation.');
      setState('valid');
    }
  };

  const goToAdminLogin = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    } else {
      router.replace('/(admin)/login' as any);
    }
  };

  return (
    <View style={styles.page} data-testid="accept-invite-page">
      <View style={styles.card}>
        <Text style={styles.brand}>DEQUAD</Text>
        <Text style={styles.subBrand}>Admin invitation</Text>

        {state === 'loading' && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#7B61FF" />
            <Text style={styles.body}>Checking your invitation…</Text>
          </View>
        )}

        {state === 'invalid' && (
          <View style={styles.center}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.heading} data-testid="invite-invalid-heading">Invitation unavailable</Text>
            <Text style={styles.body} data-testid="invite-invalid-message">{errorMsg}</Text>
            <Text style={styles.helper}>Ask the admin who invited you to send a new invitation.</Text>
          </View>
        )}

        {(state === 'valid' || state === 'submitting') && (
          <>
            <Text style={styles.heading}>Set your password</Text>
            <Text style={styles.body}>
              You were invited by <Text style={styles.strong}>{invitedByName}</Text> to join the DEQUAD
              admin team as <Text style={styles.strong}>{invitedEmail}</Text>.
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="#7E7794"
                style={styles.input}
                editable={state !== 'submitting'}
                data-testid="invite-name-input"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password (min 8 chars)</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Choose a strong password"
                placeholderTextColor="#7E7794"
                secureTextEntry
                style={styles.input}
                editable={state !== 'submitting'}
                data-testid="invite-password-input"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirm password</Text>
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Re-enter password"
                placeholderTextColor="#7E7794"
                secureTextEntry
                style={styles.input}
                editable={state !== 'submitting'}
                data-testid="invite-confirm-input"
              />
            </View>

            {!!submitErr && (
              <Text style={styles.errorText} data-testid="invite-error">{submitErr}</Text>
            )}

            <Pressable
              onPress={handleAccept}
              disabled={state === 'submitting'}
              style={[styles.cta, state === 'submitting' && { opacity: 0.6 }]}
              data-testid="invite-accept-submit"
            >
              {state === 'submitting' ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.ctaText}>Accept invitation</Text>
              )}
            </Pressable>
          </>
        )}

        {state === 'success' && (
          <View style={styles.center}>
            <Text style={styles.emoji}>🎉</Text>
            <Text style={styles.heading} data-testid="invite-success-heading">You're an admin</Text>
            <Text style={styles.body}>
              Your admin account is ready. Sign in with <Text style={styles.strong}>{invitedEmail}</Text>{' '}
              and the password you just set.
            </Text>
            <Pressable
              onPress={goToAdminLogin}
              style={styles.cta}
              data-testid="invite-go-to-login"
            >
              <Text style={styles.ctaText}>Go to admin login</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#0E0B1F',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#1A1530',
    borderRadius: 24,
    padding: 36,
    maxWidth: 480,
    width: '100%',
    gap: 14,
  },
  brand: { color: '#7B61FF', fontWeight: '900', fontSize: 18, letterSpacing: 4 },
  subBrand: { color: '#A39DB8', fontSize: 14, marginBottom: 8 },
  heading: { color: '#fff', fontSize: 22, fontWeight: '700' },
  body: { color: '#C5BFD9', fontSize: 15, lineHeight: 22 },
  helper: { color: '#7E7794', fontSize: 13, marginTop: 8 },
  strong: { color: '#fff', fontWeight: '700' },
  emoji: { fontSize: 52, textAlign: 'center', marginBottom: 8 },
  center: { alignItems: 'center', gap: 12 },
  field: { gap: 6, marginTop: 6 },
  label: { color: '#C5BFD9', fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: '#0E0B1F',
    color: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#332D4A',
    fontSize: 15,
  },
  errorText: { color: '#FF6B6B', fontSize: 13, marginTop: 2 },
  cta: {
    marginTop: 16,
    backgroundColor: '#7B61FF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
