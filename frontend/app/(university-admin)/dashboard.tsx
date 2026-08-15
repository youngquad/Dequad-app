import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UniversityStats {
  university: string;
  total_students: number;
  active_today: number;
  average_mood: number;
  mood_entries_count: number;
  total_matches: number;
  safeguarding_alerts: number;
  course_breakdown: {course: string; count: number}[];
  subscription_info?: {
    premium_count: number;
    free_count: number;
    conversion_rate: number;
  };
}

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

interface Student {
  user_id: string;
  name: string;
  email: string;
  course?: string;
  average_mood?: number;
  risk_score: number;
  risk_level: string;
  mood_entries_count: number;
  safeguarding_alerts: number;
}

interface MoodTrend {
  date: string;
  average_mood: number;
  entry_count: number;
}

export default function UniversityAdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'safeguarding' | 'trends'>('overview');
  
  // Data states
  const [stats, setStats] = useState<UniversityStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [alerts, setAlerts] = useState<SafeguardingAlert[]>([]);
  const [moodTrends, setMoodTrends] = useState<MoodTrend[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || Constants.expoConfig?.extra?.backendUrl || '';
  
  useEffect(() => {
    loadSession();
  }, []);
  
  useEffect(() => {
    if (sessionToken) {
      loadAllData();
    }
  }, [sessionToken]);
  
  const loadSession = async () => {
    try {
      let token = null;
      let userData = null;
      
      // Try localStorage first for web
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        token = window.localStorage.getItem('session_token');
        const userStr = window.localStorage.getItem('university_admin_user');
        if (userStr) {
          userData = JSON.parse(userStr);
        }
      }
      
      // Fallback to AsyncStorage
      if (!token) {
        token = await AsyncStorage.getItem('session_token');
        const userStr = await AsyncStorage.getItem('university_admin_user');
        if (userStr) {
          userData = JSON.parse(userStr);
        }
      }
      
      if (!token || !userData) {
        router.replace('/(auth)/university-admin-login');
        return;
      }
      
      // Verify this is a university admin
      if (userData.role !== 'university_admin') {
        router.replace('/(auth)/university-admin-login');
        return;
      }
      
      setSessionToken(token);
      setUser(userData);
    } catch (err) {
      console.error('Session load error:', err);
      router.replace('/(auth)/university-admin-login');
    }
  };
  
  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadStats(),
        loadStudents(),
        loadAlerts(),
        loadMoodTrends(),
      ]);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${backendUrl}/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
        ...options.headers,
      },
    });
    
    if (response.status === 401) {
      // Session expired
      handleLogout();
      throw new Error('Session expired');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'API error');
    }
    
    return data;
  };
  
  const loadStats = async () => {
    try {
      const data = await apiCall('/university-admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };
  
  const loadStudents = async () => {
    try {
      const data = await apiCall('/university-admin/students?limit=100');
      setStudents(data.students || []);
    } catch (err) {
      console.error('Error loading students:', err);
    }
  };
  
  const loadAlerts = async () => {
    try {
      const data = await apiCall('/university-admin/safeguarding-alerts');
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error('Error loading alerts:', err);
    }
  };
  
  const loadMoodTrends = async () => {
    try {
      const data = await apiCall('/university-admin/mood-trends');
      setMoodTrends(data.trends || []);
    } catch (err) {
      console.error('Error loading mood trends:', err);
    }
  };
  
  const acknowledgeAlert = async (alertId: string) => {
    try {
      await apiCall(`/university-admin/safeguarding-alerts/${alertId}/acknowledge`, {
        method: 'PUT',
      });
      loadAlerts();
      if (Platform.OS === 'web') {
        window.alert('Alert acknowledged successfully');
      }
    } catch (err: any) {
      console.error('Error acknowledging alert:', err);
      if (Platform.OS === 'web') {
        window.alert('Failed to acknowledge alert');
      }
    }
  };
  
  const exportStudents = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/university-admin/export/students`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      
      if (Platform.OS === 'web') {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${stats?.university || 'university'}_students_export.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export error:', err);
      if (Platform.OS === 'web') {
        window.alert('Failed to export data');
      }
    }
  };
  
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('session_token');
      await AsyncStorage.removeItem('university_admin_user');
      
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.localStorage.removeItem('session_token');
        window.localStorage.removeItem('university_admin_user');
      }
      
      router.replace('/(auth)/university-admin-login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
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
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const highRiskAlerts = alerts.filter(a => a.risk_level === 'high' && !a.acknowledged);
  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="school" size={28} color="#6366F1" />
          <View>
            <Text style={styles.headerTitle}>{user?.university_admin_for || 'University'}</Text>
            <Text style={styles.headerSubtitle}>Admin Dashboard</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} data-testid="uni-admin-logout-btn">
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'overview', icon: 'grid-outline', label: 'Overview' },
          { key: 'students', icon: 'people-outline', label: 'Students' },
          { key: 'safeguarding', icon: 'shield-outline', label: 'Alerts' },
          { key: 'trends', icon: 'trending-up-outline', label: 'Trends' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
            data-testid={`uni-admin-tab-${tab.key}`}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.key ? '#6366F1' : '#9CA3AF'}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
            {tab.key === 'safeguarding' && unacknowledgedCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{unacknowledgedCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <View style={styles.content}>
            {/* Quick Stats */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: '#6366F1' }]}>
                <Text style={styles.statValue}>{stats.total_students}</Text>
                <Text style={styles.statLabel}>Students</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#10B981' }]}>
                <Text style={styles.statValue}>{stats.average_mood?.toFixed(1) || 'N/A'}</Text>
                <Text style={styles.statLabel}>Avg Mood</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.statValue}>{unacknowledgedCount}</Text>
                <Text style={styles.statLabel}>Alerts</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#06B6D4' }]}>
                <Text style={styles.statValue}>{stats.total_matches}</Text>
                <Text style={styles.statLabel}>Connections</Text>
              </View>
            </View>
            
            {/* High Risk Alert Banner */}
            {highRiskAlerts.length > 0 && (
              <TouchableOpacity 
                style={styles.alertBanner}
                onPress={() => setActiveTab('safeguarding')}
              >
                <Ionicons name="warning" size={24} color="#EF4444" />
                <Text style={styles.alertBannerText}>
                  {highRiskAlerts.length} high-risk alert{highRiskAlerts.length > 1 ? 's' : ''} require attention
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#EF4444" />
              </TouchableOpacity>
            )}
            
            {/* Activity Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activity Overview</Text>
              <View style={styles.activityCard}>
                <View style={styles.activityRow}>
                  <View style={styles.activityItem}>
                    <Ionicons name="pulse" size={24} color="#6366F1" />
                    <Text style={styles.activityValue}>{stats.mood_entries_count}</Text>
                    <Text style={styles.activityLabel}>Mood Logs</Text>
                  </View>
                  <View style={styles.activityDivider} />
                  <View style={styles.activityItem}>
                    <Ionicons name="people" size={24} color="#10B981" />
                    <Text style={styles.activityValue}>{stats.active_today}</Text>
                    <Text style={styles.activityLabel}>Active Today</Text>
                  </View>
                  <View style={styles.activityDivider} />
                  <View style={styles.activityItem}>
                    <Ionicons name="heart" size={24} color="#EC4899" />
                    <Text style={styles.activityValue}>{stats.total_matches}</Text>
                    <Text style={styles.activityLabel}>Matches</Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Course Breakdown */}
            {stats.course_breakdown && stats.course_breakdown.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Students by Course</Text>
                {stats.course_breakdown.slice(0, 5).map((course, index) => (
                  <View key={index} style={styles.courseRow}>
                    <View style={styles.courseInfo}>
                      <Ionicons name="book-outline" size={18} color="#6366F1" />
                      <Text style={styles.courseName}>{course.course || 'Unknown'}</Text>
                    </View>
                    <Text style={styles.courseCount}>{course.count}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {/* Export Button */}
            <TouchableOpacity style={styles.exportButton} onPress={exportStudents}>
              <Ionicons name="download-outline" size={20} color="#fff" />
              <Text style={styles.exportButtonText}>Export Student Data</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Students Tab */}
        {activeTab === 'students' && (
          <View style={styles.content}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Students ({students.length})</Text>
              <TouchableOpacity onPress={exportStudents}>
                <Ionicons name="download-outline" size={22} color="#6366F1" />
              </TouchableOpacity>
            </View>
            
            {students.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color="#4B5563" />
                <Text style={styles.emptyStateText}>No students yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Students will appear here when they sign up from your university
                </Text>
              </View>
            ) : (
              students.map((student, index) => (
                <View 
                  key={student.user_id || index}
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
                      <Ionicons name="book-outline" size={14} color="#6B7280" /> {student.course || 'N/A'}
                    </Text>
                    <Text style={styles.studentStatItem}>
                      <Ionicons name="happy-outline" size={14} color="#6B7280" /> Mood: {student.average_mood?.toFixed(1) || 'N/A'}
                    </Text>
                    <Text style={styles.studentStatItem}>
                      <Ionicons name="warning-outline" size={14} color="#6B7280" /> Alerts: {student.safeguarding_alerts}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
        
        {/* Safeguarding Tab */}
        {activeTab === 'safeguarding' && (
          <View style={styles.content}>
            {/* Alert Summary */}
            <View style={styles.alertSummary}>
              <View style={[styles.alertSummaryCard, { borderLeftColor: '#EF4444' }]}>
                <Text style={styles.alertSummaryValue}>{highRiskAlerts.length}</Text>
                <Text style={styles.alertSummaryLabel}>High Risk</Text>
              </View>
              <View style={[styles.alertSummaryCard, { borderLeftColor: '#F59E0B' }]}>
                <Text style={styles.alertSummaryValue}>{unacknowledgedCount}</Text>
                <Text style={styles.alertSummaryLabel}>Pending</Text>
              </View>
              <View style={[styles.alertSummaryCard, { borderLeftColor: '#6366F1' }]}>
                <Text style={styles.alertSummaryValue}>{alerts.length}</Text>
                <Text style={styles.alertSummaryLabel}>Total</Text>
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            
            {alerts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="shield-checkmark" size={48} color="#10B981" />
                <Text style={styles.emptyStateText}>No safeguarding alerts</Text>
                <Text style={styles.emptyStateSubtext}>
                  Your students are doing well!
                </Text>
              </View>
            ) : (
              alerts.map((alert) => (
                <View
                  key={alert.alert_id}
                  style={[styles.alertCard, { borderLeftColor: getRiskColor(alert.risk_level) }]}
                >
                  <View style={styles.alertHeader}>
                    <View>
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
                  
                  <View style={styles.keywordsContainer}>
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
                  
                  {alert.acknowledged && (
                    <View style={styles.acknowledgedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.acknowledgedText}>Acknowledged</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}
        
        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Mood Trends (Last 30 Days)</Text>
            
            {moodTrends.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="trending-up-outline" size={48} color="#4B5563" />
                <Text style={styles.emptyStateText}>No trend data yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Trends will appear as students log their moods
                </Text>
              </View>
            ) : (
              <View style={styles.trendChart}>
                {moodTrends.slice(-14).map((trend, index) => (
                  <View key={index} style={styles.trendBar}>
                    <View
                      style={[
                        styles.trendBarFill,
                        {
                          height: `${(trend.average_mood / 10) * 100}%`,
                          backgroundColor: trend.average_mood >= 7 ? '#10B981' : 
                                         trend.average_mood >= 5 ? '#F59E0B' : '#EF4444',
                        },
                      ]}
                    />
                    <Text style={styles.trendBarLabel}>{trend.date.slice(-2)}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {/* Trend Summary */}
            {moodTrends.length > 0 && (
              <View style={styles.trendSummary}>
                <View style={styles.trendSummaryItem}>
                  <Text style={styles.trendSummaryLabel}>Average Mood</Text>
                  <Text style={styles.trendSummaryValue}>
                    {(moodTrends.reduce((acc, t) => acc + t.average_mood, 0) / moodTrends.length).toFixed(1)}/10
                  </Text>
                </View>
                <View style={styles.trendSummaryItem}>
                  <Text style={styles.trendSummaryLabel}>Total Entries</Text>
                  <Text style={styles.trendSummaryValue}>
                    {moodTrends.reduce((acc, t) => acc + t.entry_count, 0)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
        
        {/* Footer padding */}
        <View style={{ height: 40 }} />
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
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  logoutButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  tabText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#6366F1',
  },
  tabBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    gap: 10,
  },
  alertBannerText: {
    flex: 1,
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  activityCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  activityValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  activityLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  activityDivider: {
    width: 1,
    backgroundColor: '#374151',
  },
  courseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
  },
  courseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  courseName: {
    color: '#E5E7EB',
    fontSize: 14,
    flex: 1,
  },
  courseCount: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    padding: 14,
    borderRadius: 10,
    gap: 8,
    marginTop: 8,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyStateSubtext: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 250,
  },
  studentCard: {
    backgroundColor: '#1F2937',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  studentEmail: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  studentStats: {
    flexDirection: 'row',
    gap: 16,
  },
  studentStatItem: {
    fontSize: 12,
    color: '#6B7280',
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertSummary: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  alertSummaryCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  alertSummaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  alertSummaryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  alertCard: {
    backgroundColor: '#1F2937',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertUserName: {
    fontSize: 15,
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
    fontSize: 11,
    fontWeight: '700',
  },
  alertMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  alertSource: {
    fontSize: 12,
    color: '#6B7280',
  },
  alertDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  keywordTag: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  keywordText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '500',
  },
  alertContent: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 18,
    marginBottom: 10,
  },
  acknowledgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  acknowledgeText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  acknowledgedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.7,
  },
  acknowledgedText: {
    color: '#10B981',
    fontSize: 12,
  },
  trendChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  trendBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  trendBarFill: {
    width: '80%',
    borderRadius: 4,
    minHeight: 4,
  },
  trendBarLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 6,
  },
  trendSummary: {
    flexDirection: 'row',
    gap: 12,
  },
  trendSummaryItem: {
    flex: 1,
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  trendSummaryLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  trendSummaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
});
