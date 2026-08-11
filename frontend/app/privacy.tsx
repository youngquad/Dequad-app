/* Privacy — native fallback. Web users see privacy.web.tsx. */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function PrivacyNative() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.h1}>Privacy Policy</Text>
      <Text style={styles.p}>
        DEQUAD is committed to protecting your data. For the full privacy policy, visit
        https://dequad.co.uk/privacy in your browser.
      </Text>
      <Text style={styles.p}>
        DEQUAD uses only essential cookies needed to keep you signed in and to operate the
        service securely. We do not use advertising or third-party tracking cookies. The full
        Cookies Policy is included in the privacy policy at https://dequad.co.uk/privacy.
      </Text>
      <Text style={styles.p}>
        Email quadri.yusuf@dequad.com for any data-protection requests.
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
