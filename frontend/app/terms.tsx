/* Terms — native fallback. Web users see terms.web.tsx. */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function TermsNative() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.h1}>Terms & Conditions</Text>
      <Text style={styles.p}>
        For the full Terms & Conditions, visit https://dequad.co.uk/terms in your browser.
      </Text>
      <Text style={styles.p}>
        Email hello@dequad.co.uk with any questions about these Terms.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  inner: { padding: 24, paddingTop: 60 },
  h1: { color: '#F8FAFC', fontSize: 28, fontWeight: '700', marginBottom: 16 },
  p: { color: '#CBD5E1', fontSize: 16, lineHeight: 24, marginBottom: 14 },
});
