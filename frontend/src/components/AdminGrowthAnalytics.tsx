/**
 * Growth Analytics — deck-worthy metrics for investor / UKES screenshots.
 *
 * Data source: GET /api/admin/growth-analytics
 *
 * KPIs shown:
 *   • Total real students (excludes seeded demos / founder personal)
 *   • Active in last 24h + 7-day rolling DAU + 28-day DAU
 *   • Stickiness (DAU/MAU proxy — >20 % is world-class)
 *   • Signups this week vs last week (+ % growth)
 *   • Mood-check completion (7-day + 30-day)
 *   • Retention D1 / D7 / D30
 *   • Engagement: matches accepted, chat messages
 *   • Sparkline: 30-day DAU + signups
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';

type Retention = { cohort_size: number; returned: number; rate_pct: number };
type Series = { date: string; active_users?: number; new_signups?: number };

type GrowthResponse = {
  generated_at: string;
  total_real_students: number;
  active_now_24h: number;
  dau_series: Series[];
  avg_dau_7d: number;
  avg_dau_28d: number;
  stickiness_pct: number;
  signup_series: Series[];
  signups_this_week: number;
  signups_last_week: number;
  signup_growth_pct: number | null;
  mood_completion: {
    last_7d_users: number;
    last_7d_percentage: number;
    last_30d_users: number;
    last_30d_percentage: number;
  };
  retention: { d1: Retention; d7: Retention; d30: Retention };
  engagement: {
    total_matches_accepted: number;
    matches_last_7d: number;
    chat_messages_last_7d: number;
  };
};

type Props = { sessionToken: string | null };

const fmtNum = (n: number | null | undefined) =>
  n == null ? '—' : n.toLocaleString();

const fmtPct = (n: number | null | undefined) =>
  n == null ? '—' : `${n.toFixed(1)}%`;

export function AdminGrowthAnalytics({ sessionToken }: Props) {
  const [data, setData] = useState<GrowthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    if (!sessionToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/growth-analytics', sessionToken);
      setData(res as GrowthResponse);
      setRefreshedAt(new Date());
    } catch (e: any) {
      setError(e?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [sessionToken]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !data) {
    return (
      <View style={styles.loadingWrap} testID="growth-analytics-loading">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Crunching analytics…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorCard} testID="growth-analytics-error">
        <Ionicons name="alert-circle-outline" size={24} color="#DC2626" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={load} testID="growth-analytics-retry">
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data) return null;

  const growth = data.signup_growth_pct;
  const growthColor =
    growth == null ? '#6B7280' : growth >= 0 ? '#059669' : '#DC2626';
  const growthIcon =
    growth == null ? 'remove' : growth >= 0 ? 'trending-up' : 'trending-down';

  const dauMax = Math.max(1, ...data.dau_series.map((d) => d.active_users || 0));
  const signupMax = Math.max(1, ...data.signup_series.map((d) => d.new_signups || 0));

  return (
    <View style={styles.wrap} testID="growth-analytics">
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Growth Analytics</Text>
          <Text style={styles.subtitle}>
            Real users only · Demo profiles excluded
            {refreshedAt ? ` · Updated ${refreshedAt.toLocaleTimeString()}` : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={load} style={styles.refreshBtn} testID="growth-analytics-refresh">
          <Ionicons name="refresh" size={16} color="#6366F1" />
          <Text style={styles.refreshBtnText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Hero KPIs */}
      <View style={styles.kpiRow}>
        <KpiCard
          testID="kpi-total-students"
          label="Real students"
          value={fmtNum(data.total_real_students)}
          icon="people"
          tint="#6366F1"
        />
        <KpiCard
          testID="kpi-active-24h"
          label="Active last 24h"
          value={fmtNum(data.active_now_24h)}
          icon="flash"
          tint="#F59E0B"
        />
        <KpiCard
          testID="kpi-dau-7d"
          label="Avg DAU (7d)"
          value={fmtNum(data.avg_dau_7d)}
          icon="pulse"
          tint="#10B981"
        />
        <KpiCard
          testID="kpi-stickiness"
          label="Stickiness"
          value={fmtPct(data.stickiness_pct)}
          hint=">20% is world-class"
          icon="magnet"
          tint="#EC4899"
        />
      </View>

      {/* Growth this week */}
      <View style={styles.section} testID="section-signups">
        <Text style={styles.sectionTitle}>Signups this week</Text>
        <View style={styles.growthRow}>
          <Text style={styles.growthValue}>{fmtNum(data.signups_this_week)}</Text>
          <View style={[styles.growthDelta, { backgroundColor: `${growthColor}18` }]}>
            <Ionicons name={growthIcon as any} size={14} color={growthColor} />
            <Text style={[styles.growthDeltaText, { color: growthColor }]}>
              {growth == null ? 'no prior week' : `${growth >= 0 ? '+' : ''}${growth}% WoW`}
            </Text>
          </View>
        </View>
        <Text style={styles.growthSub}>
          Last week: {fmtNum(data.signups_last_week)} signups
        </Text>
      </View>

      {/* Sparkline — 30-day signups */}
      <View style={styles.section} testID="section-signup-sparkline">
        <Text style={styles.sectionTitle}>Signups — last 30 days</Text>
        <View style={styles.sparkline}>
          {data.signup_series.map((d, i) => (
            <View key={i} style={styles.sparkBarWrap}>
              <View
                style={[
                  styles.sparkBar,
                  {
                    height: `${((d.new_signups || 0) / signupMax) * 100}%`,
                    backgroundColor: '#6366F1',
                  },
                ]}
              />
            </View>
          ))}
        </View>
        <Text style={styles.sparkAxis}>
          {data.signup_series[0]?.date} → {data.signup_series[data.signup_series.length - 1]?.date}
        </Text>
      </View>

      {/* Sparkline — 30-day DAU */}
      <View style={styles.section} testID="section-dau-sparkline">
        <Text style={styles.sectionTitle}>Daily Active Users — last 30 days</Text>
        <View style={styles.sparkline}>
          {data.dau_series.map((d, i) => (
            <View key={i} style={styles.sparkBarWrap}>
              <View
                style={[
                  styles.sparkBar,
                  {
                    height: `${((d.active_users || 0) / dauMax) * 100}%`,
                    backgroundColor: '#10B981',
                  },
                ]}
              />
            </View>
          ))}
        </View>
        <Text style={styles.sparkAxis}>
          28-day avg: {fmtNum(data.avg_dau_28d)} · peak: {fmtNum(dauMax)}
        </Text>
      </View>

      {/* Retention */}
      <View style={styles.section} testID="section-retention">
        <Text style={styles.sectionTitle}>Retention (cohort-based)</Text>
        <View style={styles.retentionRow}>
          <RetentionCell testID="retention-d1" label="D1" data={data.retention.d1} />
          <RetentionCell testID="retention-d7" label="D7" data={data.retention.d7} />
          <RetentionCell testID="retention-d30" label="D30" data={data.retention.d30} />
        </View>
        <Text style={styles.hint}>
          % of new signups that opened DEQUAD N days after joining.
        </Text>
      </View>

      {/* Mood completion */}
      <View style={styles.section} testID="section-mood-completion">
        <Text style={styles.sectionTitle}>Mood-check completion</Text>
        <View style={styles.moodRow}>
          <View style={styles.moodCard}>
            <Text style={styles.moodPct}>{fmtPct(data.mood_completion.last_7d_percentage)}</Text>
            <Text style={styles.moodLabel}>Last 7 days</Text>
            <Text style={styles.moodSub}>
              {fmtNum(data.mood_completion.last_7d_users)} / {fmtNum(data.total_real_students)} students
            </Text>
          </View>
          <View style={styles.moodCard}>
            <Text style={styles.moodPct}>{fmtPct(data.mood_completion.last_30d_percentage)}</Text>
            <Text style={styles.moodLabel}>Last 30 days</Text>
            <Text style={styles.moodSub}>
              {fmtNum(data.mood_completion.last_30d_users)} / {fmtNum(data.total_real_students)} students
            </Text>
          </View>
        </View>
      </View>

      {/* Engagement */}
      <View style={styles.section} testID="section-engagement">
        <Text style={styles.sectionTitle}>Engagement</Text>
        <View style={styles.kpiRow}>
          <KpiCard
            testID="kpi-total-matches"
            label="Matches accepted"
            value={fmtNum(data.engagement.total_matches_accepted)}
            icon="heart"
            tint="#EF4444"
          />
          <KpiCard
            testID="kpi-matches-7d"
            label="Matches (7d)"
            value={fmtNum(data.engagement.matches_last_7d)}
            icon="add-circle"
            tint="#F59E0B"
          />
          <KpiCard
            testID="kpi-chats-7d"
            label="Chats (7d)"
            value={fmtNum(data.engagement.chat_messages_last_7d)}
            icon="chatbubbles"
            tint="#0EA5E9"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Ionicons name="information-circle-outline" size={14} color="#6B7280" />
        <Text style={styles.footerText}>
          Snapshot generated {new Date(data.generated_at).toLocaleString()}. Screenshot-friendly — hide
          browser chrome (Cmd+Shift+F) for clean investor decks.
        </Text>
      </View>
    </View>
  );
}

function KpiCard({
  label, value, icon, tint, hint, testID,
}: {
  label: string; value: string; icon: any; tint: string; hint?: string; testID?: string;
}) {
  return (
    <View style={[styles.kpiCard, { borderColor: `${tint}30` }]} testID={testID}>
      <View style={[styles.kpiIconWrap, { backgroundColor: `${tint}18` }]}>
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
      {hint ? <Text style={styles.kpiHint}>{hint}</Text> : null}
    </View>
  );
}

function RetentionCell({
  label, data, testID,
}: {
  label: string; data: Retention; testID?: string;
}) {
  const color =
    data.rate_pct >= 40 ? '#059669' : data.rate_pct >= 20 ? '#F59E0B' : '#DC2626';
  return (
    <View style={styles.retentionCell} testID={testID}>
      <Text style={styles.retentionLabel}>{label}</Text>
      <Text style={[styles.retentionPct, { color }]}>{fmtPct(data.rate_pct)}</Text>
      <Text style={styles.retentionCohort}>
        {data.returned}/{data.cohort_size} cohort
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },
  loadingWrap: { paddingVertical: 60, alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6B7280' },
  errorCard: {
    marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 12,
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    alignItems: 'center', gap: 8,
  },
  errorText: { color: '#991B1B', textAlign: 'center' },
  retryBtn: {
    marginTop: 8, paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: '#DC2626', borderRadius: 8,
  },
  retryBtnText: { color: '#fff', fontWeight: '600' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  refreshBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  refreshBtnText: { color: '#6366F1', fontWeight: '600', fontSize: 12 },

  kpiRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8,
  },
  kpiCard: {
    flex: 1, minWidth: 140, padding: 14, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1,
  },
  kpiIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  kpiValue: { fontSize: 22, fontWeight: '700', color: '#111827' },
  kpiLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  kpiHint: { fontSize: 10, color: '#9CA3AF', marginTop: 4, fontStyle: 'italic' },

  section: {
    marginTop: 20, padding: 16, backgroundColor: '#fff',
    borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 12,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  growthRow: { flexDirection: 'row', alignItems: 'baseline', gap: 12 },
  growthValue: { fontSize: 32, fontWeight: '700', color: '#111827' },
  growthDelta: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  growthDeltaText: { fontWeight: '600', fontSize: 12 },
  growthSub: { color: '#6B7280', fontSize: 12, marginTop: 4 },

  sparkline: {
    flexDirection: 'row', height: 80, gap: 2, alignItems: 'flex-end',
    marginBottom: 8,
  },
  sparkBarWrap: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  sparkBar: { width: '100%', borderRadius: 2, minHeight: 2 },
  sparkAxis: { fontSize: 10, color: '#9CA3AF' },

  retentionRow: { flexDirection: 'row', gap: 12 },
  retentionCell: {
    flex: 1, padding: 12, borderRadius: 10,
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  retentionLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  retentionPct: { fontSize: 22, fontWeight: '700', marginTop: 4 },
  retentionCohort: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },

  hint: { fontSize: 11, color: '#6B7280', marginTop: 10 },

  moodRow: { flexDirection: 'row', gap: 12 },
  moodCard: {
    flex: 1, padding: 14, borderRadius: 10,
    backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE',
    alignItems: 'center',
  },
  moodPct: { fontSize: 26, fontWeight: '700', color: '#4338CA' },
  moodLabel: { color: '#4338CA', fontWeight: '600', marginTop: 2 },
  moodSub: { fontSize: 11, color: '#6366F1', marginTop: 2 },

  footer: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 24,
    padding: 10, borderRadius: 8, backgroundColor: '#F9FAFB',
  },
  footerText: { flex: 1, fontSize: 11, color: '#6B7280' },
});
