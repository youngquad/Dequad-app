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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/services/api';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

interface SafeguardingAlert {
  alert_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  source: string;
  risk_level: string;
  matched_keywords: string[];
  content: string;
  acknowledged: boolean;
  created_at: string;
}

interface MoodTrend {
  date: string;
  average_mood: number;
  entry_count: number;
}

interface UniversityData {
  university: string;
  student_count: number;
  average_mood: number;
  mood_entries: number;
  feedback_entries: number;
  safeguarding_alerts: number;
  engagement_rate: number;
}

interface RiskDistribution {
  risk_score_distribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  safeguarding_alert_distribution: {
    high: number;
    medium: number;
  };
}

interface BulkAnalysisResult {
  user_id: string;
  name: string;
  email: string;
  university: string;
  average_mood: number | null;
  risk_score: number;
  risk_level: string;
  mood_entries_count: number;
  safeguarding_alerts: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { sessionToken, user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'safeguarding' | 'analytics' | 'universities' | 'export'>('overview');
  
  // Data states
  const [stats, setStats] = useState<any>(null);
  const [safeguardingAlerts, setSafeguardingAlerts] = useState<SafeguardingAlert[]>([]);
  const [alertStats, setAlertStats] = useState({ unacknowledged: 0, high_risk: 0, total: 0 });
  const [moodTrends, setMoodTrends] = useState<MoodTrend[]>([]);
  const [universityData, setUniversityData] = useState<UniversityData[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution | null>(null);
  const [bulkAnalysis, setBulkAnalysis] = useState<BulkAnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // University-specific states
  const [universities, setUniversities] = useState<{name: string; student_count: number}[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [universityStudents, setUniversityStudents] = useState<any[]>([]);
  const [universityAnalysis, setUniversityAnalysis] = useState<any>(null);
  const [isLoadingUniversity, setIsLoadingUniversity] = useState(false);

  // Date filters
  const [dateRange, setDateRange] = useState('30'); // days

  const backendUrl = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL || '';

  useEffect(() => {
    loadAllData();
  }, [dateRange]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadSafeguardingAlerts(),
        loadMoodTrends(),
        loadUniversityComparison(),
        loadRiskDistribution(),
        loadUniversitiesList(),
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.get('/admin/stats', sessionToken);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadSafeguardingAlerts = async () => {
    try {
      const data = await api.get('/admin/safeguarding-alerts', sessionToken);
      setSafeguardingAlerts(data.alerts || []);
      setAlertStats({
        unacknowledged: data.unacknowledged_count || 0,
        high_risk: data.high_risk_count || 0,
        total: data.total_count || 0,
      });
    } catch (error) {
      console.error('Error loading safeguarding alerts:', error);
    }
  };

  const loadMoodTrends = async () => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      const data = await api.get(`/admin/analytics/mood-trends?start_date=${startDate.toISOString()}&group_by=day`, sessionToken);
      setMoodTrends(data.trends || []);
    } catch (error) {
      console.error('Error loading mood trends:', error);
    }
  };

  const loadUniversityComparison = async () => {
    try {
      const data = await api.get('/admin/analytics/university-comparison', sessionToken);
      setUniversityData(data.universities || []);
    } catch (error) {
      console.error('Error loading university data:', error);
    }
  };

  const loadRiskDistribution = async () => {
    try {
      const data = await api.get('/admin/analytics/risk-distribution', sessionToken);
      setRiskDistribution(data);
    } catch (error) {
      console.error('Error loading risk distribution:', error);
    }
  };

  const loadUniversitiesList = async () => {
    try {
      const data = await api.get('/admin/universities', sessionToken);
      setUniversities(data.universities || []);
    } catch (error) {
      console.error('Error loading universities:', error);
    }
  };

  const loadUniversityStudents = async (universityName: string) => {
    setIsLoadingUniversity(true);
    setSelectedUniversity(universityName);
    try {
      const data = await api.get(`/admin/university/${encodeURIComponent(universityName)}/students`, sessionToken);
      setUniversityStudents(data.students || []);
    } catch (error) {
      console.error('Error loading university students:', error);
      Alert.alert('Error', 'Failed to load university students');
    } finally {
      setIsLoadingUniversity(false);
    }
  };

  const runUniversityAnalysis = async (universityName: string) => {
    setIsAnalyzing(true);
    try {
      const data = await api.post(`/admin/university/${encodeURIComponent(universityName)}/ai-analysis`, {}, sessionToken);
      setUniversityAnalysis(data);
      Alert.alert(
        'Analysis Complete',
        `${universityName}\n\nWellbeing Score: ${data.ai_analysis?.overall_wellbeing_score || 'N/A'}/100\nTrend: ${data.ai_analysis?.wellbeing_trend || 'N/A'}`
      );
    } catch (error) {
      console.error('Error running university analysis:', error);
      Alert.alert('Error', 'Failed to run university analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runBulkAnalysis = async (university?: string) => {
    setIsAnalyzing(true);
    try {
      const payload = university ? { limit: 100, university } : { limit: 100 };
      const data = await api.post('/admin/analytics/bulk-ai-analysis', payload, sessionToken);
      setBulkAnalysis(data.results || []);
      Alert.alert(
        'Analysis Complete',
        `Analyzed ${data.students_analyzed} students${university ? ` from ${university}` : ''}:\n• High Risk: ${data.high_risk_count}\n• Medium Risk: ${data.medium_risk_count}\n• Low Risk: ${data.low_risk_count}`
      );
    } catch (error) {
      console.error('Error running bulk analysis:', error);
      Alert.alert('Error', 'Failed to run bulk analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await api.post(`/admin/safeguarding-alerts/${alertId}/acknowledge`, {}, sessionToken);
      loadSafeguardingAlerts();
      Alert.alert('Success', 'Alert acknowledged');
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      Alert.alert('Error', 'Failed to acknowledge alert');
    }
  };

  const exportData = async (type: string) => {
    const exportUrl = `${backendUrl}/api/admin/export/${type}`;
    Alert.alert(
      'Export Data',
      `This will download ${type} data as CSV. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            Linking.openURL(exportUrl).catch(() => {
              Alert.alert('Error', 'Could not open export link. Copy this URL to download: ' + exportUrl);
            });
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
      case 'critical':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      default:
        return '#10B981';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading Admin Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Educare Analytics</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['overview', 'safeguarding', 'analytics', 'export'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Ionicons
              name={
                tab === 'overview' ? 'grid-outline' :
                tab === 'safeguarding' ? 'shield-outline' :
                tab === 'analytics' ? 'bar-chart-outline' : 'download-outline'
              }
              size={18}
              color={activeTab === tab ? '#6366F1' : '#9CA3AF'}
            />
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <View style={styles.content}>
            {/* Quick Stats */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: '#6366F1' }]}>
                <Text style={styles.statValue}>{stats?.total_students || 0}</Text>
                <Text style={styles.statLabel}>Students</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#10B981' }]}>
                <Text style={styles.statValue}>{stats?.total_feedback || 0}</Text>
                <Text style={styles.statLabel}>Feedback</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.statValue}>{alertStats.unacknowledged}</Text>
                <Text style={styles.statLabel}>Alerts</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#EF4444' }]}>
                <Text style={styles.statValue}>{alertStats.high_risk}</Text>
                <Text style={styles.statLabel}>High Risk</Text>
              </View>
            </View>

            {/* Risk Distribution */}
            {riskDistribution && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Risk Distribution</Text>
                <View style={styles.riskBars}>
                  {Object.entries(riskDistribution.risk_score_distribution).map(([level, count]) => (
                    <View key={level} style={styles.riskBarItem}>
                      <Text style={styles.riskBarLabel}>{level}</Text>
                      <View style={styles.riskBarBg}>
                        <View
                          style={[
                            styles.riskBarFill,
                            {
                              width: `${Math.min((count / Math.max(riskDistribution.total_feedback_entries || 1, 1)) * 100, 100)}%`,
                              backgroundColor: getRiskColor(level),
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.riskBarCount}>{count}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* University Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>University Breakdown</Text>
              {universityData.slice(0, 5).map((uni, index) => (
                <View key={index} style={styles.universityCard}>
                  <View style={styles.universityHeader}>
                    <Text style={styles.universityName}>{uni.university || 'Unknown'}</Text>
                    <Text style={styles.universityStudents}>{uni.student_count} students</Text>
                  </View>
                  <View style={styles.universityStats}>
                    <View style={styles.uniStat}>
                      <Ionicons name="happy-outline" size={16} color="#10B981" />
                      <Text style={styles.uniStatText}>Mood: {uni.average_mood.toFixed(1)}</Text>
                    </View>
                    <View style={styles.uniStat}>
                      <Ionicons name="pulse-outline" size={16} color="#6366F1" />
                      <Text style={styles.uniStatText}>Engagement: {uni.engagement_rate}</Text>
                    </View>
                    <View style={styles.uniStat}>
                      <Ionicons name="warning-outline" size={16} color="#EF4444" />
                      <Text style={styles.uniStatText}>Alerts: {uni.safeguarding_alerts}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Safeguarding Tab */}
        {activeTab === 'safeguarding' && (
          <View style={styles.content}>
            {/* Alert Summary */}
            <View style={styles.alertSummary}>
              <View style={[styles.alertSummaryCard, { borderLeftColor: '#EF4444' }]}>
                <Text style={styles.alertSummaryValue}>{alertStats.high_risk}</Text>
                <Text style={styles.alertSummaryLabel}>High Risk</Text>
              </View>
              <View style={[styles.alertSummaryCard, { borderLeftColor: '#F59E0B' }]}>
                <Text style={styles.alertSummaryValue}>{alertStats.unacknowledged}</Text>
                <Text style={styles.alertSummaryLabel}>Unacknowledged</Text>
              </View>
              <View style={[styles.alertSummaryCard, { borderLeftColor: '#6366F1' }]}>
                <Text style={styles.alertSummaryValue}>{alertStats.total}</Text>
                <Text style={styles.alertSummaryLabel}>Total Alerts</Text>
              </View>
            </View>

            {/* Alert List */}
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            {safeguardingAlerts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="shield-checkmark" size={48} color="#10B981" />
                <Text style={styles.emptyStateText}>No safeguarding alerts</Text>
              </View>
            ) : (
              safeguardingAlerts.map((alert) => (
                <View
                  key={alert.alert_id}
                  style={[styles.alertCard, { borderLeftColor: getRiskColor(alert.risk_level) }]}
                >
                  <View style={styles.alertHeader}>
                    <View style={styles.alertUser}>
                      <Text style={styles.alertUserName}>{alert.user_name}</Text>
                      <Text style={styles.alertUserEmail}>{alert.user_email}</Text>
                    </View>
                    <View style={[styles.alertBadge, { backgroundColor: getRiskColor(alert.risk_level) + '20' }]}>
                      <Text style={[styles.alertBadgeText, { color: getRiskColor(alert.risk_level) }]}>
                        {alert.risk_level.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.alertMeta}>
                    <Text style={styles.alertSource}>Source: {alert.source}</Text>
                    <Text style={styles.alertDate}>{formatDate(alert.created_at)}</Text>
                  </View>
                  <View style={styles.alertKeywords}>
                    {alert.matched_keywords.map((keyword, i) => (
                      <View key={i} style={styles.keywordTag}>
                        <Text style={styles.keywordText}>{keyword}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.alertContent} numberOfLines={3}>
                    {alert.content}
                  </Text>
                  {!alert.acknowledged && (
                    <TouchableOpacity
                      style={styles.acknowledgeButton}
                      onPress={() => acknowledgeAlert(alert.alert_id)}
                    >
                      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                      <Text style={styles.acknowledgeText}>Acknowledge</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <View style={styles.content}>
            {/* Date Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Date Range:</Text>
              <View style={styles.filterButtons}>
                {['7', '30', '90'].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[styles.filterButton, dateRange === days && styles.filterButtonActive]}
                    onPress={() => setDateRange(days)}
                  >
                    <Text style={[styles.filterButtonText, dateRange === days && styles.filterButtonTextActive]}>
                      {days}d
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Mood Trends */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mood Trends (Last {dateRange} Days)</Text>
              <View style={styles.trendChart}>
                {moodTrends.slice(-14).map((trend, index) => (
                  <View key={index} style={styles.trendBar}>
                    <View
                      style={[
                        styles.trendBarFill,
                        {
                          height: `${(trend.average_mood / 10) * 100}%`,
                          backgroundColor: trend.average_mood >= 7 ? '#10B981' : trend.average_mood >= 5 ? '#F59E0B' : '#EF4444',
                        },
                      ]}
                    />
                    <Text style={styles.trendBarLabel}>{trend.date.slice(-2)}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.chartNote}>Average mood score by day (scale 1-10)</Text>
            </View>

            {/* Bulk AI Analysis */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bulk AI Analysis</Text>
              <TouchableOpacity
                style={styles.analyzeButton}
                onPress={runBulkAnalysis}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="analytics" size={20} color="#fff" />
                    <Text style={styles.analyzeButtonText}>Run Analysis on All Students</Text>
                  </>
                )}
              </TouchableOpacity>

              {bulkAnalysis.length > 0 && (
                <View style={styles.analysisResults}>
                  <Text style={styles.analysisResultsTitle}>High Risk Students:</Text>
                  {bulkAnalysis.filter(s => s.risk_level === 'high').slice(0, 5).map((student) => (
                    <View key={student.user_id} style={styles.analysisCard}>
                      <View style={styles.analysisHeader}>
                        <Text style={styles.analysisName}>{student.name}</Text>
                        <View style={[styles.riskBadge, { backgroundColor: '#EF444420' }]}>
                          <Text style={[styles.riskBadgeText, { color: '#EF4444' }]}>
                            Risk: {student.risk_score}%
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.analysisDetail}>
                        {student.university || 'Unknown University'} • Mood: {student.average_mood?.toFixed(1) || 'N/A'}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Export Data (CSV)</Text>
            <Text style={styles.exportNote}>
              Download data reports for external analysis. All exports are in CSV format.
            </Text>

            <TouchableOpacity style={styles.exportCard} onPress={() => exportData('students')}>
              <View style={styles.exportIcon}>
                <Ionicons name="people" size={24} color="#6366F1" />
              </View>
              <View style={styles.exportInfo}>
                <Text style={styles.exportTitle}>Student Data</Text>
                <Text style={styles.exportDesc}>Export all student profiles and details</Text>
              </View>
              <Ionicons name="download-outline" size={24} color="#6366F1" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportCard} onPress={() => exportData('mood-history')}>
              <View style={styles.exportIcon}>
                <Ionicons name="happy" size={24} color="#10B981" />
              </View>
              <View style={styles.exportInfo}>
                <Text style={styles.exportTitle}>Mood History</Text>
                <Text style={styles.exportDesc}>Export all mood entries with timestamps</Text>
              </View>
              <Ionicons name="download-outline" size={24} color="#10B981" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportCard} onPress={() => exportData('feedback-history')}>
              <View style={styles.exportIcon}>
                <Ionicons name="chatbox" size={24} color="#F59E0B" />
              </View>
              <View style={styles.exportInfo}>
                <Text style={styles.exportTitle}>Feedback History</Text>
                <Text style={styles.exportDesc}>Export lecture feedback with risk scores</Text>
              </View>
              <Ionicons name="download-outline" size={24} color="#F59E0B" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportCard} onPress={() => exportData('safeguarding-alerts')}>
              <View style={styles.exportIcon}>
                <Ionicons name="shield" size={24} color="#EF4444" />
              </View>
              <View style={styles.exportInfo}>
                <Text style={styles.exportTitle}>Safeguarding Alerts</Text>
                <Text style={styles.exportDesc}>Export all safeguarding alerts</Text>
              </View>
              <Ionicons name="download-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 50 }} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  logoutButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  activeTab: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  tabText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 12,
    margin: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  riskBars: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
  },
  riskBarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  riskBarLabel: {
    width: 60,
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  riskBarBg: {
    flex: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  riskBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  riskBarCount: {
    width: 40,
    textAlign: 'right',
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  universityCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  universityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  universityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  universityStudents: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  universityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  uniStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uniStatText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  alertSummary: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  alertSummaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderLeftWidth: 3,
    alignItems: 'center',
  },
  alertSummaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  alertSummaryLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#9CA3AF',
    marginTop: 12,
  },
  alertCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertUser: {
    flex: 1,
  },
  alertUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  alertUserEmail: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  alertBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  alertMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  alertSource: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  alertDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  alertKeywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  keywordTag: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  keywordText: {
    fontSize: 10,
    color: '#EF4444',
  },
  alertContent: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
    marginBottom: 12,
  },
  acknowledgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acknowledgeText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 6,
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginRight: 12,
  },
  filterButtons: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#6366F1',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  trendChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
  },
  trendBar: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  trendBarFill: {
    width: 12,
    borderRadius: 6,
    minHeight: 4,
  },
  trendBarLabel: {
    fontSize: 8,
    color: '#9CA3AF',
    marginTop: 4,
  },
  chartNote: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  analysisResults: {
    marginTop: 12,
  },
  analysisResultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 8,
  },
  analysisCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analysisName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  analysisDetail: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  exportNote: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 20,
    lineHeight: 20,
  },
  exportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exportIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exportInfo: {
    flex: 1,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  exportDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
