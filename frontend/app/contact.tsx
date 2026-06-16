/* Contact — native fallback. Web users see contact.web.tsx. */
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, Pressable } from 'react-native';

export default function ContactNative() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.h1}>Contact DEQUAD</Text>
      <Text style={styles.p}>We typically reply within 4 hours during UK working hours.</Text>

      <Pressable onPress={() => Linking.openURL('mailto:quadri.yusuf@dequad.com')}>
        <Text style={styles.link}>quadri.yusuf@dequad.com — General enquiries</Text>
      </Pressable>
      <Pressable onPress={() => Linking.openURL('mailto:quadri.yusuf@dequad.com')}>
        <Text style={styles.link}>quadri.yusuf@dequad.com — Student support</Text>
      </Pressable>
      <Pressable onPress={() => Linking.openURL('mailto:quadri.yusuf@dequad.com')}>
        <Text style={styles.link}>quadri.yusuf@dequad.com — Privacy & data requests</Text>
      </Pressable>

      <Text style={[styles.h2, { marginTop: 28 }]}>In an emergency</Text>
      <Text style={styles.p}>If you or someone you know is in crisis, contact 999 (UK), Samaritans on 116 123 (free, 24/7) or Shout by text on 85258.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  inner: { padding: 24, paddingTop: 60 },
  h1: { color: '#F8FAFC', fontSize: 28, fontWeight: '700', marginBottom: 16 },
  h2: { color: '#F8FAFC', fontSize: 20, fontWeight: '700', marginBottom: 10 },
  p: { color: '#CBD5E1', fontSize: 16, lineHeight: 24, marginBottom: 14 },
  link: { color: '#5B9BD5', fontSize: 16, marginBottom: 12, fontWeight: '600' },
});
