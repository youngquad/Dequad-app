import { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { api } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';

type ConfirmState = 'loading' | 'success' | 'pending' | 'error';

export default function SubscriptionSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams<{ session_id?: string }>();
  const { sessionToken, refreshUser } = useAuth();
  const [state, setState] = useState<ConfirmState>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const confirm = async () => {
      if (cancelled) return;
      attempts += 1;
      try {
        const res = await api.post('/subscription/confirm-payment', {}, sessionToken);
        if (cancelled) return;
        if (res?.success) {
          setState('success');
          setMessage('Welcome to Premium! Unlimited likes are unlocked.');
          try { await refreshUser(); } catch {}
        } else if (attempts < 6) {
          // Subscription may take a few seconds to activate after Apple Pay returns.
          setTimeout(confirm, 2000);
        } else {
          setState('pending');
          setMessage(
            res?.message ||
              'Payment received — Stripe is still activating your subscription. Premium will unlock within a minute. Please refresh.',
          );
        }
      } catch (err: any) {
        if (cancelled) return;
        if (attempts < 4) {
          setTimeout(confirm, 2500);
        } else {
          setState('error');
          setMessage(err?.message || 'Could not confirm payment. Please contact support if you were charged.');
        }
      }
    };

    confirm();
    return () => {
      cancelled = true;
    };
  }, [params.session_id, sessionToken, refreshUser]);

  return (
    <View style={styles.page} data-testid="subscription-success-page">
      <View style={styles.card}>
        {state === 'loading' && (
          <>
            <ActivityIndicator size="large" color="#7B61FF" />
            <Text style={styles.heading} data-testid="subscription-success-loading">Confirming your payment…</Text>
            <Text style={styles.body}>Hold tight — Stripe is activating your subscription.</Text>
          </>
        )}
        {state === 'success' && (
          <>
            <Text style={styles.emoji}>🎉</Text>
            <Text style={styles.heading} data-testid="subscription-success-heading">You're Premium</Text>
            <Text style={styles.body} data-testid="subscription-success-message">{message}</Text>
            <Pressable
              style={styles.cta}
              onPress={() => router.replace('/(main)/mood')}
              data-testid="subscription-success-continue"
            >
              <Text style={styles.ctaText}>Continue to DEQUAD</Text>
            </Pressable>
          </>
        )}
        {state === 'pending' && (
          <>
            <Text style={styles.emoji}>⏳</Text>
            <Text style={styles.heading} data-testid="subscription-pending-heading">Payment received</Text>
            <Text style={styles.body} data-testid="subscription-pending-message">{message}</Text>
            <Pressable
              style={styles.cta}
              onPress={() => router.replace('/(main)/subscription')}
              data-testid="subscription-pending-refresh"
            >
              <Text style={styles.ctaText}>Refresh subscription</Text>
            </Pressable>
          </>
        )}
        {state === 'error' && (
          <>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.heading} data-testid="subscription-error-heading">Could not confirm payment</Text>
            <Text style={styles.body} data-testid="subscription-error-message">{message}</Text>
            <Pressable
              style={styles.cta}
              onPress={() => router.replace('/(main)/subscription')}
              data-testid="subscription-error-back"
            >
              <Text style={styles.ctaText}>Back to subscription</Text>
            </Pressable>
          </>
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
    alignItems: 'center',
    gap: 16,
  },
  emoji: { fontSize: 56 },
  heading: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    color: '#C5BFD9',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  cta: {
    marginTop: 16,
    backgroundColor: '#7B61FF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 999,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
