import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/services/api';

interface SubscriptionStatus {
  plan: string;
  is_premium: boolean;
  stripe_customer_id: string | null;
  swipes_today: number;
  remaining_swipes: number | null;
  daily_limit: number | null;
  price: string;
}

export default function SubscriptionScreen() {
  const { sessionToken, refreshUser } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const data = await api.get('/subscription/status', sessionToken);
      setStatus(data);
    } catch (error) {
      console.error('Error loading subscription status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      const data = await api.post('/subscription/create-checkout', {}, sessionToken);
      
      if (data.checkout_url) {
        // Open Stripe checkout in browser
        const canOpen = await Linking.canOpenURL(data.checkout_url);
        if (canOpen) {
          await Linking.openURL(data.checkout_url);
        } else {
          Alert.alert('Error', 'Unable to open checkout page');
        }
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      Alert.alert('Error', 'Failed to start checkout process');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your premium subscription? You will lose access to unlimited swipes.',
      [
        { text: 'Keep Premium', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await api.post('/subscription/cancel', {}, sessionToken);
              Alert.alert('Subscription Cancelled', 'Your subscription has been cancelled.');
              await loadSubscriptionStatus();
              await refreshUser();
            } catch (error) {
              console.error('Error cancelling subscription:', error);
              Alert.alert('Error', 'Failed to cancel subscription');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Current Plan Badge */}
          <View style={[
            styles.planBadge,
            status?.is_premium ? styles.premiumBadge : styles.freeBadge
          ]}>
            <Ionicons 
              name={status?.is_premium ? "diamond" : "person"} 
              size={20} 
              color={status?.is_premium ? "#F59E0B" : "#9CA3AF"} 
            />
            <Text style={[
              styles.planBadgeText,
              status?.is_premium ? styles.premiumBadgeText : styles.freeBadgeText
            ]}>
              {status?.is_premium ? 'Premium Member' : 'Free Plan'}
            </Text>
          </View>

          {/* Swipe Counter (for free users) */}
          {!status?.is_premium && (
            <View style={styles.swipeCounter}>
              <Text style={styles.swipeCounterTitle}>Daily Swipes</Text>
              <View style={styles.swipeProgressContainer}>
                <View style={styles.swipeProgressBar}>
                  <View 
                    style={[
                      styles.swipeProgressFill,
                      { width: `${((status?.remaining_swipes || 0) / (status?.daily_limit || 5)) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.swipeProgressText}>
                  {status?.remaining_swipes}/{status?.daily_limit} remaining
                </Text>
              </View>
            </View>
          )}

          {/* Premium Card */}
          <View style={styles.premiumCard}>
            <View style={styles.premiumHeader}>
              <Ionicons name="diamond" size={40} color="#F59E0B" />
              <Text style={styles.premiumTitle}>DEQUAD Premium</Text>
              <Text style={styles.premiumPrice}>{status?.price || '£4.99/month'}</Text>
            </View>

            <View style={styles.featuresSection}>
              <Text style={styles.featuresTitle}>Premium Features</Text>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="infinite" size={24} color="#10B981" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Unlimited Swipes</Text>
                  <Text style={styles.featureDesc}>
                    No daily limits - match with as many study partners as you want
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="star" size={24} color="#F59E0B" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Priority Matching</Text>
                  <Text style={styles.featureDesc}>
                    Your profile gets shown to more potential study partners
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="eye" size={24} color="#6366F1" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>See Who Liked You</Text>
                  <Text style={styles.featureDesc}>
                    Know who's interested before you swipe
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="sparkles" size={24} color="#EC4899" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Advanced Filters</Text>
                  <Text style={styles.featureDesc}>
                    Filter by course, campus, interests, and more
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Button */}
            {status?.is_premium ? (
              <View style={styles.premiumActions}>
                <View style={styles.activeSubscription}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  <Text style={styles.activeText}>Subscription Active</Text>
                </View>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={handleCancelSubscription}
                  disabled={isProcessing}
                >
                  <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.subscribeButton}
                onPress={handleSubscribe}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="diamond" size={24} color="#fff" />
                    <Text style={styles.subscribeButtonText}>Upgrade to Premium</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Free Plan Comparison */}
          {!status?.is_premium && (
            <View style={styles.freeCard}>
              <Text style={styles.freeTitle}>Free Plan</Text>
              <View style={styles.freeFeature}>
                <Ionicons name="checkmark" size={18} color="#9CA3AF" />
                <Text style={styles.freeFeatureText}>5 swipes per day</Text>
              </View>
              <View style={styles.freeFeature}>
                <Ionicons name="checkmark" size={18} color="#9CA3AF" />
                <Text style={styles.freeFeatureText}>Basic matching</Text>
              </View>
              <View style={styles.freeFeature}>
                <Ionicons name="checkmark" size={18} color="#9CA3AF" />
                <Text style={styles.freeFeatureText}>Chat with matches</Text>
              </View>
              <View style={styles.freeFeature}>
                <Ionicons name="close" size={18} color="#EF4444" />
                <Text style={styles.freeFeatureTextDisabled}>Unlimited swipes</Text>
              </View>
              <View style={styles.freeFeature}>
                <Ionicons name="close" size={18} color="#EF4444" />
                <Text style={styles.freeFeatureTextDisabled}>See who liked you</Text>
              </View>
            </View>
          )}

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Subscription Info</Text>
            <Text style={styles.infoText}>
              • Your subscription will renew monthly
            </Text>
            <Text style={styles.infoText}>
              • Cancel anytime from this screen
            </Text>
            <Text style={styles.infoText}>
              • Secure payment via Stripe
            </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  freeBadge: {
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
  },
  premiumBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  planBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  freeBadgeText: {
    color: '#9CA3AF',
  },
  premiumBadgeText: {
    color: '#F59E0B',
  },
  swipeCounter: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  swipeCounterTitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  swipeProgressContainer: {
    gap: 8,
  },
  swipeProgressBar: {
    height: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  swipeProgressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  swipeProgressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  premiumCard: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: '#F59E0B',
    marginBottom: 20,
  },
  premiumHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 4,
  },
  premiumPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  premiumActions: {
    alignItems: 'center',
  },
  activeSubscription: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 8,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#EF4444',
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  freeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  freeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 16,
  },
  freeFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  freeFeatureText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 10,
  },
  freeFeatureTextDisabled: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 10,
    textDecorationLine: 'line-through',
  },
  infoSection: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#818CF8',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 4,
    lineHeight: 20,
  },
});
