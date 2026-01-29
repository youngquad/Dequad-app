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

interface Report {
  id: string;
  reported_user_id: string;
  reporter_id: string;
  reason: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { sessionToken, user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports'>('overview');

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
      const [statsData, reportsData] = await Promise.all([
        api.get('/admin/stats', sessionToken),
        api.get('/admin/reports', sessionToken),
      ]);
      setStats(statsData);
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return '#10B981';
    if (score < 60) return '#F59E0B';
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
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <Ionicons name="people" size={32} color="#6366F1" />
              <Text style={styles.statValue}>{stats?.total_users || 0}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="school" size={32} color="#10B981" />
              <Text style={styles.statValue}>{stats?.total_students || 0}</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="chatbox" size={32} color="#F59E0B" />
              <Text style={styles.statValue}>{stats?.total_feedback || 0}</Text>
              <Text style={styles.statLabel}>Feedbacks</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="heart" size={32} color="#EC4899" />
              <Text style={styles.statValue}>{stats?.total_matches || 0}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
          </View>

          {/* Average Risk Score */}
          <View style={styles.riskOverview}>
            <Text style={styles.sectionTitle}>Platform Health</Text>
            <View style={styles.riskCard}>
              <View style={styles.riskInfo}>
                <Ionicons
                  name="shield-checkmark"
                  size={32}
                  color={getRiskColor(stats?.average_risk_score || 0)}
                />
                <View style={styles.riskDetails}>
                  <Text style={styles.riskLabel}>Average Risk Score</Text>
                  <Text
                    style={[
                      styles.riskValue,
                      { color: getRiskColor(stats?.average_risk_score || 0) },
                    ]}
                  >
                    {stats?.average_risk_score || 0}/100
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.riskBadge,
                  {
                    backgroundColor:
                      getRiskColor(stats?.average_risk_score || 0) + '20',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.riskBadgeText,
                    { color: getRiskColor(stats?.average_risk_score || 0) },
                  ]}
                >
                  {(stats?.average_risk_score || 0) < 30
                    ? 'Low Risk'
                    : (stats?.average_risk_score || 0) < 60
                    ? 'Moderate'
                    : 'High Risk'}
                </Text>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
              onPress={() => setActiveTab('overview')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'overview' && styles.activeTabText,
                ]}
              >
                Risk Scores
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
              onPress={() => setActiveTab('reports')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'reports' && styles.activeTabText,
                ]}
              >
                Reports ({stats?.pending_reports || 0})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'overview' ? (
            <View style={styles.riskScoresSection}>
              <Text style={styles.sectionSubtitle}>Recent Risk Scores</Text>
              {stats?.recent_risk_scores && stats.recent_risk_scores.length > 0 ? (
                stats.recent_risk_scores.map((score, index) => (
                  <View key={index} style={styles.riskScoreItem}>
                    <View style={styles.riskScoreInfo}>
                      <View
                        style={[
                          styles.riskIndicator,
                          { backgroundColor: getRiskColor(score.risk_score) },
                        ]}
                      />
                      <View>
                        <Text style={styles.riskScoreName}>
                          {score.user_name || 'Unknown User'}
                        </Text>
                        <Text style={styles.riskScoreDate}>
                          {formatDate(score.created_at)}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.riskScoreBadge,
                        { backgroundColor: getRiskColor(score.risk_score) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.riskScoreValue,
                          { color: getRiskColor(score.risk_score) },
                        ]}
                      >
                        {score.risk_score}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="analytics-outline" size={48} color="#4B5563" />
                  <Text style={styles.emptyText}>No risk scores yet</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.reportsSection}>
              <Text style={styles.sectionSubtitle}>User Reports</Text>
              {reports.length > 0 ? (
                reports.map((report) => (
                  <View key={report.id} style={styles.reportItem}>
                    <View style={styles.reportHeader}>
                      <Ionicons name="flag" size={20} color="#EF4444" />
                      <Text style={styles.reportDate}>
                        {formatDate(report.created_at)}
                      </Text>
                    </View>
                    <Text style={styles.reportReason}>{report.reason}</Text>
                    <View
                      style={[
                        styles.reportStatus,
                        {
                          backgroundColor:
                            report.status === 'pending'
                              ? 'rgba(245, 158, 11, 0.2)'
                              : 'rgba(16, 185, 129, 0.2)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.reportStatusText,
                          {
                            color:
                              report.status === 'pending' ? '#F59E0B' : '#10B981',
                          },
                        ]}
                      >
                        {report.status.charAt(0).toUpperCase() +
                          report.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                  <Text style={styles.emptyText}>No reports to review</Text>
                </View>
              )}
            </View>
          )}

          {/* Back to App Button */}
          <TouchableOpacity
            style={styles.backToAppButton}
            onPress={() => router.push('/(main)/mood')}
          >
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statCardPrimary: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  riskOverview: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  riskCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskDetails: {
    marginLeft: 12,
  },
  riskLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  riskValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  riskBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#6366F1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: '#fff',
  },
  riskScoresSection: {
    marginBottom: 24,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 12,
  },
  riskScoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  riskScoreInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskIndicator: {
    width: 8,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  riskScoreName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  riskScoreDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  riskScoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  riskScoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reportsSection: {
    marginBottom: 24,
  },
  reportItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reportDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  reportReason: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
  },
  reportStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reportStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  backToAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 32,
  },
  backToAppText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
