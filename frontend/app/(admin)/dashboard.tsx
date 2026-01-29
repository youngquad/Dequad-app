import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/services/api';

const { width } = Dimensions.get('window');

interface Stats {
  total_users: number;
  total_students: number;
  total_feedback: number;
  total_matches: number;
  pending_reports: number;
  average_risk_score: number;
  recent_risk_scores: Array<{
    user_id: string;
    user_name: string;
    risk_score: number;
    created_at: string;
  }>;
}

interface AnalyticsOverview {
  total_students: number;
  active_students_week: number;
  engagement_rate: number;
  platform_average_mood: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  university_breakdown: Array<{ university: string; students: number }>;
}

interface AtRiskStudent {
  user_id: string;
  name: string;
  email: string;
  university?: string;
  course?: string;
  dropout_risk: number;
  risk_level: string;
  risk_factors: string[];
  engagement_score: number;
  average_mood: number;
}

interface RetentionData {
  university: string;
  total_students: number;
  active_weekly: number;
  weekly_retention_rate: number;
  average_mood: number;
  at_risk_count: number;
  health_status: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { sessionToken, user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([]);
  const [retentionData, setRetentionData] = useState<RetentionData[]>([]);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'retention' | 'at-risk' | 'insights'>('overview');

  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Access Denied', 'You need admin access to view this page');
      router.back();
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, analyticsData, atRiskData, retentionResponse] = await Promise.all([
        api.get('/admin/stats', sessionToken),
        api.get('/admin/analytics/overview', sessionToken),
        api.get('/admin/analytics/at-risk-students', sessionToken),
        api.get('/admin/analytics/retention', sessionToken),
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
      setAtRiskStudents(atRiskData.students || []);
      setRetentionData(retentionResponse.universities || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load admin data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const loadAiInsights = async () => {
    try {
      const data = await api.post('/admin/analytics/ai-insights', {}, sessionToken);
      setAiInsights(data);
    } catch (error) {
      console.error('Error loading AI insights:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return '#10B981';
    if (score < 60) return '#F59E0B';
    return '#EF4444';
  };

  const getHealthColor = (status: string) => {
    if (status === 'Good') return '#10B981';
    if (status === 'Attention Needed') return '#F59E0B';
    return '#EF4444';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderOverviewTab = () => (
    <View>
      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, styles.metricPrimary]}>
          <Ionicons name="people" size={28} color="#6366F1" />
          <Text style={styles.metricValue}>{analytics?.total_students || 0}</Text>
          <Text style={styles.metricLabel}>Total Students</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="pulse" size={28} color="#10B981" />
          <Text style={styles.metricValue}>{analytics?.active_students_week || 0}</Text>
          <Text style={styles.metricLabel}>Active (7d)</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="trending-up" size={28} color="#F59E0B" />
          <Text style={styles.metricValue}>{analytics?.engagement_rate || 0}%</Text>
          <Text style={styles.metricLabel}>Engagement</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="happy" size={28} color="#EC4899" />
          <Text style={styles.metricValue}>{analytics?.platform_average_mood || 0}</Text>
          <Text style={styles.metricLabel}>Avg Mood</Text>
        </View>
      </View>

      {/* Risk Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Risk Distribution</Text>
        <View style={styles.riskDistribution}>
          <View style={[styles.riskBar, { backgroundColor: '#EF4444', flex: analytics?.high_risk_count || 1 }]}>
            <Text style={styles.riskBarText}>{analytics?.high_risk_count || 0}</Text>
            <Text style={styles.riskBarLabel}>High</Text>
          </View>
          <View style={[styles.riskBar, { backgroundColor: '#F59E0B', flex: analytics?.medium_risk_count || 1 }]}>
            <Text style={styles.riskBarText}>{analytics?.medium_risk_count || 0}</Text>
            <Text style={styles.riskBarLabel}>Medium</Text>
          </View>
          <View style={[styles.riskBar, { backgroundColor: '#10B981', flex: analytics?.low_risk_count || 1 }]}>
            <Text style={styles.riskBarText}>{analytics?.low_risk_count || 0}</Text>
            <Text style={styles.riskBarLabel}>Low</Text>
          </View>
        </View>
      </View>

      {/* University Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Universities</Text>
        {analytics?.university_breakdown?.map((uni, index) => (
          <View key={index} style={styles.universityItem}>
            <View style={styles.universityRank}>
              <Text style={styles.rankNumber}>{index + 1}</Text>
            </View>
            <View style={styles.universityInfo}>
              <Text style={styles.universityName}>{uni.university}</Text>
              <Text style={styles.universityCount}>{uni.students} students</Text>
            </View>
          </View>
        ))}
        {(!analytics?.university_breakdown || analytics.university_breakdown.length === 0) && (
          <Text style={styles.emptyText}>No university data available</Text>
        )}
      </View>
    </View>
  );

  const renderRetentionTab = () => (
    <View>
      <Text style={styles.sectionTitle}>University Retention Analytics</Text>
      {retentionData.map((uni, index) => (
        <View key={index} style={styles.retentionCard}>
          <View style={styles.retentionHeader}>
            <Text style={styles.retentionUniversity}>{uni.university}</Text>
            <View style={[styles.healthBadge, { backgroundColor: getHealthColor(uni.health_status) + '20' }]}>
              <Text style={[styles.healthBadgeText, { color: getHealthColor(uni.health_status) }]}>
                {uni.health_status}
              </Text>
            </View>
          </View>
          <View style={styles.retentionStats}>
            <View style={styles.retentionStat}>
              <Text style={styles.retentionStatValue}>{uni.total_students}</Text>
              <Text style={styles.retentionStatLabel}>Students</Text>
            </View>
            <View style={styles.retentionStat}>
              <Text style={styles.retentionStatValue}>{uni.weekly_retention_rate}%</Text>
              <Text style={styles.retentionStatLabel}>Retention</Text>
            </View>
            <View style={styles.retentionStat}>
              <Text style={styles.retentionStatValue}>{uni.average_mood}/10</Text>
              <Text style={styles.retentionStatLabel}>Avg Mood</Text>
            </View>
            <View style={styles.retentionStat}>
              <Text style={[styles.retentionStatValue, { color: '#EF4444' }]}>{uni.at_risk_count}</Text>
              <Text style={styles.retentionStatLabel}>At Risk</Text>
            </View>
          </View>
        </View>
      ))}
      {retentionData.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="school-outline" size={48} color="#4B5563" />
          <Text style={styles.emptyText}>No retention data available</Text>
        </View>
      )}
    </View>
  );

  const renderAtRiskTab = () => (
    <View>
      <View style={styles.atRiskSummary}>
        <Text style={styles.atRiskTitle}>Students at Risk of Dropout</Text>
        <Text style={styles.atRiskCount}>{atRiskStudents.length} students identified</Text>
      </View>
      {atRiskStudents.map((student, index) => (
        <View key={index} style={styles.studentCard}>
          <View style={styles.studentHeader}>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.studentDetails}>
                {student.university || 'Unknown University'} • {student.course || 'Unknown Course'}
              </Text>
            </View>
            <View style={[styles.riskLevelBadge, { backgroundColor: getRiskColor(student.dropout_risk) + '20' }]}>
              <Text style={[styles.riskLevelText, { color: getRiskColor(student.dropout_risk) }]}>
                {student.dropout_risk}%
              </Text>
            </View>
          </View>
          <View style={styles.riskFactorsContainer}>
            <Text style={styles.riskFactorsLabel}>Risk Factors:</Text>
            {student.risk_factors.map((factor, i) => (
              <View key={i} style={styles.riskFactor}>
                <Ionicons name="warning" size={14} color="#F59E0B" />
                <Text style={styles.riskFactorText}>{factor}</Text>
              </View>
            ))}
          </View>
          <View style={styles.studentMetrics}>
            <View style={styles.studentMetric}>
              <Ionicons name="pulse" size={16} color="#6366F1" />
              <Text style={styles.studentMetricText}>Engagement: {student.engagement_score}%</Text>
            </View>
            <View style={styles.studentMetric}>
              <Ionicons name="happy" size={16} color="#10B981" />
              <Text style={styles.studentMetricText}>Avg Mood: {student.average_mood}/10</Text>
            </View>
          </View>
        </View>
      ))}
      {atRiskStudents.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle" size={48} color="#10B981" />
          <Text style={styles.emptyText}>No students currently at high risk</Text>
        </View>
      )}
    </View>
  );

  const renderInsightsTab = () => (
    <View>
      <TouchableOpacity style={styles.generateButton} onPress={loadAiInsights}>
        <Ionicons name="sparkles" size={24} color="#fff" />
        <Text style={styles.generateButtonText}>Generate AI Insights</Text>
      </TouchableOpacity>

      {aiInsights && (
        <View style={styles.insightsContainer}>
          <View style={styles.insightSection}>
            <Text style={styles.insightTitle}>Summary</Text>
            <Text style={styles.insightText}>{aiInsights.insights?.summary || 'No summary available'}</Text>
          </View>

          {aiInsights.insights?.retention_insights?.length > 0 && (
            <View style={styles.insightSection}>
              <Text style={styles.insightTitle}>Retention Insights</Text>
              {aiInsights.insights.retention_insights.map((insight: string, i: number) => (
                <View key={i} style={styles.insightItem}>
                  <Ionicons name="analytics" size={16} color="#6366F1" />
                  <Text style={styles.insightItemText}>{insight}</Text>
                </View>
              ))}
            </View>
          )}

          {aiInsights.insights?.dropout_risk_factors?.length > 0 && (
            <View style={styles.insightSection}>
              <Text style={styles.insightTitle}>Dropout Risk Factors</Text>
              {aiInsights.insights.dropout_risk_factors.map((factor: string, i: number) => (
                <View key={i} style={styles.insightItem}>
                  <Ionicons name="warning" size={16} color="#EF4444" />
                  <Text style={styles.insightItemText}>{factor}</Text>
                </View>
              ))}
            </View>
          )}

          {aiInsights.insights?.recommendations?.length > 0 && (
            <View style={styles.insightSection}>
              <Text style={styles.insightTitle}>Recommendations</Text>
              {aiInsights.insights.recommendations.map((rec: string, i: number) => (
                <View key={i} style={styles.insightItem}>
                  <Ionicons name="bulb" size={16} color="#F59E0B" />
                  <Text style={styles.insightItemText}>{rec}</Text>
                </View>
              ))}
            </View>
          )}

          {aiInsights.insights?.priority_actions?.length > 0 && (
            <View style={styles.insightSection}>
              <Text style={styles.insightTitle}>Priority Actions</Text>
              {aiInsights.insights.priority_actions.map((action: string, i: number) => (
                <View key={i} style={styles.insightItem}>
                  <Ionicons name="flash" size={16} color="#EC4899" />
                  <Text style={styles.insightItemText}>{action}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {!aiInsights && (
        <View style={styles.emptyState}>
          <Ionicons name="sparkles-outline" size={48} color="#4B5563" />
          <Text style={styles.emptyText}>Tap the button above to generate AI-powered insights</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
        }
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Admin Dashboard</Text>
              <Text style={styles.headerSubtitle}>Student Analytics & Retention</Text>
            </View>
          </View>

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
              onPress={() => setActiveTab('overview')}
            >
              <Ionicons name="grid" size={18} color={activeTab === 'overview' ? '#fff' : '#9CA3AF'} />
              <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'retention' && styles.activeTab]}
              onPress={() => setActiveTab('retention')}
            >
              <Ionicons name="school" size={18} color={activeTab === 'retention' ? '#fff' : '#9CA3AF'} />
              <Text style={[styles.tabText, activeTab === 'retention' && styles.activeTabText]}>Retention</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'at-risk' && styles.activeTab]}
              onPress={() => setActiveTab('at-risk')}
            >
              <Ionicons name="alert-circle" size={18} color={activeTab === 'at-risk' ? '#fff' : '#9CA3AF'} />
              <Text style={[styles.tabText, activeTab === 'at-risk' && styles.activeTabText]}>At Risk</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
              onPress={() => setActiveTab('insights')}
            >
              <Ionicons name="sparkles" size={18} color={activeTab === 'insights' ? '#fff' : '#9CA3AF'} />
              <Text style={[styles.tabText, activeTab === 'insights' && styles.activeTabText]}>AI Insights</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'retention' && renderRetentionTab()}
          {activeTab === 'at-risk' && renderAtRiskTab()}
          {activeTab === 'insights' && renderInsightsTab()}

          {/* Back to App */}
          <TouchableOpacity style={styles.backToAppButton} onPress={() => router.push('/(main)/mood')}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.backToAppText}>Back to App</Text>
          </TouchableOpacity>
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
  loadingText: {
    color: '#9CA3AF',
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  tabsContainer: {
    marginBottom: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#6366F1',
  },
  tabText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#fff',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    width: (width - 52) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  metricPrimary: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  riskDistribution: {
    flexDirection: 'row',
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
  },
  riskBar: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
  },
  riskBarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  riskBarLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  universityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  universityRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    color: '#fff',
    fontWeight: 'bold',
  },
  universityInfo: {
    flex: 1,
  },
  universityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  universityCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  retentionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  retentionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  retentionUniversity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  healthBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  healthBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  retentionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  retentionStat: {
    alignItems: 'center',
  },
  retentionStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  retentionStatLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  atRiskSummary: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  atRiskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
  },
  atRiskCount: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  studentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  studentDetails: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  riskLevelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  riskLevelText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  riskFactorsContainer: {
    marginBottom: 12,
  },
  riskFactorsLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  riskFactor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  riskFactorText: {
    fontSize: 13,
    color: '#F59E0B',
    marginLeft: 6,
  },
  studentMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  studentMetric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentMetricText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  insightsContainer: {
    gap: 16,
  },
  insightSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 22,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insightItemText: {
    fontSize: 14,
    color: '#D1D5DB',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
    textAlign: 'center',
  },
  backToAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 32,
  },
  backToAppText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
