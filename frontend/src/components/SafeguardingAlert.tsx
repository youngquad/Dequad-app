import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CrisisResource {
  name: string;
  phone: string;
  description: string;
  available: string;
}

interface SafeguardingAlertData {
  flagged: boolean;
  risk_level: string;
  resources: {
    samaritans: CrisisResource;
    nhs_111: CrisisResource;
    emergency: CrisisResource;
    shout: CrisisResource;
  };
  message: string;
}

interface SafeguardingAlertProps {
  visible: boolean;
  onClose: () => void;
  alertData?: SafeguardingAlertData;
}

export default function SafeguardingAlert({ visible, onClose, alertData }: SafeguardingAlertProps) {
  if (!alertData || !alertData.flagged) return null;

  const handleCall = (phone: string) => {
    const phoneUrl = `tel:${phone.replace(/\s/g, '')}`;
    Linking.canOpenURL(phoneUrl).then(supported => {
      if (supported) {
        Linking.openURL(phoneUrl);
      }
    });
  };

  const handleText = (number: string) => {
    const smsUrl = `sms:${number}`;
    Linking.canOpenURL(smsUrl).then(supported => {
      if (supported) {
        Linking.openURL(smsUrl);
      }
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="heart" size={40} color="#EC4899" />
              </View>
              <Text style={styles.title}>We're Here For You</Text>
              <Text style={styles.subtitle}>
                {alertData.message || "We noticed you may be going through a difficult time. Please know that support is available."}
              </Text>
            </View>

            {/* Crisis Resources */}
            <View style={styles.resourcesSection}>
              <Text style={styles.sectionTitle}>Get Support Now</Text>
              
              {/* Samaritans */}
              {alertData.resources?.samaritans && (
                <TouchableOpacity 
                  style={styles.resourceCard}
                  onPress={() => handleCall(alertData.resources.samaritans.phone)}
                >
                  <View style={styles.resourceIcon}>
                    <Ionicons name="call" size={24} color="#10B981" />
                  </View>
                  <View style={styles.resourceContent}>
                    <Text style={styles.resourceName}>{alertData.resources.samaritans.name}</Text>
                    <Text style={styles.resourcePhone}>{alertData.resources.samaritans.phone}</Text>
                    <Text style={styles.resourceDesc}>{alertData.resources.samaritans.description}</Text>
                    <Text style={styles.resourceAvailable}>{alertData.resources.samaritans.available}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#6B7280" />
                </TouchableOpacity>
              )}

              {/* NHS 111 */}
              {alertData.resources?.nhs_111 && (
                <TouchableOpacity 
                  style={styles.resourceCard}
                  onPress={() => handleCall(alertData.resources.nhs_111.phone)}
                >
                  <View style={[styles.resourceIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                    <Ionicons name="medkit" size={24} color="#3B82F6" />
                  </View>
                  <View style={styles.resourceContent}>
                    <Text style={styles.resourceName}>{alertData.resources.nhs_111.name}</Text>
                    <Text style={styles.resourcePhone}>{alertData.resources.nhs_111.phone}</Text>
                    <Text style={styles.resourceDesc}>{alertData.resources.nhs_111.description}</Text>
                    <Text style={styles.resourceAvailable}>{alertData.resources.nhs_111.available}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#6B7280" />
                </TouchableOpacity>
              )}

              {/* Shout Text Line */}
              {alertData.resources?.shout && (
                <TouchableOpacity 
                  style={styles.resourceCard}
                  onPress={() => handleText('85258')}
                >
                  <View style={[styles.resourceIcon, { backgroundColor: 'rgba(168, 85, 247, 0.2)' }]}>
                    <Ionicons name="chatbubble-ellipses" size={24} color="#A855F7" />
                  </View>
                  <View style={styles.resourceContent}>
                    <Text style={styles.resourceName}>{alertData.resources.shout.name}</Text>
                    <Text style={styles.resourcePhone}>{alertData.resources.shout.phone}</Text>
                    <Text style={styles.resourceDesc}>{alertData.resources.shout.description}</Text>
                    <Text style={styles.resourceAvailable}>{alertData.resources.shout.available}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#6B7280" />
                </TouchableOpacity>
              )}

              {/* Emergency 999 */}
              {alertData.resources?.emergency && (
                <TouchableOpacity 
                  style={[styles.resourceCard, styles.emergencyCard]}
                  onPress={() => handleCall(alertData.resources.emergency.phone)}
                >
                  <View style={[styles.resourceIcon, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                    <Ionicons name="warning" size={24} color="#EF4444" />
                  </View>
                  <View style={styles.resourceContent}>
                    <Text style={[styles.resourceName, { color: '#EF4444' }]}>{alertData.resources.emergency.name}</Text>
                    <Text style={[styles.resourcePhone, { color: '#EF4444' }]}>{alertData.resources.emergency.phone}</Text>
                    <Text style={styles.resourceDesc}>{alertData.resources.emergency.description}</Text>
                    <Text style={styles.resourceAvailable}>{alertData.resources.emergency.available}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>

            {/* Encouragement Message */}
            <View style={styles.encouragementSection}>
              <Text style={styles.encouragementText}>
                You don't have to face this alone. Reaching out for help is a sign of strength, not weakness. These services are free, confidential, and available whenever you need them.
              </Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>I Understand</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1F2937',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxHeight: '90%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
  resourcesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 12,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  emergencyCard: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceContent: {
    flex: 1,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resourcePhone: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginVertical: 2,
  },
  resourceDesc: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  resourceAvailable: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  encouragementSection: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  encouragementText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 22,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
