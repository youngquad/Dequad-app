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
import { LinearGradient } from 'expo-linear-gradient';

interface CrisisResource {
  name: string;
  phone: string;
  description: string;
  available: string;
  website?: string;
}

interface SafeguardingAlertData {
  flagged: boolean;
  risk_level: string;
  resources: Record<string, CrisisResource>;
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
    // Handle special case for text services
    if (phone.toLowerCase().includes('text')) {
      return;
    }
    const phoneUrl = `tel:${phone.replace(/\s/g, '')}`;
    Linking.canOpenURL(phoneUrl).then(supported => {
      if (supported) {
        Linking.openURL(phoneUrl);
      }
    });
  };

  const handleText = () => {
    const smsUrl = `sms:85258&body=SHOUT`;
    Linking.canOpenURL(smsUrl).then(supported => {
      if (supported) {
        Linking.openURL(smsUrl);
      }
    });
  };

  const handleWebsite = (url?: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const isHighRisk = alertData.risk_level === 'high' || alertData.risk_level === 'critical';

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
              <LinearGradient
                colors={['rgba(236, 72, 153, 0.3)', 'rgba(236, 72, 153, 0.1)']}
                style={styles.iconContainer}
              >
                <Ionicons name="heart" size={44} color="#EC4899" />
              </LinearGradient>
              <Text style={styles.title}>We're Here For You</Text>
              <Text style={styles.subtitle}>
                We noticed you may be going through a difficult time. Please know that support is available, and you don't have to face this alone.
              </Text>
            </View>

            {/* Urgent Banner for High Risk */}
            {isHighRisk && (
              <View style={styles.urgentBanner}>
                <Ionicons name="alert-circle" size={20} color="#fff" />
                <Text style={styles.urgentText}>
                  If you're in immediate danger, please call 999 or go to your nearest A&E
                </Text>
              </View>
            )}

            {/* Crisis Resources */}
            <View style={styles.resourcesSection}>
              <Text style={styles.sectionTitle}>💚 Get Support Now</Text>
              
              {/* Samaritans - Priority */}
              {alertData.resources?.samaritans && (
                <TouchableOpacity 
                  style={[styles.resourceCard, styles.priorityCard]}
                  onPress={() => handleCall(alertData.resources.samaritans.phone)}
                >
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.05)']}
                    style={styles.resourceIconBg}
                  >
                    <Ionicons name="call" size={26} color="#10B981" />
                  </LinearGradient>
                  <View style={styles.resourceContent}>
                    <Text style={styles.resourceName}>{alertData.resources.samaritans.name}</Text>
                    <Text style={[styles.resourcePhone, { color: '#10B981' }]}>{alertData.resources.samaritans.phone}</Text>
                    <Text style={styles.resourceDesc}>{alertData.resources.samaritans.description}</Text>
                    <Text style={styles.resourceAvailable}>🕐 {alertData.resources.samaritans.available}</Text>
                  </View>
                  <View style={styles.callBadge}>
                    <Ionicons name="call" size={16} color="#fff" />
                    <Text style={styles.callBadgeText}>Call</Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Shout Text Line - Great for students who prefer texting */}
              {alertData.resources?.shout && (
                <TouchableOpacity 
                  style={styles.resourceCard}
                  onPress={handleText}
                >
                  <View style={[styles.resourceIconBg, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                    <Ionicons name="chatbubble-ellipses" size={24} color="#A855F7" />
                  </View>
                  <View style={styles.resourceContent}>
                    <Text style={styles.resourceName}>{alertData.resources.shout.name}</Text>
                    <Text style={[styles.resourcePhone, { color: '#A855F7' }]}>{alertData.resources.shout.phone}</Text>
                    <Text style={styles.resourceDesc}>{alertData.resources.shout.description}</Text>
                    <Text style={styles.resourceAvailable}>🕐 {alertData.resources.shout.available}</Text>
                  </View>
                  <View style={[styles.callBadge, { backgroundColor: '#A855F7' }]}>
                    <Ionicons name="chatbubble" size={16} color="#fff" />
                    <Text style={styles.callBadgeText}>Text</Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* PAPYRUS - Specifically for young people */}
              {alertData.resources?.papyrus && (
                <TouchableOpacity 
                  style={styles.resourceCard}
                  onPress={() => handleCall(alertData.resources.papyrus.phone)}
                >
                  <View style={[styles.resourceIconBg, { backgroundColor: 'rgba(251, 191, 36, 0.15)' }]}>
                    <Ionicons name="people" size={24} color="#FBBF24" />
                  </View>
                  <View style={styles.resourceContent}>
                    <Text style={styles.resourceName}>{alertData.resources.papyrus.name}</Text>
                    <Text style={[styles.resourcePhone, { color: '#FBBF24' }]}>{alertData.resources.papyrus.phone}</Text>
                    <Text style={styles.resourceDesc}>{alertData.resources.papyrus.description}</Text>
                    <Text style={styles.resourceAvailable}>🕐 {alertData.resources.papyrus.available}</Text>
                  </View>
                  <View style={[styles.callBadge, { backgroundColor: '#FBBF24' }]}>
                    <Ionicons name="call" size={16} color="#fff" />
                    <Text style={styles.callBadgeText}>Call</Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Student Minds */}
              {alertData.resources?.student_minds && (
                <TouchableOpacity 
                  style={styles.resourceCard}
                  onPress={() => handleWebsite(alertData.resources.student_minds.website)}
                >
                  <View style={[styles.resourceIconBg, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                    <Ionicons name="school" size={24} color="#6366F1" />
                  </View>
                  <View style={styles.resourceContent}>
                    <Text style={styles.resourceName}>{alertData.resources.student_minds.name}</Text>
                    <Text style={styles.resourceDesc}>{alertData.resources.student_minds.description}</Text>
                    <Text style={styles.resourceAvailable}>🕐 {alertData.resources.student_minds.available}</Text>
                  </View>
                  <View style={[styles.callBadge, { backgroundColor: '#6366F1' }]}>
                    <Ionicons name="globe" size={16} color="#fff" />
                    <Text style={styles.callBadgeText}>Visit</Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* NHS 111 */}
              {alertData.resources?.nhs_111 && (
                <TouchableOpacity 
                  style={styles.resourceCard}
                  onPress={() => handleCall(alertData.resources.nhs_111.phone)}
                >
                  <View style={[styles.resourceIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                    <Ionicons name="medkit" size={24} color="#3B82F6" />
                  </View>
                  <View style={styles.resourceContent}>
                    <Text style={styles.resourceName}>{alertData.resources.nhs_111.name}</Text>
                    <Text style={[styles.resourcePhone, { color: '#3B82F6' }]}>{alertData.resources.nhs_111.phone}</Text>
                    <Text style={styles.resourceDesc}>{alertData.resources.nhs_111.description}</Text>
                    <Text style={styles.resourceAvailable}>🕐 {alertData.resources.nhs_111.available}</Text>
                  </View>
                  <View style={[styles.callBadge, { backgroundColor: '#3B82F6' }]}>
                    <Ionicons name="call" size={16} color="#fff" />
                    <Text style={styles.callBadgeText}>Call</Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* CALM - For men */}
              {alertData.resources?.calm && (
                <TouchableOpacity 
                  style={styles.resourceCard}
                  onPress={() => handleCall(alertData.resources.calm.phone)}
                >
                  <View style={[styles.resourceIconBg, { backgroundColor: 'rgba(14, 165, 233, 0.15)' }]}>
                    <Ionicons name="man" size={24} color="#0EA5E9" />
                  </View>
                  <View style={styles.resourceContent}>
                    <Text style={styles.resourceName}>{alertData.resources.calm.name}</Text>
                    <Text style={[styles.resourcePhone, { color: '#0EA5E9' }]}>{alertData.resources.calm.phone}</Text>
                    <Text style={styles.resourceDesc}>{alertData.resources.calm.description}</Text>
                    <Text style={styles.resourceAvailable}>🕐 {alertData.resources.calm.available}</Text>
                  </View>
                  <View style={[styles.callBadge, { backgroundColor: '#0EA5E9' }]}>
                    <Ionicons name="call" size={16} color="#fff" />
                    <Text style={styles.callBadgeText}>Call</Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Emergency 999 */}
              {alertData.resources?.emergency && (
                <TouchableOpacity 
                  style={[styles.resourceCard, styles.emergencyCard]}
                  onPress={() => handleCall(alertData.resources.emergency.phone)}
                >
                  <View style={[styles.resourceIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                    <Ionicons name="warning" size={24} color="#EF4444" />
                  </View>
                  <View style={styles.resourceContent}>
                    <Text style={[styles.resourceName, { color: '#EF4444' }]}>{alertData.resources.emergency.name}</Text>
                    <Text style={[styles.resourcePhone, { color: '#EF4444' }]}>{alertData.resources.emergency.phone}</Text>
                    <Text style={styles.resourceDesc}>{alertData.resources.emergency.description}</Text>
                    <Text style={styles.resourceAvailable}>🕐 {alertData.resources.emergency.available}</Text>
                  </View>
                  <View style={[styles.callBadge, { backgroundColor: '#EF4444' }]}>
                    <Ionicons name="call" size={16} color="#fff" />
                    <Text style={styles.callBadgeText}>Call</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Encouragement Message */}
            <View style={styles.encouragementSection}>
              <Text style={styles.encouragementTitle}>💜 Remember</Text>
              <Text style={styles.encouragementText}>
                You don't have to face this alone. Reaching out for help is a sign of strength, not weakness. These services are free, confidential, and available whenever you need them.
              </Text>
              <Text style={styles.encouragementText}>
                Your university also has support services available - check your student services portal.
              </Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>I Understand - Continue</Text>
            </TouchableOpacity>

            {/* Additional Info */}
            <Text style={styles.footerText}>
              Your wellbeing matters. We're here to support you. 💚
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: '#1F2937',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxHeight: '95%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  urgentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  urgentText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  resourcesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 14,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  priorityCard: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  emergencyCard: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  resourceIconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceContent: {
    flex: 1,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  resourcePhone: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  resourceDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 17,
  },
  resourceAvailable: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 3,
  },
  callBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    marginLeft: 8,
  },
  callBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  encouragementSection: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  encouragementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#A78BFA',
    marginBottom: 10,
  },
  encouragementText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 22,
    marginBottom: 8,
  },
  closeButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
  },
});
