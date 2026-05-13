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
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const { sessionToken: authSessionToken, user, logout } = useAuth();
  const [localSessionToken, setLocalSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'safeguarding' | 'analytics' | 'universities' | 'ai-learning' | 'export'>('overview');
  const [tokenLoaded, setTokenLoaded] = useState(false);
  
  // Use local token or auth context token
  const sessionToken = localSessionToken || authSessionToken;
  
  // Load session token from storage on mount (supports both web and mobile)
  useEffect(() => {
    const loadToken = async () => {
      try {
        let token = null;
        
        // On web, try localStorage first
        if (typeof window !== 'undefined' && window.localStorage) {
          token = window.localStorage.getItem('session_token');
          console.log('Web localStorage token:', token ? token.substring(0, 20) + '...' : 'none');
        }
        
        // Fall back to AsyncStorage
        if (!token) {
          token = await AsyncStorage.getItem('session_token');
          console.log('AsyncStorage token:', token ? token.substring(0, 20) + '...' : 'none');
        }
        
        if (token) {
          setLocalSessionToken(token);
        }
        setTokenLoaded(true);
      } catch (error) {
        console.error('Error loading session token:', error);
        setTokenLoaded(true);
      }
    };
    loadToken();
  }, []);
  
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

  // AI Learning states
  const [aiLearningStats, setAiLearningStats] = useState<any>(null);
  const [aiKeywords, setAiKeywords] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [keywordFilter, setKeywordFilter] = useState<string>('pending');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Date filters
  const [dateRange, setDateRange] = useState('30'); // days

  const backendUrl = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL || '';

  useEffect(() => {
    // Only load data when sessionToken is available and token loading is complete
    if (tokenLoaded && sessionToken) {
      console.log('Loading admin data with token:', sessionToken?.substring(0, 20) + '...');
      loadAllData();
    } else if (tokenLoaded && !sessionToken) {
      // No token available after loading - redirect to login
      console.log('No session token found, redirecting to login...');
      router.replace('/(admin)/login');
    }
  }, [dateRange, sessionToken, localSessionToken, tokenLoaded]);

  const loadAllData = async () => {
    setIsLoading(true);
    console.log('Starting to load all admin data...');
    try {
      await Promise.all([
        loadStats(),
        loadSafeguardingAlerts(),
        loadMoodTrends(),
        loadUniversityComparison(),
        loadRiskDistribution(),
        loadUniversitiesList(),
      ]);
      console.log('All admin data loaded successfully');
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('Loading stats...');
      const data = await api.get('/admin/stats', sessionToken);
      console.log('Stats loaded:', data?.total_students, 'students');
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadSafeguardingAlerts = async () => {
    try {
      console.log('Loading safeguarding alerts...');
      const data = await api.get('/admin/safeguarding-alerts', sessionToken);
      console.log('Safeguarding alerts loaded:', data?.alerts?.length || 0, 'alerts');
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
      console.log('Loading mood trends...');
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      const data = await api.get(`/admin/analytics/mood-trends?start_date=${startDate.toISOString()}&group_by=day`, sessionToken);
      console.log('Mood trends loaded:', data?.trends?.length || 0, 'data points');
      setMoodTrends(data.trends || []);
    } catch (error) {
      console.error('Error loading mood trends:', error);
    }
  };

  const loadUniversityComparison = async () => {
    try {
      console.log('Loading university comparison...');
      const data = await api.get('/admin/analytics/university-comparison', sessionToken);
      console.log('University comparison loaded:', data?.universities?.length || 0, 'universities');
      setUniversityData(data.universities || []);
    } catch (error) {
      console.error('Error loading university data:', error);
    }
  };

  const loadRiskDistribution = async () => {
    try {
      console.log('Loading risk distribution...');
      const data = await api.get('/admin/analytics/risk-distribution', sessionToken);
      console.log('Risk distribution loaded:', data);
      setRiskDistribution(data);
    } catch (error) {
      console.error('Error loading risk distribution:', error);
    }
  };

  const loadUniversitiesList = async () => {
    try {
      console.log('Loading universities list...');
      const data = await api.get('/admin/universities', sessionToken);
      console.log('Universities list loaded:', data?.universities?.length || 0, 'universities');
      setUniversities(data.universities || []);
    } catch (error) {
      console.error('Error loading universities list:', error);
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
      const data = await api.post(`/admin/university/${encodeURIComponent(universityName)}/ai-analysis`, {});
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

  // Individual student AI analysis
  const [studentAnalysis, setStudentAnalysis] = useState<any>(null);
  const [analyzingStudentId, setAnalyzingStudentId] = useState<string | null>(null);

  const runStudentAnalysis = async (userId: string, userName: string) => {
    setAnalyzingStudentId(userId);
    try {
      const data = await api.get(`/admin/ai-risk-analysis/${userId}`);
      setStudentAnalysis(data);
      Alert.alert(
        `Analysis: ${userName}`,
        `Risk Level: ${data.ai_analysis?.risk_level?.toUpperCase() || 'N/A'}\nRisk Score: ${data.ai_analysis?.overall_risk_score || 'N/A'}/100\n\n${data.ai_analysis?.summary || 'No summary available'}`
      );
    } catch (error) {
      console.error('Error running student analysis:', error);
      Alert.alert('Error', 'Failed to analyze student');
    } finally {
      setAnalyzingStudentId(null);
    }
  };

  const runBulkAnalysis = async (university?: string) => {
    setIsAnalyzing(true);
    try {
      const payload = university ? { limit: 100, university } : { limit: 100 };
      const data = await api.post('/admin/analytics/bulk-ai-analysis', payload);
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
      await api.post(`/admin/safeguarding-alerts/${alertId}/acknowledge`, {});
      loadSafeguardingAlerts();
      Alert.alert('Success', 'Alert acknowledged');
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      Alert.alert('Error', 'Failed to acknowledge alert');
    }
  };

  // AI Learning functions
  const loadAILearningStats = async () => {
    try {
      const data = await api.get('/admin/ai-learning/stats');
      setAiLearningStats(data);
    } catch (error) {
      console.error('Error loading AI learning stats:', error);
    }
  };

  const loadAIKeywords = async (status?: string) => {
    setIsLoadingAI(true);
    try {
      const endpoint = status ? `/admin/ai-learning/keywords?status=${status}` : '/admin/ai-learning/keywords';
      const data = await api.get(endpoint);
      setAiKeywords(data.keywords || []);
    } catch (error) {
      console.error('Error loading AI keywords:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const loadAIInsights = async () => {
    try {
      const data = await api.get('/admin/ai-learning/insights');
      setAiInsights(data.insights || []);
    } catch (error) {
      console.error('Error loading AI insights:', error);
    }
  };

  const handleKeywordAction = async (keywordId: string, action: 'approve' | 'reject', riskCategory?: string) => {
    try {
      await api.post(`/admin/ai-learning/keywords/${keywordId}/action`, {
        action,
        risk_category: riskCategory
      });
      Alert.alert('Success', `Keyword ${action}d successfully`);
      loadAIKeywords(keywordFilter);
      loadAILearningStats();
    } catch (error) {
      console.error('Error actioning keyword:', error);
      Alert.alert('Error', `Failed to ${action} keyword`);
    }
  };

  const handleAlertFeedback = async (alertId: string, wasTruePositive: boolean) => {
    try {
      await api.post(`/admin/safeguarding-alerts/${alertId}/feedback`, {
        was_true_positive: wasTruePositive,
        notes: wasTruePositive ? 'Confirmed as genuine concern' : 'Marked as false positive'
      });
      Alert.alert('Feedback Recorded', `Alert marked as ${wasTruePositive ? 'True Positive' : 'False Positive'}. This helps improve AI accuracy.`);
      loadAILearningStats();
    } catch (error) {
      console.error('Error recording feedback:', error);
      Alert.alert('Error', 'Failed to record feedback');
    }
  };

  const triggerBehavioralAnalysis = async () => {
    setIsLoadingAI(true);
    try {
      await api.post('/admin/ai-learning/trigger-analysis', {});
      Alert.alert('Analysis Complete', 'Behavioral anomaly detection completed. Check insights for any new patterns.');
      loadAIInsights();
    } catch (error) {
      console.error('Error triggering analysis:', error);
      Alert.alert('Error', 'Failed to run behavioral analysis');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const reviewInsight = async (insightId: string) => {
    try {
      await api.post(`/admin/ai-learning/insights/${insightId}/review`, {});
      loadAIInsights();
    } catch (error) {
      console.error('Error reviewing insight:', error);
    }
  };

  // Load AI Learning data when tab is active
  useEffect(() => {
    if (activeTab === 'ai-learning' && sessionToken) {
      loadAILearningStats();
      loadAIKeywords(keywordFilter);
      loadAIInsights();
    }
  }, [activeTab, keywordFilter, sessionToken]);

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
          <Text style={styles.headerSubtitle}>Dequad Analytics</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['overview', 'safeguarding', 'ai-learning', 'universities', 'analytics', 'export'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Ionicons
              name={
                tab === 'overview' ? 'grid-outline' :
                tab === 'safeguarding' ? 'shield-outline' :
                tab === 'ai-learning' ? 'bulb-outline' :
                tab === 'universities' ? 'school-outline' :
                tab === 'analytics' ? 'bar-chart-outline' : 'download-outline'
              }
              size={18}
              color={activeTab === tab ? '#6366F1' : '#9CA3AF'}
            />
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'universities' ? 'Unis' : 
               tab === 'ai-learning' ? 'AI' :
               tab === 'safeguarding' ? 'Safe' :
               tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                <Text style={styles.statValue}>{stats?.subscription_stats?.premium_students || 0}</Text>
                <Text style={styles.statLabel}>Premium</Text>
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

            {/* Subscription Stats Section */}
            {stats?.subscription_stats && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Subscription Overview</Text>
                <View style={styles.subscriptionCard}>
                  <View style={styles.subscriptionRow}>
                    <View style={styles.subscriptionItem}>
                      <Ionicons name="diamond" size={24} color="#F59E0B" />
                      <Text style={styles.subscriptionValue}>{stats.subscription_stats.premium_students}</Text>
                      <Text style={styles.subscriptionLabel}>Premium</Text>
                    </View>
                    <View style={styles.subscriptionDivider} />
                    <View style={styles.subscriptionItem}>
                      <Ionicons name="person" size={24} color="#9CA3AF" />
                      <Text style={styles.subscriptionValue}>{stats.subscription_stats.free_students}</Text>
                      <Text style={styles.subscriptionLabel}>Free</Text>
                    </View>
                    <View style={styles.subscriptionDivider} />
                    <View style={styles.subscriptionItem}>
                      <Ionicons name="trending-up" size={24} color="#10B981" />
                      <Text style={styles.subscriptionValue}>{stats.subscription_stats.premium_percentage}%</Text>
                      <Text style={styles.subscriptionLabel}>Conversion</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* University Stats Section */}
            {stats?.university_breakdown && stats.university_breakdown.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Students by University</Text>
                  <Text style={styles.sectionSubcount}>{stats.total_universities} universities</Text>
                </View>
                {stats.university_breakdown.slice(0, 5).map((uni: any, index: number) => (
                  <View key={index} style={styles.universityStatCard}>
                    <View style={styles.universityStatHeader}>
                      <View style={styles.universityStatIcon}>
                        <Ionicons name="school" size={18} color="#6366F1" />
                      </View>
                      <View style={styles.universityStatInfo}>
                        <Text style={styles.universityStatName} numberOfLines={1}>{uni.university || 'Unknown'}</Text>
                        <Text style={styles.universityStatTotal}>{uni.total_students} students</Text>
                      </View>
                    </View>
                    <View style={styles.universityStatBar}>
                      <View 
                        style={[
                          styles.universityStatBarFill, 
                          { 
                            width: `${Math.max(uni.premium_percentage || 0, 5)}%`,
                            backgroundColor: '#F59E0B' 
                          }
                        ]} 
                      />
                    </View>
                    <View style={styles.universityStatFooter}>
                      <Text style={styles.universityStatPremium}>
                        <Ionicons name="diamond" size={12} color="#F59E0B" /> {uni.premium_count} premium
                      </Text>
                      <Text style={styles.universityStatFree}>
                        {uni.free_count} free
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

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
                  
                  {/* Action Buttons */}
                  <View style={styles.alertActions}>
                    {!alert.acknowledged && (
                      <TouchableOpacity
                        style={styles.acknowledgeButton}
                        onPress={() => acknowledgeAlert(alert.alert_id)}
                      >
                        <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                        <Text style={styles.acknowledgeText}>Acknowledge</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.analyzeStudentButton}
                      onPress={() => runStudentAnalysis(alert.user_id, alert.user_name)}
                      disabled={analyzingStudentId === alert.user_id}
                    >
                      {analyzingStudentId === alert.user_id ? (
                        <ActivityIndicator size="small" color="#6366F1" />
                      ) : (
                        <>
                          <Ionicons name="analytics" size={18} color="#6366F1" />
                          <Text style={styles.analyzeStudentText}>Analyze Student</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            {/* University Quick Analysis Section */}
            <View style={styles.safeguardingUniversitySection}>
              <Text style={styles.sectionTitle}>Analyze by University</Text>
              <Text style={styles.sectionSubtitle}>
                Run AI analysis on all students from a specific university
              </Text>
              
              {universities.length === 0 ? (
                <Text style={styles.noUniversitiesText}>No universities found</Text>
              ) : (
                <View style={styles.universityQuickList}>
                  {universities.slice(0, 5).map((uni, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.universityQuickCard}
                      onPress={() => runUniversityAnalysis(uni.name)}
                      disabled={isAnalyzing}
                    >
                      <View style={styles.universityQuickInfo}>
                        <Ionicons name="school" size={20} color="#6366F1" />
                        <Text style={styles.universityQuickName} numberOfLines={1}>
                          {uni.name}
                        </Text>
                        <Text style={styles.universityQuickCount}>
                          ({uni.student_count})
                        </Text>
                      </View>
                      {isAnalyzing ? (
                        <ActivityIndicator size="small" color="#F59E0B" />
                      ) : (
                        <Ionicons name="analytics" size={20} color="#F59E0B" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Run All Students Analysis */}
              <TouchableOpacity
                style={styles.analyzeAllButton}
                onPress={() => runBulkAnalysis()}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="people" size={20} color="#fff" />
                    <Text style={styles.analyzeAllButtonText}>Analyze All Students</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Universities Tab */}
        {activeTab === 'universities' && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Universities</Text>
            <Text style={styles.sectionSubtitle}>
              Select a university to view students and run analysis
            </Text>

            {/* University List */}
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
                    selectedUniversity === uni.name && styles.universitySelectCardActive
                  ]}
                  onPress={() => loadUniversityStudents(uni.name)}
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
                    <TouchableOpacity
                      style={styles.universityAnalyzeBtn}
                      onPress={() => runUniversityAnalysis(uni.name)}
                      disabled={isAnalyzing}
                    >
                      <Ionicons name="analytics" size={16} color="#F59E0B" />
                    </TouchableOpacity>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
              ))
            )}

            {/* Selected University Students */}
            {selectedUniversity && (
              <View style={styles.selectedUniversitySection}>
                <View style={styles.selectedUniversityHeader}>
                  <Text style={styles.selectedUniversityTitle}>{selectedUniversity}</Text>
                  <TouchableOpacity
                    style={styles.runAnalysisBtn}
                    onPress={() => runUniversityAnalysis(selectedUniversity)}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="analytics" size={16} color="#fff" />
                        <Text style={styles.runAnalysisBtnText}>Run AI Analysis</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* University Analysis Results */}
                {universityAnalysis && universityAnalysis.university === selectedUniversity && (
                  <View style={styles.analysisResultCard}>
                    <View style={styles.analysisScoreRow}>
                      <Text style={styles.analysisScoreLabel}>Wellbeing Score</Text>
                      <Text style={[
                        styles.analysisScoreValue,
                        { color: universityAnalysis.ai_analysis?.overall_wellbeing_score >= 60 ? '#10B981' : '#EF4444' }
                      ]}>
                        {universityAnalysis.ai_analysis?.overall_wellbeing_score || 'N/A'}/100
                      </Text>
                    </View>
                    <Text style={styles.analysisSummary}>
                      {universityAnalysis.ai_analysis?.summary || 'No summary available'}
                    </Text>
                    {universityAnalysis.ai_analysis?.key_concerns?.length > 0 && (
                      <View style={styles.analysisConcerns}>
                        <Text style={styles.analysisConcernsTitle}>Key Concerns:</Text>
                        {universityAnalysis.ai_analysis.key_concerns.map((concern: string, i: number) => (
                          <Text key={i} style={styles.analysisConcernItem}>• {concern}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Student List */}
                {isLoadingUniversity ? (
                  <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 20 }} />
                ) : (
                  <>
                    <Text style={styles.studentListTitle}>
                      Students ({universityStudents.length}) - Sorted by Risk
                    </Text>
                    {universityStudents.map((student, idx) => (
                      <View 
                        key={student.user_id || idx} 
                        style={[styles.studentCard, { borderLeftColor: getRiskColor(student.risk_level) }]}
                      >
                        <View style={styles.studentHeader}>
                          <Text style={styles.studentName}>{student.name}</Text>
                          <View style={[styles.riskBadge, { backgroundColor: getRiskColor(student.risk_level) + '20' }]}>
                            <Text style={[styles.riskBadgeText, { color: getRiskColor(student.risk_level) }]}>
                              {student.risk_score}%
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.studentEmail}>{student.email}</Text>
                        <View style={styles.studentStats}>
                          <Text style={styles.studentStatItem}>
                            Course: {student.course || 'N/A'}
                          </Text>
                          <Text style={styles.studentStatItem}>
                            Mood: {student.average_mood?.toFixed(1) || 'N/A'}
                          </Text>
                          <Text style={styles.studentStatItem}>
                            Alerts: {student.safeguarding_alerts}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </>
                )}
              </View>
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

        {/* AI Learning Tab */}
        {activeTab === 'ai-learning' && (
          <View style={styles.content}>
            {/* AI Learning Stats */}
            <Text style={styles.sectionTitle}>🧠 AI Learning Dashboard</Text>
            
            {aiLearningStats && (
              <View style={styles.aiStatsContainer}>
                <View style={styles.aiStatRow}>
                  <View style={[styles.aiStatCard, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                    <Text style={styles.aiStatValue}>{aiLearningStats.keyword_coverage?.total_active || 0}</Text>
                    <Text style={styles.aiStatLabel}>Active Keywords</Text>
                    <Text style={styles.aiStatSub}>
                      {aiLearningStats.keyword_coverage?.built_in || 0} built-in + {aiLearningStats.keyword_coverage?.learned_approved || 0} learned
                    </Text>
                  </View>
                  <View style={[styles.aiStatCard, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <Text style={styles.aiStatValue}>
                      {aiLearningStats.alerts?.accuracy_rate ? `${aiLearningStats.alerts.accuracy_rate}%` : 'N/A'}
                    </Text>
                    <Text style={styles.aiStatLabel}>Alert Accuracy</Text>
                    <Text style={styles.aiStatSub}>
                      {aiLearningStats.alerts?.true_positives || 0} true / {aiLearningStats.alerts?.total_with_feedback || 0} reviewed
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

            {/* Trigger Analysis Button */}
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
                      style={[styles.keywordFilterBtn, keywordFilter === filter && styles.keywordFilterBtnActive]}
                      onPress={() => setKeywordFilter(filter)}
                    >
                      <Text style={[styles.keywordFilterText, keywordFilter === filter && styles.keywordFilterTextActive]}>
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
                      <View style={[styles.riskBadge, { 
                        backgroundColor: keyword.risk_category === 'high' ? 'rgba(239, 68, 68, 0.2)' :
                          keyword.risk_category === 'medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'
                      }]}>
                        <Text style={[styles.riskBadgeText, {
                          color: keyword.risk_category === 'high' ? '#EF4444' :
                            keyword.risk_category === 'medium' ? '#F59E0B' : '#10B981'
                        }]}>
                          {keyword.risk_category?.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.keywordFrequency}>
                        Seen {keyword.frequency_score}x
                      </Text>
                    </View>
                    <Text style={styles.keywordText}>"{keyword.keyword}"</Text>
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
                          onPress={() => handleKeywordAction(keyword.keyword_id, 'approve', keyword.risk_category)}
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
                  <Text style={styles.emptyStateSubtext}>
                    Run behavioral analysis to detect patterns
                  </Text>
                </View>
              ) : (
                aiInsights.slice(0, 10).map((insight: any) => (
                  <View key={insight.insight_id} style={[styles.insightCard, {
                    borderLeftColor: insight.severity === 'critical' ? '#EF4444' :
                      insight.severity === 'warning' ? '#F59E0B' : '#6366F1'
                  }]}>
                    <View style={styles.insightHeader}>
                      <Ionicons 
                        name={insight.insight_type === 'university_concern' ? 'school' :
                          insight.insight_type === 'false_positive' ? 'alert-circle' : 'bulb'}
                        size={20}
                        color={insight.severity === 'critical' ? '#EF4444' :
                          insight.severity === 'warning' ? '#F59E0B' : '#6366F1'}
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
              
              {safeguardingAlerts.filter(a => !(a as any).was_true_positive).slice(0, 5).map((alert: any) => (
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
  // University tab styles
  sectionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  universitySelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  universitySelectCardActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  universitySelectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  universitySelectIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  universitySelectText: {
    flex: 1,
  },
  universitySelectName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  universitySelectCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  universitySelectActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  universityAnalyzeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedUniversitySection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  selectedUniversityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedUniversityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  runAnalysisBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  runAnalysisBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  analysisResultCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  analysisScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  analysisScoreLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  analysisScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  analysisSummary: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
    marginBottom: 12,
  },
  analysisConcerns: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  analysisConcernsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 8,
  },
  analysisConcernItem: {
    fontSize: 13,
    color: '#F87171',
    marginBottom: 4,
  },
  studentListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 12,
  },
  studentCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  studentEmail: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  studentStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  studentStatItem: {
    fontSize: 11,
    color: '#6B7280',
  },
  // Safeguarding analysis styles
  alertActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  analyzeStudentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  analyzeStudentText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
  },
  safeguardingUniversitySection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  noUniversitiesText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  universityQuickList: {
    marginBottom: 16,
  },
  universityQuickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  universityQuickInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  universityQuickName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    flex: 1,
  },
  universityQuickCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  analyzeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  analyzeAllButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Subscription Stats Styles
  subscriptionCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
  },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  subscriptionItem: {
    alignItems: 'center',
    flex: 1,
  },
  subscriptionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  subscriptionLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  subscriptionDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  // Section Header Row
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionSubcount: {
    fontSize: 12,
    color: '#6B7280',
  },
  // University Stats Card Styles
  universityStatCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  universityStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  universityStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  universityStatInfo: {
    flex: 1,
  },
  universityStatName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  universityStatTotal: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  universityStatBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  universityStatBarFill: {
    height: '100%',
    borderRadius: 3,
    minWidth: 4,
  },
  universityStatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  universityStatPremium: {
    fontSize: 11,
    color: '#F59E0B',
  },
  universityStatFree: {
    fontSize: 11,
    color: '#6B7280',
  },
  // AI Learning Styles
  aiStatsContainer: {
    marginBottom: 20,
  },
  aiStatRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  aiStatCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  aiStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  aiStatLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 2,
  },
  aiStatSub: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  aiSection: {
    marginBottom: 24,
  },
  aiSectionHeader: {
    marginBottom: 16,
  },
  aiSectionDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  keywordFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  keywordFilterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  keywordFilterBtnActive: {
    backgroundColor: '#6366F1',
  },
  keywordFilterText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  keywordFilterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  keywordCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  keywordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  keywordFrequency: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  keywordText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  keywordContext: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  keywordConfidence: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  keywordActions: {
    flexDirection: 'row',
    gap: 12,
  },
  keywordActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  approveBtn: {
    backgroundColor: '#10B981',
  },
  rejectBtn: {
    backgroundColor: '#EF4444',
  },
  keywordActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  insightCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  insightTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  newBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  insightDesc: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 20,
    marginBottom: 8,
  },
  insightTime: {
    fontSize: 11,
    color: '#6B7280',
  },
  reviewBtn: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 8,
  },
  reviewBtnText: {
    fontSize: 13,
    color: '#818CF8',
    fontWeight: '600',
  },
  feedbackCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  feedbackSource: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  feedbackContent: {
    fontSize: 13,
    color: '#D1D5DB',
    marginBottom: 8,
  },
  feedbackKeywords: {
    fontSize: 11,
    color: '#F59E0B',
    marginBottom: 12,
  },
  feedbackActions: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  truePositiveBtn: {
    backgroundColor: '#10B981',
  },
  falsePositiveBtn: {
    backgroundColor: '#6B7280',
  },
  feedbackBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
