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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/services/api';
import AdminSupportInbox from '../../src/components/AdminSupportInbox';
import { AdminVerificationQueue } from '../../src/components/AdminVerificationQueue';
import { AdminGrowthAnalytics } from '../../src/components/AdminGrowthAnalytics';
import AdminSubscriptionsTab from '../../src/components/AdminSubscriptionsTab';
import AdminUniversitiesTab from '../../src/components/AdminUniversitiesTab';
import AdminAILearningTab from '../../src/components/AdminAILearningTab';
import AdminExportTab from '../../src/components/AdminExportTab';
import { adminStyles as styles } from '../../src/utils/adminStyles';
import AdminInviteManager from '../../src/components/AdminInviteManager';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'safeguarding' | 'verifications' | 'support' | 'analytics' | 'subscriptions' | 'universities' | 'ai-learning' | 'export'>('overview');
  const [supportUnread, setSupportUnread] = useState<number>(0);
  const [safeUnread, setSafeUnread] = useState<{ unread: number; high_risk: number }>({ unread: 0, high_risk: 0 });
  const [verifyUnread, setVerifyUnread] = useState<number>(0);
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

  // Kept at parent level because the Safeguarding tab embeds a per-university
  // AI-analysis quick widget (`Analyze by University` section). The dedicated
  // Universities tab (`AdminUniversitiesTab`) fetches its own independent copy.
  const [universities, setUniversities] = useState<{ name: string; student_count: number }[]>([]);

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
      const data = await api.get('/admin/universities', sessionToken);
      setUniversities(data.universities || []);
    } catch (error) {
      console.error('Error loading universities list:', error);
    }
  };

  const runUniversityAnalysis = async (universityName: string) => {
    setIsAnalyzing(true);
    try {
      const data = await api.post(`/admin/university/${encodeURIComponent(universityName)}/ai-analysis`, {});
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







  // Poll the support inbox unread counter (so the nav badge updates even when
  // the admin isn't on the Support tab — quick replies matter on wellbeing apps).
  useEffect(() => {
    if (!sessionToken) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        const [s, sg, vq] = await Promise.all([
          api.get('/support/admin/unread-count', sessionToken).catch(() => null),
          api.get('/admin/safeguarding-alerts/unread-count', sessionToken).catch(() => null),
          api.get('/admin/pending-verifications', sessionToken).catch(() => null),
        ]);
        if (cancelled) return;
        if (s) setSupportUnread(s.unread ?? 0);
        if (sg) setSafeUnread({ unread: sg.unread ?? 0, high_risk: sg.high_risk ?? 0 });
        if (vq) setVerifyUnread(vq.count ?? 0);
      } catch (e) {
        // silent — non-critical
      }
    };
    refresh();
    const id = setInterval(refresh, 20_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [sessionToken]);

  // Optimistically clear badges when admin opens the relevant tab.
  useEffect(() => {
    if (activeTab === 'support') setSupportUnread(0);
    if (activeTab === 'safeguarding') setSafeUnread({ unread: 0, high_risk: 0 });
  }, [activeTab]);

  const exportData = async (type: string) => {
    const exportUrl = `${backendUrl}/api/admin/export/${type}`;
    
    // For web, we need to handle the download differently with authentication
    if (Platform.OS === 'web') {
      const confirmExport = window.confirm(`This will download ${type} data as CSV. Continue?`);
      if (confirmExport) {
        try {
          // Fetch with auth header
          const response = await fetch(exportUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${sessionToken}`,
            },
          });
          
          if (!response.ok) {
            throw new Error('Export failed');
          }
          
          // Get the CSV content
          const blob = await response.blob();
          
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${type}_export.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          
          alert('Export downloaded successfully!');
        } catch (error) {
          console.error('Export error:', error);
          alert('Failed to export data. Please try again.');
        }
      }
      return;
    }
    
    // Native platforms
    Alert.alert(
      'Export Data',
      `This will download ${type} data as CSV. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: async () => {
            try {
              // For native, we need to use a different approach
              const response = await fetch(exportUrl, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${sessionToken}`,
                },
              });
              
              if (!response.ok) {
                throw new Error('Export failed');
              }
              
              // Try to open URL with auth token in query
              Linking.openURL(`${exportUrl}?token=${sessionToken}`).catch(() => {
                Alert.alert('Info', 'Export initiated. Check your downloads.');
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to export data. Please try again.');
            }
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
          <Text style={styles.headerSubtitle}>DEQUAD Analytics</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton} data-testid="logout-button">
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['overview', 'safeguarding', 'verifications', 'support', 'subscriptions', 'ai-learning', 'team', 'universities', 'analytics', 'export'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <View style={{ position: 'relative' }}>
              <Ionicons
                name={
                  tab === 'overview' ? 'grid-outline' :
                  tab === 'safeguarding' ? 'shield-outline' :
                  tab === 'verifications' ? 'shield-checkmark-outline' :
                  tab === 'support' ? 'chatbubbles-outline' :
                  tab === 'subscriptions' ? 'card-outline' :
                  tab === 'ai-learning' ? 'bulb-outline' :
                  tab === 'team' ? 'people-outline' :
                  tab === 'universities' ? 'school-outline' :
                  tab === 'analytics' ? 'bar-chart-outline' : 'download-outline'
                }
                size={18}
                color={activeTab === tab ? '#6366F1' : '#9CA3AF'}
              />
              {tab === 'support' && supportUnread > 0 && (
                <View style={styles.tabBadge} data-testid="support-tab-badge">
                  <Text style={styles.tabBadgeText}>
                    {supportUnread > 9 ? '9+' : supportUnread}
                  </Text>
                </View>
              )}
              {tab === 'safeguarding' && safeUnread.unread > 0 && (
                <View
                  style={[
                    styles.tabBadge,
                    safeUnread.high_risk > 0 ? styles.tabBadgeCritical : styles.tabBadgeWarn,
                  ]}
                  data-testid="safeguarding-tab-badge"
                >
                  <Text style={styles.tabBadgeText}>
                    {safeUnread.unread > 9 ? '9+' : safeUnread.unread}
                  </Text>
                </View>
              )}
              {tab === 'verifications' && verifyUnread > 0 && (
                <View style={styles.tabBadge} data-testid="verifications-tab-badge">
                  <Text style={styles.tabBadgeText}>
                    {verifyUnread > 9 ? '9+' : verifyUnread}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'universities' ? 'Unis' :
               tab === 'ai-learning' ? 'AI' :
               tab === 'safeguarding' ? 'Safe' :
               tab === 'verifications' ? 'Verify' :
               tab === 'subscriptions' ? 'Subs' :
               tab === 'team' ? 'Team' :
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

        {/* Support Inbox Tab */}
        {activeTab === 'support' && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Support Inbox</Text>
            <Text style={styles.sectionSubtitle}>
              Reply to student support conversations as a human agent. Students get a push + email notification when you respond.
            </Text>
            <View style={{ marginTop: 12 }}>
              <AdminSupportInbox sessionToken={sessionToken} />
            </View>
          </View>
        )}

        {/* Pending Verifications Tab */}
        {activeTab === 'verifications' && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Pending Student Verification</Text>
            <Text style={styles.sectionSubtitle}>
              UK universities share the same `.ac.uk` domain for students and staff. These accounts self-declared they are students at signup — review and verify or remove anyone who looks like staff/alumni.
            </Text>
            <View style={{ marginTop: 12 }}>
              <AdminVerificationQueue sessionToken={sessionToken} />
            </View>
          </View>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'team' && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Team & Admin Invitations</Text>
            <Text style={styles.sectionSubtitle}>
              Invite new DEQUAD admins by email. Each invitation creates a one-time secure link that expires in 7 days. Recipients set their own password and become admins on this instance.
            </Text>
            <AdminInviteManager
              sessionToken={sessionToken}
              apiBaseUrl={process.env.REACT_APP_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || ''}
            />
          </View>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <AdminSubscriptionsTab
            sessionToken={sessionToken}
            onExport={() => exportData('subscriptions')}
          />
        )}

        {/* Universities Tab */}
        {activeTab === 'universities' && (
          <AdminUniversitiesTab sessionToken={sessionToken} />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <View style={styles.content}>
            {/* Deck-worthy growth metrics — DAU / retention / mood-completion. */}
            <AdminGrowthAnalytics sessionToken={sessionToken} />

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
          <AdminAILearningTab
            sessionToken={sessionToken}
            safeguardingAlerts={safeguardingAlerts}
          />
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <AdminExportTab backendUrl={backendUrl} sessionToken={sessionToken} />
        )}

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

