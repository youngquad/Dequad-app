/**
 * Universities tab — pick a university, view its student roster, run AI analysis.
 * Extracted from app/(admin)/dashboard.tsx.
 * Self-manages universities list, selected university, students list, and analysis.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { adminStyles as styles } from '../utils/adminStyles';
import { getRiskColor } from '../utils/adminHelpers';
import { AdminGrowthAnalytics } from './AdminGrowthAnalytics';
import AdminExportTab from './AdminExportTab';

type Props = { sessionToken: string | null; backendUrl?: string };

type UniversityAnalysis = {
  university: string;
  analysis_timestamp: string;
  stats: {
    total_students: number;
    average_mood: number;
    total_mood_entries: number;
    total_feedback_entries: number;
  };
  ai_analysis: {
    overall_wellbeing_score: number;
    wellbeing_trend: 'improving' | 'stable' | 'declining';
    key_concerns: string[];
    positive_aspects: string[];
    recommendations: string[];
    priority_interventions: string[];
    summary: string;
  };
};

export default function AdminUniversitiesTab({ sessionToken, backendUrl = '' }: Props) {
  const [universities, setUniversities] = useState<{ name: string; student_count: number }[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [universityStudents, setUniversityStudents] = useState<any[]>([]);
  const [universityAnalysis, setUniversityAnalysis] = useState<UniversityAnalysis | null>(null);
  const [isLoadingUniversity, setIsLoadingUniversity] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const loadUniversitiesList = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const data = await api.get('/admin/universities', sessionToken);
      setUniversities(data.universities || []);
    } catch (err) {
      console.error('Error loading universities list:', err);
    }
  }, [sessionToken]);

  useEffect(() => {
    loadUniversitiesList();
  }, [loadUniversitiesList]);

  const loadUniversityStudents = async (universityName: string) => {
    setIsLoadingUniversity(true);
    try {
      const data = await api.get(
        `/admin/university/${encodeURIComponent(universityName)}/students`,
        sessionToken,
      );
      setUniversityStudents(data.students || []);
    } catch (err) {
      console.error('Error loading university students:', err);
    } finally {
      setIsLoadingUniversity(false);
    }
  };

  const runUniversityAnalysis = async (universityName: string) => {
    setIsAnalyzing(true);
    setSelectedUniversity(universityName);
    setUniversityStudents([]);
    setUniversityAnalysis(null);
    setShowAnalytics(true);
    try {
      const [analysisData] = await Promise.all([
        api.post(
          `/admin/university/${encodeURIComponent(universityName)}/ai-analysis`,
          {},
        ),
        loadUniversityStudents(universityName),
      ]);
      setUniversityAnalysis(analysisData as UniversityAnalysis);
    } catch (err) {
      console.error('Error running university analysis:', err);
      Alert.alert('Error', 'Failed to run university analysis');
      setShowAnalytics(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBack = () => {
    setShowAnalytics(false);
    setUniversityAnalysis(null);
    setSelectedUniversity(null);
    setUniversityStudents([]);
  };

  if (showAnalytics) {
    return (
      <AnalyticsPanel
        analysis={universityAnalysis}
        students={universityStudents}
        isAnalyzing={isAnalyzing}
        isLoadingStudents={isLoadingUniversity}
        onBack={handleBack}
        onRefresh={() => selectedUniversity && runUniversityAnalysis(selectedUniversity)}
        sessionToken={sessionToken}
        backendUrl={backendUrl}
      />
    );
  }

  return (
    <View style={styles.content} testID="admin-universities-tab">
      <Text style={styles.sectionTitle}>Universities</Text>
      <Text style={styles.sectionSubtitle}>
        Select a university to view students and run analysis
      </Text>

      {universities.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="school-outline" size={48} color="#4B5563" />
          <Text style={styles.emptyStateText}>No universities found</Text>
        </View>
      ) : (
        universities.map((uni, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.universitySelectCard,
              selectedUniversity === uni.name && styles.universitySelectCardActive,
            ]}
            onPress={() => runUniversityAnalysis(uni.name)}
          >
            <View style={styles.universitySelectInfo}>
              <View style={styles.universitySelectIcon}>
                <Ionicons name="school" size={24} color="#6366F1" />
              </View>
              <View style={styles.universitySelectText}>
                <Text style={styles.universitySelectName}>{uni.name}</Text>
                <Text style={styles.universitySelectCount}>{uni.student_count} students</Text>
              </View>
            </View>
            <View style={styles.universitySelectActions}>
              <View style={localStyles.analyseChip}>
                <Ionicons name="analytics" size={14} color="#F59E0B" />
                <Text style={localStyles.analyseChipText}>Analyse</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

function AnalyticsPanel({
  analysis,
  students,
  isAnalyzing,
  isLoadingStudents,
  onBack,
  onRefresh,
  sessionToken,
  backendUrl,
}: {
  analysis: UniversityAnalysis | null;
  students: any[];
  isAnalyzing: boolean;
  isLoadingStudents: boolean;
  onBack: () => void;
  onRefresh: () => void;
  sessionToken: string | null;
  backendUrl: string;
}) {
  const ai = analysis?.ai_analysis;
  const stats = analysis?.stats;

  const scoreColor =
    !ai ? '#6B7280'
    : ai.overall_wellbeing_score >= 70 ? '#10B981'
    : ai.overall_wellbeing_score >= 45 ? '#F59E0B'
    : '#EF4444';

  const trendIcon =
    ai?.wellbeing_trend === 'improving' ? 'trending-up'
    : ai?.wellbeing_trend === 'declining' ? 'trending-down'
    : 'remove';

  const trendColor =
    ai?.wellbeing_trend === 'improving' ? '#10B981'
    : ai?.wellbeing_trend === 'declining' ? '#EF4444'
    : '#F59E0B';

  return (
    <View style={localStyles.panelWrap} testID="university-analytics-panel">
      {/* Header */}
      <View style={localStyles.panelHeader}>
        <TouchableOpacity style={localStyles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color="#6366F1" />
          <Text style={localStyles.backBtnText}>Universities</Text>
        </TouchableOpacity>
        {!isAnalyzing && (
          <TouchableOpacity style={localStyles.refreshBtn} onPress={onRefresh}>
            <Ionicons name="refresh" size={16} color="#6366F1" />
            <Text style={localStyles.refreshBtnText}>Re-analyse</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={localStyles.uniName}>{analysis?.university ?? '…'}</Text>
      {analysis?.analysis_timestamp ? (
        <Text style={localStyles.timestamp}>
          Analysed {new Date(analysis.analysis_timestamp).toLocaleString()}
        </Text>
      ) : null}

      {isAnalyzing ? (
        <View style={localStyles.loadingWrap}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={localStyles.loadingText}>Running AI analysis…</Text>
        </View>
      ) : !analysis ? null : (
        <>
          {/* Stats row */}
          <View style={localStyles.statsRow}>
            <StatCard label="Students" value={String(stats?.total_students ?? '—')} icon="people" tint="#6366F1" />
            <StatCard label="Avg Mood" value={stats ? `${stats.average_mood}/10` : '—'} icon="happy" tint="#10B981" />
            <StatCard label="Mood logs" value={String(stats?.total_mood_entries ?? '—')} icon="pulse" tint="#F59E0B" />
            <StatCard label="Feedback" value={String(stats?.total_feedback_entries ?? '—')} icon="chatbubbles" tint="#0EA5E9" />
          </View>

          {/* Wellbeing Score */}
          <View style={[localStyles.scoreCard, { borderColor: `${scoreColor}40` }]}>
            <Text style={localStyles.scoreSectionTitle}>AI Wellbeing Score</Text>
            <View style={localStyles.scoreRow}>
              <Text style={[localStyles.scoreBig, { color: scoreColor }]}>
                {ai?.overall_wellbeing_score ?? '—'}
              </Text>
              <Text style={localStyles.scoreOutOf}>/100</Text>
              <View style={[localStyles.trendBadge, { backgroundColor: `${trendColor}18` }]}>
                <Ionicons name={trendIcon as any} size={14} color={trendColor} />
                <Text style={[localStyles.trendText, { color: trendColor }]}>
                  {ai?.wellbeing_trend ?? 'unknown'}
                </Text>
              </View>
            </View>
            {ai?.summary ? (
              <Text style={localStyles.summaryText}>{ai.summary}</Text>
            ) : null}
          </View>

          {/* Key Concerns */}
          {ai?.key_concerns?.length ? (
            <View style={[localStyles.listCard, { borderLeftColor: '#EF4444' }]}>
              <Text style={[localStyles.listCardTitle, { color: '#EF4444' }]}>
                <Ionicons name="warning" size={14} color="#EF4444" /> Key Concerns
              </Text>
              {ai.key_concerns.map((item, i) => (
                <Text key={i} style={localStyles.listItem}>• {item}</Text>
              ))}
            </View>
          ) : null}

          {/* Positive Aspects */}
          {ai?.positive_aspects?.length ? (
            <View style={[localStyles.listCard, { borderLeftColor: '#10B981' }]}>
              <Text style={[localStyles.listCardTitle, { color: '#10B981' }]}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" /> Positive Aspects
              </Text>
              {ai.positive_aspects.map((item, i) => (
                <Text key={i} style={localStyles.listItem}>• {item}</Text>
              ))}
            </View>
          ) : null}

          {/* Recommendations */}
          {ai?.recommendations?.length ? (
            <View style={[localStyles.listCard, { borderLeftColor: '#6366F1' }]}>
              <Text style={[localStyles.listCardTitle, { color: '#6366F1' }]}>
                <Ionicons name="bulb" size={14} color="#6366F1" /> Recommendations
              </Text>
              {ai.recommendations.map((item, i) => (
                <Text key={i} style={localStyles.listItem}>• {item}</Text>
              ))}
            </View>
          ) : null}

          {/* Priority Interventions */}
          {ai?.priority_interventions?.length ? (
            <View style={[localStyles.listCard, { borderLeftColor: '#F59E0B' }]}>
              <Text style={[localStyles.listCardTitle, { color: '#F59E0B' }]}>
                <Ionicons name="alert-circle" size={14} color="#F59E0B" /> Priority Interventions
              </Text>
              {ai.priority_interventions.map((item, i) => (
                <Text key={i} style={localStyles.listItem}>• {item}</Text>
              ))}
            </View>
          ) : null}
        </>
      )}

      {/* Student Roster */}
      <View style={localStyles.rosterHeader}>
        <Text style={localStyles.rosterTitle}>
          Student Roster {students.length ? `(${students.length})` : ''}
        </Text>
        <Text style={localStyles.rosterSub}>Sorted by risk</Text>
      </View>

      {isLoadingStudents ? (
        <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 16 }} />
      ) : students.length === 0 && !isAnalyzing ? (
        <Text style={localStyles.emptyRoster}>No students found</Text>
      ) : (
        students.map((student, idx) => (
          <View
            key={student.user_id || idx}
            style={[styles.studentCard, { borderLeftColor: getRiskColor(student.risk_level) }]}
          >
            <View style={styles.studentHeader}>
              <Text style={styles.studentName}>{student.name}</Text>
              <View
                style={[
                  styles.riskBadge,
                  { backgroundColor: getRiskColor(student.risk_level) + '20' },
                ]}
              >
                <Text style={[styles.riskBadgeText, { color: getRiskColor(student.risk_level) }]}>
                  {student.risk_score}%
                </Text>
              </View>
            </View>
            <Text style={styles.studentEmail}>{student.email}</Text>
            <View style={styles.studentStats}>
              <Text style={styles.studentStatItem}>Course: {student.course || 'N/A'}</Text>
              <Text style={styles.studentStatItem}>
                Mood: {student.average_mood?.toFixed(1) || 'N/A'}
              </Text>
              <Text style={styles.studentStatItem}>Alerts: {student.safeguarding_alerts}</Text>
            </View>
          </View>
        ))
      )}

      {/* Platform-wide growth analytics */}
      <View style={localStyles.growthAnalyticsDivider}>
        <View style={localStyles.dividerLine} />
        <Text style={localStyles.dividerLabel}>Platform Analytics</Text>
        <View style={localStyles.dividerLine} />
      </View>
      <AdminGrowthAnalytics sessionToken={sessionToken} />

      {/* Export */}
      <View style={localStyles.growthAnalyticsDivider}>
        <View style={localStyles.dividerLine} />
        <Text style={localStyles.dividerLabel}>Export Data</Text>
        <View style={localStyles.dividerLine} />
      </View>
      <AdminExportTab backendUrl={backendUrl} sessionToken={sessionToken} />
    </View>
  );
}

function StatCard({
  label, value, icon, tint,
}: {
  label: string; value: string; icon: any; tint: string;
}) {
  return (
    <View style={[localStyles.statCard, { borderColor: `${tint}30` }]}>
      <View style={[localStyles.statIconWrap, { backgroundColor: `${tint}18` }]}>
        <Ionicons name={icon} size={16} color={tint} />
      </View>
      <Text style={localStyles.statValue}>{value}</Text>
      <Text style={localStyles.statLabel}>{label}</Text>
    </View>
  );
}

const localStyles = StyleSheet.create({
  analyseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },
  analyseChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },

  panelWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  backBtnText: {
    color: '#6366F1',
    fontWeight: '600',
    fontSize: 13,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  refreshBtnText: {
    color: '#6366F1',
    fontWeight: '600',
    fontSize: 12,
  },
  uniName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 20,
  },

  loadingWrap: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
  },

  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 72,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    alignItems: 'center',
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },

  scoreCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    marginBottom: 12,
  },
  scoreSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 10,
  },
  scoreBig: {
    fontSize: 48,
    fontWeight: '700',
  },
  scoreOutOf: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  trendText: {
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  summaryText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },

  listCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    marginBottom: 10,
  },
  listCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  listItem: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 2,
  },

  rosterHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  rosterTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  rosterSub: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  emptyRoster: {
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 14,
  },
  growthAnalyticsDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 28,
    marginBottom: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#374151',
  },
  dividerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
