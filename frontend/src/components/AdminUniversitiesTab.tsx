/**
 * Universities tab — pick a university, view its student roster, run AI analysis.
 * Extracted from app/(admin)/dashboard.tsx.
 * Self-manages universities list, selected university, students list, and analysis.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { adminStyles as styles } from '../utils/adminStyles';
import { getRiskColor } from '../utils/adminHelpers';

type Props = { sessionToken: string | null };

export default function AdminUniversitiesTab({ sessionToken }: Props) {
  const [universities, setUniversities] = useState<{ name: string; student_count: number }[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [universityStudents, setUniversityStudents] = useState<any[]>([]);
  const [universityAnalysis, setUniversityAnalysis] = useState<any>(null);
  const [isLoadingUniversity, setIsLoadingUniversity] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    setSelectedUniversity(universityName);
    try {
      const data = await api.get(
        `/admin/university/${encodeURIComponent(universityName)}/students`,
        sessionToken,
      );
      setUniversityStudents(data.students || []);
    } catch (err) {
      console.error('Error loading university students:', err);
      Alert.alert('Error', 'Failed to load university students');
    } finally {
      setIsLoadingUniversity(false);
    }
  };

  const runUniversityAnalysis = async (universityName: string) => {
    setIsAnalyzing(true);
    try {
      const data = await api.post(
        `/admin/university/${encodeURIComponent(universityName)}/ai-analysis`,
        {},
      );
      setUniversityAnalysis(data);
      Alert.alert(
        'Analysis Complete',
        `${universityName}\n\nWellbeing Score: ${data.ai_analysis?.overall_wellbeing_score || 'N/A'}/100\nTrend: ${data.ai_analysis?.wellbeing_trend || 'N/A'}`,
      );
    } catch (err) {
      console.error('Error running university analysis:', err);
      Alert.alert('Error', 'Failed to run university analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

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

          {universityAnalysis && universityAnalysis.university === selectedUniversity && (
            <View style={styles.analysisResultCard}>
              <View style={styles.analysisScoreRow}>
                <Text style={styles.analysisScoreLabel}>Wellbeing Score</Text>
                <Text
                  style={[
                    styles.analysisScoreValue,
                    {
                      color:
                        universityAnalysis.ai_analysis?.overall_wellbeing_score >= 60
                          ? '#10B981'
                          : '#EF4444',
                    },
                  ]}
                >
                  {universityAnalysis.ai_analysis?.overall_wellbeing_score || 'N/A'}/100
                </Text>
              </View>
              <Text style={styles.analysisSummary}>
                {universityAnalysis.ai_analysis?.summary || 'No summary available'}
              </Text>
              {universityAnalysis.ai_analysis?.key_concerns?.length > 0 && (
                <View style={styles.analysisConcerns}>
                  <Text style={styles.analysisConcernsTitle}>Key Concerns:</Text>
                  {universityAnalysis.ai_analysis.key_concerns.map(
                    (concern: string, i: number) => (
                      <Text key={i} style={styles.analysisConcernItem}>
                        • {concern}
                      </Text>
                    ),
                  )}
                </View>
              )}
            </View>
          )}

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
                  style={[
                    styles.studentCard,
                    { borderLeftColor: getRiskColor(student.risk_level) },
                  ]}
                >
                  <View style={styles.studentHeader}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <View
                      style={[
                        styles.riskBadge,
                        { backgroundColor: getRiskColor(student.risk_level) + '20' },
                      ]}
                    >
                      <Text
                        style={[styles.riskBadgeText, { color: getRiskColor(student.risk_level) }]}
                      >
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
  );
}
