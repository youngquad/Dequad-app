/**
 * AI Learning tab — keyword approvals, behavioural insights, alert feedback.
 * Extracted from app/(admin)/dashboard.tsx.
 * Self-manages: aiLearningStats, aiKeywords, aiInsights, keywordFilter.
 * Receives safeguardingAlerts via prop (shared with parent overview/safeguarding tabs).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { adminStyles as styles } from '../utils/adminStyles';
import { formatDate } from '../utils/adminHelpers';

type Props = {
  sessionToken: string | null;
  safeguardingAlerts: any[];
  onAlertFeedbackRecorded?: () => void;
};

export default function AdminAILearningTab({
  sessionToken,
  safeguardingAlerts,
  onAlertFeedbackRecorded,
}: Props) {
  const [aiLearningStats, setAiLearningStats] = useState<any>(null);
  const [aiKeywords, setAiKeywords] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [keywordFilter, setKeywordFilter] = useState<string>('pending');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const loadAILearningStats = useCallback(async () => {
    try {
      const data = await api.get('/admin/ai-learning/stats', sessionToken);
      setAiLearningStats(data);
    } catch (err) {
      console.error('Error loading AI learning stats:', err);
    }
  }, [sessionToken]);

  const loadAIKeywords = useCallback(
    async (status?: string) => {
      setIsLoadingAI(true);
      try {
        const endpoint = status
          ? `/admin/ai-learning/keywords?status=${status}`
          : '/admin/ai-learning/keywords';
        const data = await api.get(endpoint, sessionToken);
        setAiKeywords(data.keywords || []);
      } catch (err) {
        console.error('Error loading AI keywords:', err);
      } finally {
        setIsLoadingAI(false);
      }
    },
    [sessionToken],
  );

  const loadAIInsights = useCallback(async () => {
    try {
      const data = await api.get('/admin/ai-learning/insights', sessionToken);
      setAiInsights(data.insights || []);
    } catch (err) {
      console.error('Error loading AI insights:', err);
    }
  }, [sessionToken]);

  useEffect(() => {
    if (!sessionToken) return;
    loadAILearningStats();
    loadAIKeywords(keywordFilter);
    loadAIInsights();
  }, [sessionToken, keywordFilter, loadAILearningStats, loadAIKeywords, loadAIInsights]);

  const handleKeywordAction = async (
    keywordId: string,
    action: 'approve' | 'reject',
    riskCategory?: string,
  ) => {
    try {
      await api.post(
        `/admin/ai-learning/keywords/${keywordId}/action`,
        { action, risk_category: riskCategory },
        sessionToken,
      );
      Alert.alert('Success', `Keyword ${action}d successfully`);
      loadAIKeywords(keywordFilter);
      loadAILearningStats();
    } catch (err) {
      console.error('Error actioning keyword:', err);
      Alert.alert('Error', `Failed to ${action} keyword`);
    }
  };

  const handleAlertFeedback = async (alertId: string, wasTruePositive: boolean) => {
    try {
      await api.post(
        `/admin/safeguarding-alerts/${alertId}/feedback`,
        {
          was_true_positive: wasTruePositive,
          notes: wasTruePositive ? 'Confirmed as genuine concern' : 'Marked as false positive',
        },
        sessionToken,
      );
      Alert.alert(
        'Feedback Recorded',
        `Alert marked as ${wasTruePositive ? 'True Positive' : 'False Positive'}. This helps improve AI accuracy.`,
      );
      loadAILearningStats();
      onAlertFeedbackRecorded?.();
    } catch (err) {
      console.error('Error recording feedback:', err);
      Alert.alert('Error', 'Failed to record feedback');
    }
  };

  const triggerBehavioralAnalysis = async () => {
    setIsLoadingAI(true);
    try {
      await api.post('/admin/ai-learning/trigger-analysis', {}, sessionToken);
      Alert.alert(
        'Analysis Complete',
        'Behavioral anomaly detection completed. Check insights for any new patterns.',
      );
      loadAIInsights();
    } catch (err) {
      console.error('Error triggering analysis:', err);
      Alert.alert('Error', 'Failed to run behavioral analysis');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const reviewInsight = async (insightId: string) => {
    try {
      await api.post(`/admin/ai-learning/insights/${insightId}/review`, {}, sessionToken);
      loadAIInsights();
    } catch (err) {
      console.error('Error reviewing insight:', err);
    }
  };

  return (
    <View style={styles.content} testID="admin-ai-learning-tab">
      <Text style={styles.sectionTitle}>AI Learning Dashboard</Text>

      {aiLearningStats && (
        <View style={styles.aiStatsContainer}>
          <View style={styles.aiStatRow}>
            <View style={[styles.aiStatCard, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
              <Text style={styles.aiStatValue}>
                {aiLearningStats.keyword_coverage?.total_active || 0}
              </Text>
              <Text style={styles.aiStatLabel}>Active Keywords</Text>
              <Text style={styles.aiStatSub}>
                {aiLearningStats.keyword_coverage?.built_in || 0} built-in +{' '}
                {aiLearningStats.keyword_coverage?.learned_approved || 0} learned
              </Text>
            </View>
            <View style={[styles.aiStatCard, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Text style={styles.aiStatValue}>
                {aiLearningStats.alerts?.accuracy_rate
                  ? `${aiLearningStats.alerts.accuracy_rate}%`
                  : 'N/A'}
              </Text>
              <Text style={styles.aiStatLabel}>Alert Accuracy</Text>
              <Text style={styles.aiStatSub}>
                {aiLearningStats.alerts?.true_positives || 0} true /{' '}
                {aiLearningStats.alerts?.total_with_feedback || 0} reviewed
              </Text>
            </View>
          </View>
          <View style={styles.aiStatRow}>
            <View style={[styles.aiStatCard, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Text style={styles.aiStatValue}>{aiLearningStats.keywords?.pending || 0}</Text>
              <Text style={styles.aiStatLabel}>Pending Keywords</Text>
              <Text style={styles.aiStatSub}>Awaiting review</Text>
            </View>
            <View style={[styles.aiStatCard, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Text style={styles.aiStatValue}>{aiLearningStats.insights?.unreviewed || 0}</Text>
              <Text style={styles.aiStatLabel}>New Insights</Text>
              <Text style={styles.aiStatSub}>Unreviewed patterns</Text>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.analyzeButton}
        onPress={triggerBehavioralAnalysis}
        disabled={isLoadingAI}
      >
        {isLoadingAI ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="analytics" size={20} color="#fff" />
            <Text style={styles.analyzeButtonText}>Run Behavioral Analysis</Text>
          </>
        )}
      </TouchableOpacity>

      {/* AI Keywords Section */}
      <View style={styles.aiSection}>
        <View style={styles.aiSectionHeader}>
          <Text style={styles.sectionTitle}>AI-Suggested Keywords</Text>
          <View style={styles.keywordFilterRow}>
            {['pending', 'approved', 'rejected'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.keywordFilterBtn,
                  keywordFilter === filter && styles.keywordFilterBtnActive,
                ]}
                onPress={() => setKeywordFilter(filter)}
              >
                <Text
                  style={[
                    styles.keywordFilterText,
                    keywordFilter === filter && styles.keywordFilterTextActive,
                  ]}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {isLoadingAI ? (
          <ActivityIndicator color="#6366F1" style={{ marginVertical: 20 }} />
        ) : aiKeywords.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bulb-outline" size={48} color="#4B5563" />
            <Text style={styles.emptyStateText}>No {keywordFilter} keywords yet</Text>
            <Text style={styles.emptyStateSubtext}>
              AI will suggest new keywords as it learns from student interactions
            </Text>
          </View>
        ) : (
          aiKeywords.map((keyword: any) => (
            <View key={keyword.keyword_id} style={styles.keywordCard}>
              <View style={styles.keywordHeader}>
                <View
                  style={[
                    styles.riskBadge,
                    {
                      backgroundColor:
                        keyword.risk_category === 'high'
                          ? 'rgba(239, 68, 68, 0.2)'
                          : keyword.risk_category === 'medium'
                          ? 'rgba(245, 158, 11, 0.2)'
                          : 'rgba(16, 185, 129, 0.2)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.riskBadgeText,
                      {
                        color:
                          keyword.risk_category === 'high'
                            ? '#EF4444'
                            : keyword.risk_category === 'medium'
                            ? '#F59E0B'
                            : '#10B981',
                      },
                    ]}
                  >
                    {keyword.risk_category?.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.keywordFrequency}>Seen {keyword.frequency_score}x</Text>
              </View>
              <Text style={styles.keywordText}>&quot;{keyword.keyword}&quot;</Text>
              {keyword.context_examples?.length > 0 && (
                <Text style={styles.keywordContext} numberOfLines={2}>
                  Context: {keyword.context_examples[0]}
                </Text>
              )}
              <Text style={styles.keywordConfidence}>
                Confidence: {Math.round((keyword.confidence_score || 0) * 100)}%
              </Text>

              {keyword.status === 'pending' && (
                <View style={styles.keywordActions}>
                  <TouchableOpacity
                    style={[styles.keywordActionBtn, styles.approveBtn]}
                    onPress={() =>
                      handleKeywordAction(keyword.keyword_id, 'approve', keyword.risk_category)
                    }
                  >
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Text style={styles.keywordActionText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.keywordActionBtn, styles.rejectBtn]}
                    onPress={() => handleKeywordAction(keyword.keyword_id, 'reject')}
                  >
                    <Ionicons name="close" size={18} color="#fff" />
                    <Text style={styles.keywordActionText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      {/* AI Insights Section */}
      <View style={styles.aiSection}>
        <Text style={styles.sectionTitle}>Behavioral Insights</Text>

        {aiInsights.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="eye-outline" size={48} color="#4B5563" />
            <Text style={styles.emptyStateText}>No insights yet</Text>
            <Text style={styles.emptyStateSubtext}>Run behavioral analysis to detect patterns</Text>
          </View>
        ) : (
          aiInsights.slice(0, 10).map((insight: any) => (
            <View
              key={insight.insight_id}
              style={[
                styles.insightCard,
                {
                  borderLeftColor:
                    insight.severity === 'critical'
                      ? '#EF4444'
                      : insight.severity === 'warning'
                      ? '#F59E0B'
                      : '#6366F1',
                },
              ]}
            >
              <View style={styles.insightHeader}>
                <Ionicons
                  name={
                    insight.insight_type === 'university_concern'
                      ? 'school'
                      : insight.insight_type === 'false_positive'
                      ? 'alert-circle'
                      : 'bulb'
                  }
                  size={20}
                  color={
                    insight.severity === 'critical'
                      ? '#EF4444'
                      : insight.severity === 'warning'
                      ? '#F59E0B'
                      : '#6366F1'
                  }
                />
                <Text style={styles.insightTitle}>{insight.title}</Text>
                {!insight.reviewed && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                )}
              </View>
              <Text style={styles.insightDesc}>{insight.description}</Text>
              <Text style={styles.insightTime}>{formatDate(insight.created_at)}</Text>
              {!insight.reviewed && (
                <TouchableOpacity
                  style={styles.reviewBtn}
                  onPress={() => reviewInsight(insight.insight_id)}
                >
                  <Text style={styles.reviewBtnText}>Mark as Reviewed</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>

      {/* Alert Feedback Section */}
      <View style={styles.aiSection}>
        <Text style={styles.sectionTitle}>Train AI: Alert Feedback</Text>
        <Text style={styles.aiSectionDesc}>
          Help improve AI accuracy by marking alerts as true or false positives
        </Text>

        {safeguardingAlerts
          .filter((a) => !(a as any).was_true_positive)
          .slice(0, 5)
          .map((alert: any) => (
            <View key={alert.alert_id} style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <Text style={styles.feedbackName}>{alert.user_name}</Text>
                <Text style={styles.feedbackSource}>{alert.source}</Text>
              </View>
              <Text style={styles.feedbackContent} numberOfLines={2}>
                {alert.content}
              </Text>
              <Text style={styles.feedbackKeywords}>
                Keywords: {alert.matched_keywords?.join(', ')}
              </Text>
              <View style={styles.feedbackActions}>
                <TouchableOpacity
                  style={[styles.feedbackBtn, styles.truePositiveBtn]}
                  onPress={() => handleAlertFeedback(alert.alert_id, true)}
                >
                  <Ionicons name="checkmark-circle" size={16} color="#fff" />
                  <Text style={styles.feedbackBtnText}>True Positive</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.feedbackBtn, styles.falsePositiveBtn]}
                  onPress={() => handleAlertFeedback(alert.alert_id, false)}
                >
                  <Ionicons name="close-circle" size={16} color="#fff" />
                  <Text style={styles.feedbackBtnText}>False Positive</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
      </View>
    </View>
  );
}
