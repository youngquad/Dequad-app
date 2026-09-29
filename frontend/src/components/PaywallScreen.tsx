import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme, Theme } from '../contexts/ThemeContext';

interface Props {
  feature: string;
  description: string;
  benefits: string[];
  icon?: keyof typeof Ionicons.glyphMap;
}

export const PaywallScreen = ({ feature, description, benefits, icon = 'lock-closed' }: Props) => {
  const { theme: t } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(t), [t]);

  return (
    <View style={styles.wrap} testID="paywall-screen">
      <View style={styles.iconRing}>
        <Ionicons name={icon} size={34} color={t.premium} />
      </View>
      <Text style={styles.title} testID="paywall-title">Unlock {feature}</Text>
      <Text style={styles.subtitle}>{description}</Text>

      <View style={styles.benefits}>
        {benefits.map((b) => (
          <View key={b} style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={18} color={t.accent} />
            <Text style={styles.benefitText}>{b}</Text>
          </View>
        ))}
      </View>

      <Pressable onPress={() => router.push('/(main)/subscription')} testID="paywall-upgrade-button">
        <LinearGradient colors={t.ctaGradient} style={styles.cta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Ionicons name="diamond" size={18} color="#fff" />
          <Text style={styles.ctaText}>Unlock with Premium</Text>
        </LinearGradient>
      </Pressable>

      <View style={styles.partnerBox} testID="paywall-partner-note">
        <Ionicons name="school-outline" size={18} color={t.textMuted} />
        <Text style={styles.partnerText}>
          <Text style={styles.partnerStrong}>Free if your university is a DEQUAD partner.</Text>
          {' '}Partner universities cover every feature for students on their email domain — ask your student union or wellbeing team to get in touch.
        </Text>
      </View>
    </View>
  );
};

const createStyles = (t: Theme) => StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', paddingHorizontal: 28, paddingTop: 36, paddingBottom: 120 },
  iconRing: {
    width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center',
    backgroundColor: t.card, borderWidth: 1, borderColor: t.border, marginBottom: 20,
  },
  title: { color: t.text, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: t.textMuted, fontSize: 15, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  benefits: { alignSelf: 'stretch', marginTop: 28, gap: 12 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  benefitText: { color: t.text, fontSize: 15, flex: 1 },
  cta: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 28, paddingVertical: 16,
    borderRadius: 999, marginTop: 32,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  partnerBox: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 28, padding: 14,
    borderRadius: 14, backgroundColor: t.card, borderWidth: 1, borderColor: t.border,
  },
  partnerText: { color: t.textMuted, fontSize: 13, lineHeight: 19, flex: 1 },
  partnerStrong: { color: t.text, fontWeight: '700' },
});

export default PaywallScreen;
