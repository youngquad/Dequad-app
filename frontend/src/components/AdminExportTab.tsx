/**
 * Export tab — CSV downloads for admins.
 * Extracted from app/(admin)/dashboard.tsx as part of the 2769→~800 line refactor.
 */
import React from 'react';
import { View, Text, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminStyles as styles } from '../utils/adminStyles';

type ExportType =
  | 'students'
  | 'mood-history'
  | 'feedback-history'
  | 'safeguarding-alerts'
  | 'subscriptions';

type Props = {
  backendUrl: string;
  sessionToken: string | null;
};

const EXPORT_ITEMS: Array<{
  type: ExportType;
  title: string;
  desc: string;
  icon: any;
  color: string;
}> = [
  { type: 'students', title: 'Student Data', desc: 'Export all student profiles and details', icon: 'people', color: '#6366F1' },
  { type: 'mood-history', title: 'Mood History', desc: 'Export all mood entries with timestamps', icon: 'happy', color: '#10B981' },
  { type: 'feedback-history', title: 'Feedback History', desc: 'Export lecture feedback with risk scores', icon: 'chatbox', color: '#F59E0B' },
  { type: 'safeguarding-alerts', title: 'Safeguarding Alerts', desc: 'Export all safeguarding alerts', icon: 'shield', color: '#EF4444' },
  { type: 'subscriptions', title: 'Subscription Data', desc: 'Export subscription and revenue data', icon: 'card', color: '#8B5CF6' },
];

export default function AdminExportTab({ backendUrl, sessionToken }: Props) {
  const exportData = async (type: ExportType) => {
    const exportUrl = `${backendUrl}/api/admin/export/${type}`;

    if (Platform.OS === 'web') {
      const confirmExport = window.confirm(`This will download ${type} data as CSV. Continue?`);
      if (!confirmExport) return;
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
        a.download = `${type}_export.csv`;
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

    // Native
    Alert.alert('Export Data', `This will download ${type} data as CSV. Continue?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Export',
        onPress: async () => {
          try {
            const response = await fetch(exportUrl, {
              method: 'GET',
              headers: { Authorization: `Bearer ${sessionToken}` },
            });
            if (!response.ok) throw new Error('Export failed');
            Linking.openURL(`${exportUrl}?token=${sessionToken}`).catch(() => {
              Alert.alert('Info', 'Export initiated. Check your downloads.');
            });
          } catch {
            Alert.alert('Error', 'Failed to export data. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.content} testID="admin-export-tab">
      <Text style={styles.sectionTitle}>Export Data (CSV)</Text>
      <Text style={styles.exportNote}>
        Download data reports for external analysis. All exports are in CSV format.
      </Text>

      {EXPORT_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.type}
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
          </View>
          <Ionicons name="download-outline" size={24} color={item.color} />
        </TouchableOpacity>
      ))}
    </View>
  );
}
