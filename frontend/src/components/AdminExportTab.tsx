/**
 * Export tab — CSV downloads for admins.
 * Feedback History supports per-university filtering.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminStyles as styles } from '../utils/adminStyles';
import { api } from '../services/api';

type ExportType =
  | 'students'
  | 'mood-history'
  | 'feedback-history'
  | 'safeguarding-alerts'
  | 'subscriptions';

type Props = {
  backendUrl: string;
  sessionToken: string | null;
  /** When set (e.g. from university analytics panel), pre-selects that university for feedback export */
  preselectedUniversity?: string;
};

const BASE_EXPORT_ITEMS: Array<{
  type: ExportType;
  title: string;
  desc: string;
  icon: any;
  color: string;
}> = [
  { type: 'students',            title: 'Student Data',        desc: 'Export all student profiles and details',      icon: 'people',   color: '#6366F1' },
  { type: 'mood-history',        title: 'Mood History',         desc: 'Export all mood entries with timestamps',      icon: 'happy',    color: '#10B981' },
  { type: 'feedback-history',    title: 'Feedback History',     desc: 'Export lecture feedback with risk scores',     icon: 'chatbox',  color: '#F59E0B' },
  { type: 'safeguarding-alerts', title: 'Safeguarding Alerts',  desc: 'Export all safeguarding alerts',               icon: 'shield',   color: '#EF4444' },
  { type: 'subscriptions',       title: 'Subscription Data',    desc: 'Export subscription and revenue data',         icon: 'card',     color: '#8B5CF6' },
];

export default function AdminExportTab({ backendUrl, sessionToken, preselectedUniversity }: Props) {
  const [universities, setUniversities] = useState<string[]>([]);
  const [selectedUni, setSelectedUni] = useState<string>(preselectedUniversity ?? 'all');
  const [loadingUnis, setLoadingUnis] = useState(false);
  const [uniPickerOpen, setUniPickerOpen] = useState(false);

  const loadUniversities = useCallback(async () => {
    if (!sessionToken) return;
    setLoadingUnis(true);
    try {
      const data = await api.get('/admin/universities', sessionToken);
      setUniversities((data.universities || []).map((u: any) => u.name));
    } catch {
      // non-fatal — picker just won't show options
    } finally {
      setLoadingUnis(false);
    }
  }, [sessionToken]);

  useEffect(() => {
    loadUniversities();
  }, [loadUniversities]);

  // Keep in sync if parent changes (e.g. navigating between uni panels)
  useEffect(() => {
    if (preselectedUniversity) setSelectedUni(preselectedUniversity);
  }, [preselectedUniversity]);

  const exportData = async (type: ExportType) => {
    let exportUrl = `${backendUrl}/api/admin/export/${type}`;
    if (type === 'feedback-history' && selectedUni !== 'all') {
      exportUrl += `?university=${encodeURIComponent(selectedUni)}`;
    }

    const uniLabel = type === 'feedback-history' && selectedUni !== 'all'
      ? ` for ${selectedUni}`
      : '';
    const label = `${type}${uniLabel}`;

    if (Platform.OS === 'web') {
      const ok = window.confirm(`Download ${label} data as CSV?`);
      if (!ok) return;
      try {
        const response = await fetch(exportUrl, {
          method: 'GET',
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
        if (!response.ok) throw new Error('Export failed');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}${selectedUni !== 'all' && type === 'feedback-history' ? `_${selectedUni.replace(/\s+/g, '_')}` : ''}_export.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        alert('Export downloaded successfully!');
      } catch (err) {
        console.error('Export error:', err);
        alert('Failed to export data. Please try again.');
      }
      return;
    }

    Alert.alert('Export Data', `Download ${label} data as CSV?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Export',
        onPress: async () => {
          try {
            const response = await fetch(exportUrl, { method: 'GET', headers: { Authorization: `Bearer ${sessionToken}` } });
            if (!response.ok) throw new Error('Export failed');
            Linking.openURL(`${exportUrl}${exportUrl.includes('?') ? '&' : '?'}token=${sessionToken}`).catch(() => {
              Alert.alert('Info', 'Export initiated. Check your downloads.');
            });
          } catch {
            Alert.alert('Error', 'Failed to export data. Please try again.');
          }
        },
      },
    ]);
  };

  const selectedUniLabel = selectedUni === 'all' ? 'All Universities' : selectedUni;

  return (
    <View style={styles.content} testID="admin-export-tab">
      <Text style={styles.sectionTitle}>Export Data (CSV)</Text>
      <Text style={styles.exportNote}>
        Download data reports for external analysis. All exports are in CSV format.
      </Text>

      {BASE_EXPORT_ITEMS.map((item) => (
        <View key={item.type}>
          <TouchableOpacity
            style={styles.exportCard}
            onPress={() => exportData(item.type)}
            data-testid={`export-${item.type}`}
          >
            <View style={styles.exportIcon}>
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.exportInfo}>
              <Text style={styles.exportTitle}>{item.title}</Text>
              <Text style={styles.exportDesc}>{item.desc}</Text>
              {item.type === 'feedback-history' && selectedUni !== 'all' && (
                <Text style={[localStyles.uniFilterLabel, { color: item.color }]}>
                  Filtered: {selectedUni}
                </Text>
              )}
            </View>
            <Ionicons name="download-outline" size={24} color={item.color} />
          </TouchableOpacity>

          {/* University filter — only on Feedback History */}
          {item.type === 'feedback-history' && (
            <View style={localStyles.filterRow}>
              <Ionicons name="school-outline" size={14} color="#9CA3AF" />
              <Text style={localStyles.filterLabel}>Filter by university:</Text>
              <TouchableOpacity
                style={localStyles.pickerBtn}
                onPress={() => setUniPickerOpen((o) => !o)}
              >
                <Text style={localStyles.pickerBtnText} numberOfLines={1}>
                  {loadingUnis ? 'Loading…' : selectedUniLabel}
                </Text>
                <Ionicons
                  name={uniPickerOpen ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color="#F59E0B"
                />
              </TouchableOpacity>
            </View>
          )}

          {item.type === 'feedback-history' && uniPickerOpen && (
            <View style={localStyles.dropdown}>
              {loadingUnis ? (
                <ActivityIndicator size="small" color="#F59E0B" style={{ padding: 12 }} />
              ) : (
                <>
                  <TouchableOpacity
                    style={[localStyles.dropdownItem, selectedUni === 'all' && localStyles.dropdownItemActive]}
                    onPress={() => { setSelectedUni('all'); setUniPickerOpen(false); }}
                  >
                    <Ionicons name="globe-outline" size={14} color={selectedUni === 'all' ? '#F59E0B' : '#9CA3AF'} />
                    <Text style={[localStyles.dropdownItemText, selectedUni === 'all' && localStyles.dropdownItemTextActive]}>
                      All Universities
                    </Text>
                    {selectedUni === 'all' && <Ionicons name="checkmark" size={14} color="#F59E0B" />}
                  </TouchableOpacity>
                  {universities.map((uni) => (
                    <TouchableOpacity
                      key={uni}
                      style={[localStyles.dropdownItem, selectedUni === uni && localStyles.dropdownItemActive]}
                      onPress={() => { setSelectedUni(uni); setUniPickerOpen(false); }}
                    >
                      <Ionicons name="school" size={14} color={selectedUni === uni ? '#F59E0B' : '#9CA3AF'} />
                      <Text style={[localStyles.dropdownItemText, selectedUni === uni && localStyles.dropdownItemTextActive]}>
                        {uni}
                      </Text>
                      {selectedUni === uni && <Ionicons name="checkmark" size={14} color="#F59E0B" />}
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const localStyles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: -6,
    marginBottom: 4,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  filterLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    flex: 1,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F59E0B40',
    backgroundColor: '#FFFBEB10',
    maxWidth: 220,
  },
  pickerBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
    flexShrink: 1,
  },
  dropdown: {
    marginHorizontal: 0,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#111827',
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  dropdownItemActive: {
    backgroundColor: '#F59E0B12',
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 13,
    color: '#9CA3AF',
  },
  dropdownItemTextActive: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  uniFilterLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
