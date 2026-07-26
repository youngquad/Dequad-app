/**
 * Subscriptions tab — revenue / churn / conversion metrics.
 * Extracted from app/(admin)/dashboard.tsx.
 * Fetches its own subscription analytics from /api/admin/analytics/subscriptions.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { adminStyles as styles } from '../utils/adminStyles';

type Props = {
  sessionToken: string | null;
  onExport: () => void;
};

export default function AdminSubscriptionsTab({ sessionToken, onExport }: Props) {
  const [subscriptionAnalytics, setSubscriptionAnalytics] = useState<any>(null);

  const load = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const data = await api.get('/admin/analytics/subscriptions', sessionToken);
      setSubscriptionAnalytics(data);
    } catch (err) {
      console.error('Error loading subscription analytics:', err);
    }
  }, [sessionToken]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.content} testID="admin-subscriptions-tab">
      <Text style={styles.sectionTitle}>Subscription Analytics</Text>
      <Text style={styles.sectionSubtitle}>Revenue and subscription metrics</Text>

      {subscriptionAnalytics ? (
        <>
          {/* Revenue Stats */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#10B981' }]}>
              <Ionicons name="cash-outline" size={28} color="#fff" />
              <Text style={styles.statValue}>£{subscriptionAnalytics.monthly_revenue}</Text>
              <Text style={styles.statLabel}>Monthly Revenue</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#6366F1' }]}>
              <Ionicons name="diamond-outline" size={28} color="#fff" />
              <Text style={styles.statValue}>{subscriptionAnalytics.premium_users}</Text>
              <Text style={styles.statLabel}>Premium Users</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#F59E0B' }]}>
              <Ionicons name="trending-up-outline" size={28} color="#fff" />
              <Text style={styles.statValue}>{subscriptionAnalytics.conversion_rate}%</Text>
              <Text style={styles.statLabel}>Conversion Rate</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#EF4444' }]}>
              <Ionicons name="trending-down-outline" size={28} color="#fff" />
              <Text style={styles.statValue}>{subscriptionAnalytics.churn_rate}%</Text>
              <Text style={styles.statLabel}>Churn Rate</Text>
            </View>
          </View>

          <DetailCard title="Subscription Overview">
            <Row label="Total Users" value={subscriptionAnalytics.total_users} />
            <Row label="Free Users" value={subscriptionAnalytics.free_users} />
            <Row label="Premium Users" value={subscriptionAnalytics.premium_users} />
            <Row label="Active Subscriptions" value={subscriptionAnalytics.active_subscriptions} />
            <Row label="New Subs (30 days)" value={subscriptionAnalytics.new_subscriptions_30d} />
            <Row label="Cancelled" value={subscriptionAnalytics.cancelled_subscriptions} />
          </DetailCard>

          <DetailCard title="Revenue Projections">
            <Row
              label="Monthly Revenue"
              value={`£${subscriptionAnalytics.monthly_revenue}`}
              valueColor="#10B981"
            />
            <Row
              label="Annual Estimate"
              value={`£${subscriptionAnalytics.annual_revenue_estimate}`}
              valueColor="#10B981"
            />
            <Row label="Price per User" value="£4.99/month" />
          </DetailCard>

          {subscriptionAnalytics.daily_stats?.length > 0 && (
            <DetailCard title="New Subscriptions (Last 7 Days)">
              <View style={styles.miniChart}>
                {subscriptionAnalytics.daily_stats.map((day: any, index: number) => (
                  <View key={index} style={styles.miniChartBar}>
                    <View
                      style={[
                        styles.miniChartBarFill,
                        { height: Math.max(day.new_subscriptions * 20, 4), backgroundColor: '#6366F1' },
                      ]}
                    />
                    <Text style={styles.miniChartLabel}>{day.date.slice(5)}</Text>
                  </View>
                ))}
              </View>
            </DetailCard>
          )}

          <TouchableOpacity
            style={styles.exportButton}
            onPress={onExport}
            data-testid="subscriptions-export-btn"
          >
            <Ionicons name="download-outline" size={20} color="#fff" />
            <Text style={styles.exportButtonText}>Export Subscription Data</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.emptyStateText}>Loading subscription data...</Text>
        </View>
      )}
    </View>
  );
}

// Local sub-components — mirror the "detail card" pattern used inline previously.
function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={localStyles.detailCard}>
      <Text style={localStyles.detailCardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, value, valueColor }: { label: string; value: any; valueColor?: string }) {
  return (
    <View style={localStyles.detailRow}>
      <Text style={localStyles.detailLabel}>{label}</Text>
      <Text style={[localStyles.detailValue, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </Text>
    </View>
  );
}

// Local styles — these keys were referenced in dashboard.tsx but never defined
// in the shared StyleSheet (silent no-op previously). Providing them here so
// the extracted tab actually looks correct.
import { StyleSheet } from 'react-native';
const localStyles = StyleSheet.create({
  detailCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  detailLabel: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});
