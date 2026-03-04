import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const API_URL = process.env.REACT_APP_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function UniversityAdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'safeguarding' | 'mood' | 'export'>('overview');
  
  // Data states
  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [moodTrends, setMoodTrends] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      let token = await AsyncStorage.getItem('uni_admin_token');
      if (!token && Platform.OS === 'web') {
        token = localStorage.getItem('uni_admin_token');
      }
      
      if (token) {
        setSessionToken(token);
        await loadUserData(token);
        await loadAllData(token);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsLoading(false);
    }
  };

  const loadUserData = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadAllData = async (token: string) => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadStats(token),
        loadStudents(token),
        loadAlerts(token),
        loadMoodTrends(token),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const loadStats = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/university-admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadStudents = async (token: string, search: string = '') => {
    try {
      const url = search 
        ? `${API_URL}/api/university-admin/students?search=${encodeURIComponent(search)}`
        : `${API_URL}/api/university-admin/students`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadAlerts = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/university-admin/safeguarding-alerts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAlerts(data || []);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const loadMoodTrends = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/university-admin/mood-trends`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMoodTrends(data.trends || []);
      }
    } catch (error) {
      console.error('Error loading mood trends:', error);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    if (!sessionToken) return;
    try {
      const response = await fetch(`${API_URL}/api/university-admin/safeguarding-alerts/${alertId}/acknowledge`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });
      if (response.ok) {
        loadAlerts(sessionToken);
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const exportData = async () => {
    if (!sessionToken) return;
    
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Download student data as CSV?');
      if (confirmed) {
        try {
          const response = await fetch(`${API_URL}/api/university-admin/export/students`, {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
          });
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'university_students.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        } catch (error) {
          alert('Export failed');
        }
      }
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('uni_admin_token');
    if (Platform.OS === 'web') {
      localStorage.removeItem('uni_admin_token');
      window.location.href = '/university-admin/login';
    }
    setSessionToken(null);
    setUser(null);
  };

  const handleSearch = () => {
    if (sessionToken) {
      loadStudents(sessionToken, searchQuery);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (sessionToken) {
      loadAllData(sessionToken);
    }
  };

  // Login Screen
  if (!sessionToken) {
    return <UniversityAdminLogin onLogin={(token, userData) => {
      setSessionToken(token);
      setUser(userData);
      loadAllData(token);
    }} />;
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B9BD5" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>University Admin</Text>
          <Text style={styles.universityName}>{stats?.university || 'Loading...'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['overview', 'students', 'safeguarding', 'mood', 'export'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Ionicons
              name={
                tab === 'overview' ? 'grid-outline' :
                tab === 'students' ? 'people-outline' :
                tab === 'safeguarding' ? 'shield-outline' :
                tab === 'mood' ? 'happy-outline' : 'download-outline'
              }
              size={18}
              color={activeTab === tab ? '#5B9BD5' : '#9CA3AF'}
            />
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5B9BD5" />
        }
      >
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <View>
            <Text style={styles.sectionTitle}>Dashboard Overview</Text>
            
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: '#5B9BD5' }]}>
                <Ionicons name="people" size={28} color="#fff" />
                <Text style={styles.statValue}>{stats.total_students}</Text>
                <Text style={styles.statLabel}>Total Students</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#10B981' }]}>
                <Ionicons name="diamond" size={28} color="#fff" />
                <Text style={styles.statValue}>{stats.premium_students}</Text>
                <Text style={styles.statLabel}>Premium</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#F59E0B' }]}>
                <Ionicons name="happy" size={28} color="#fff" />
                <Text style={styles.statValue}>{stats.average_mood}/10</Text>
                <Text style={styles.statLabel}>Avg Mood</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#EF4444' }]}>
                <Ionicons name="warning" size={28} color="#fff" />
                <Text style={styles.statValue}>{stats.unacknowledged_alerts}</Text>
                <Text style={styles.statLabel}>Alerts</Text>
              </View>
            </View>

            {/* Detailed Stats */}
            <View style={styles.detailCard}>
              <Text style={styles.detailCardTitle}>Student Metrics</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Conversion Rate</Text>
                <Text style={styles.detailValue}>{stats.conversion_rate}%</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Mood Entries</Text>
                <Text style={styles.detailValue}>{stats.total_mood_entries}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Successful Matches</Text>
                <Text style={styles.detailValue}>{stats.matches_count}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Feedback Submissions</Text>
                <Text style={styles.detailValue}>{stats.feedback_count}</Text>
              </View>
            </View>

            {/* Courses */}
            {stats.courses && stats.courses.length > 0 && (
              <View style={styles.detailCard}>
                <Text style={styles.detailCardTitle}>Top Courses</Text>
                {stats.courses.slice(0, 5).map((course: any, index: number) => (
                  <View key={index} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{course.course}</Text>
                    <Text style={styles.detailValue}>{course.count} students</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <View>
            <Text style={styles.sectionTitle}>Student Directory</Text>
            
            {/* Search */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, email, or course..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Ionicons name="search" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Student List */}
            {students.map((student, index) => (
              <View key={index} style={styles.studentCard}>
                <View style={styles.studentAvatar}>
                  <Text style={styles.studentInitials}>
                    {student.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </Text>
                </View>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentEmail}>{student.email}</Text>
                  <Text style={styles.studentCourse}>{student.course || 'No course'}</Text>
                </View>
                <View style={[styles.planBadge, student.plan === 'premium' && styles.premiumBadge]}>
                  <Text style={styles.planText}>{student.plan || 'free'}</Text>
                </View>
              </View>
            ))}

            {students.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color="#6B7280" />
                <Text style={styles.emptyText}>No students found</Text>
              </View>
            )}
          </View>
        )}

        {/* Safeguarding Tab */}
        {activeTab === 'safeguarding' && (
          <View>
            <Text style={styles.sectionTitle}>Safeguarding Alerts</Text>
            <Text style={styles.sectionSubtitle}>
              {alerts.filter(a => !a.acknowledged).length} unacknowledged alerts
            </Text>

            {alerts.map((alert, index) => (
              <View key={index} style={[styles.alertCard, !alert.acknowledged && styles.alertUnacknowledged]}>
                <View style={styles.alertHeader}>
                  <View style={[styles.riskBadge, alert.risk_level === 'high' && styles.highRisk]}>
                    <Text style={styles.riskText}>{alert.risk_level}</Text>
                  </View>
                  <Text style={styles.alertTime}>
                    {new Date(alert.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.alertUserName}>{alert.user_name}</Text>
                <Text style={styles.alertContent} numberOfLines={3}>{alert.content}</Text>
                <Text style={styles.alertKeywords}>
                  Keywords: {alert.matched_keywords?.join(', ')}
                </Text>
                {!alert.acknowledged && (
                  <TouchableOpacity 
                    style={styles.acknowledgeButton}
                    onPress={() => acknowledgeAlert(alert.alert_id)}
                  >
                    <Text style={styles.acknowledgeText}>Acknowledge</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {alerts.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="shield-checkmark" size={48} color="#10B981" />
                <Text style={styles.emptyText}>No safeguarding alerts</Text>
              </View>
            )}
          </View>
        )}

        {/* Mood Tab */}
        {activeTab === 'mood' && (
          <View>
            <Text style={styles.sectionTitle}>Mood Trends</Text>
            <Text style={styles.sectionSubtitle}>Last 30 days</Text>

            {moodTrends.length > 0 ? (
              <View style={styles.detailCard}>
                <Text style={styles.detailCardTitle}>Daily Average Mood</Text>
                <View style={styles.moodChart}>
                  {moodTrends.slice(-14).map((day, index) => (
                    <View key={index} style={styles.moodBar}>
                      <View 
                        style={[
                          styles.moodBarFill,
                          { 
                            height: Math.max(day.avg_mood * 10, 5),
                            backgroundColor: day.avg_mood >= 7 ? '#10B981' : day.avg_mood >= 4 ? '#F59E0B' : '#EF4444'
                          }
                        ]}
                      />
                      <Text style={styles.moodBarLabel}>{day.date.slice(5)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="analytics-outline" size={48} color="#6B7280" />
                <Text style={styles.emptyText}>No mood data available</Text>
              </View>
            )}
          </View>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <View>
            <Text style={styles.sectionTitle}>Export Data</Text>
            <Text style={styles.sectionSubtitle}>Download your university's data</Text>

            <TouchableOpacity style={styles.exportCard} onPress={exportData}>
              <View style={styles.exportIcon}>
                <Ionicons name="people" size={24} color="#5B9BD5" />
              </View>
              <View style={styles.exportInfo}>
                <Text style={styles.exportTitle}>Student Data</Text>
                <Text style={styles.exportDesc}>Export all student information</Text>
              </View>
              <Ionicons name="download-outline" size={24} color="#5B9BD5" />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// University Admin Login Component
function UniversityAdminLogin({ onLogin }: { onLogin: (token: string, user: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/university-admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.session_token) {
        await AsyncStorage.setItem('uni_admin_token', data.session_token);
        if (Platform.OS === 'web') {
          localStorage.setItem('uni_admin_token', data.session_token);
        }
        onLogin(data.session_token, data.user);
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (error) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.loginContainer}>
      <View style={styles.loginContent}>
        <View style={styles.loginHeader}>
          <Ionicons name="school" size={64} color="#5B9BD5" />
          <Text style={styles.loginTitle}>University Admin</Text>
          <Text style={styles.loginSubtitle}>Sign in to your dashboard</Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  welcomeText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  universityName: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
  },
  logoutButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 4,
  },
  activeTab: {
    backgroundColor: 'rgba(91, 155, 213, 0.2)',
  },
  tabText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#5B9BD5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  detailCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  detailCardTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  detailLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  detailValue: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#F8FAFC',
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: '#5B9BD5',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5B9BD5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentInitials: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  studentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  studentName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  studentEmail: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  studentCourse: {
    color: '#5B9BD5',
    fontSize: 12,
  },
  planBadge: {
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  premiumBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
  },
  planText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6B7280',
    marginTop: 12,
    fontSize: 14,
  },
  alertCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  alertUnacknowledged: {
    borderLeftColor: '#EF4444',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  riskBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  highRisk: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  riskText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  alertTime: {
    color: '#6B7280',
    fontSize: 12,
  },
  alertUserName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  alertContent: {
    color: '#9CA3AF',
    fontSize: 13,
    marginBottom: 8,
  },
  alertKeywords: {
    color: '#5B9BD5',
    fontSize: 11,
    marginBottom: 12,
  },
  acknowledgeButton: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  acknowledgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  moodChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
    marginTop: 12,
  },
  moodBar: {
    alignItems: 'center',
    flex: 1,
  },
  moodBarFill: {
    width: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
  moodBarLabel: {
    color: '#6B7280',
    fontSize: 9,
  },
  exportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exportIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(91, 155, 213, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exportInfo: {
    flex: 1,
  },
  exportTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  exportDesc: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  // Login Styles
  loginContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loginContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loginTitle: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
  },
  loginSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 8,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#F8FAFC',
    fontSize: 15,
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: '#5B9BD5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
