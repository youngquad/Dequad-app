import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface MatchFilters {
  gender?: string;
  min_age?: number;
  max_age?: number;
  university?: string;
  education_level?: string;
  city?: string;
  max_distance_km?: number;
}

interface Props {
  visible: boolean;
  initial: MatchFilters;
  onClose: () => void;
  onApply: (filters: MatchFilters) => void;
  hasLocation?: boolean;
  onRequestLocation?: () => void;
}

const GENDER_OPTIONS = ['', 'male', 'female', 'non-binary'];
const EDUCATION_LEVELS = [
  '',
  'First year',
  'Second year',
  'Third year',
  'Final year',
  'Masters',
  'PhD',
];
const DISTANCE_STEPS: { label: string; value?: number }[] = [
  { label: 'Any', value: undefined },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
  { label: '100 km', value: 100 },
  { label: '250 km', value: 250 },
];

export default function MatchFiltersModal({ visible, initial, onClose, onApply, hasLocation, onRequestLocation }: Props) {
  const [draft, setDraft] = useState<MatchFilters>(initial);

  // Sync `initial` -> draft when the modal opens (e.g. after editing previously)
  React.useEffect(() => {
    if (visible) setDraft(initial);
  }, [visible, initial]);

  const apply = () => {
    onApply({ ...draft });
    onClose();
  };

  const clearAll = () => {
    setDraft({});
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet} data-testid="match-filters-modal">
          <View style={styles.header}>
            <Text style={styles.title}>Filter matches</Text>
            <Pressable onPress={onClose} data-testid="close-filters">
              <Ionicons name="close" size={24} color="#0F2942" />
            </Pressable>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 24 }}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.chipRow}>
              {GENDER_OPTIONS.map((g) => (
                <Pressable
                  key={g || 'any'}
                  onPress={() => setDraft({ ...draft, gender: g || undefined })}
                  style={[styles.chip, draft.gender === (g || undefined) && styles.chipActive]}
                  data-testid={`filter-gender-${g || 'any'}`}
                >
                  <Text style={[styles.chipText, draft.gender === (g || undefined) && styles.chipTextActive]}>
                    {g ? g.charAt(0).toUpperCase() + g.slice(1) : 'Any'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Age range</Text>
            <View style={styles.row}>
              <TextInput
                value={draft.min_age?.toString() || ''}
                onChangeText={(v) => setDraft({ ...draft, min_age: v ? parseInt(v, 10) : undefined })}
                placeholder="Min (e.g. 18)"
                placeholderTextColor="#94A3B0"
                keyboardType="numeric"
                style={[styles.input, { flex: 1 }]}
                data-testid="filter-min-age"
              />
              <Text style={styles.dash}>—</Text>
              <TextInput
                value={draft.max_age?.toString() || ''}
                onChangeText={(v) => setDraft({ ...draft, max_age: v ? parseInt(v, 10) : undefined })}
                placeholder="Max (e.g. 25)"
                placeholderTextColor="#94A3B0"
                keyboardType="numeric"
                style={[styles.input, { flex: 1 }]}
                data-testid="filter-max-age"
              />
            </View>

            <Text style={styles.label}>University</Text>
            <TextInput
              value={draft.university || ''}
              onChangeText={(v) => setDraft({ ...draft, university: v || undefined })}
              placeholder="e.g. University of Bedfordshire"
              placeholderTextColor="#94A3B0"
              style={styles.input}
              data-testid="filter-university"
            />

            <Text style={styles.label}>Education level</Text>
            <View style={styles.chipRow}>
              {EDUCATION_LEVELS.map((lvl) => (
                <Pressable
                  key={lvl || 'any'}
                  onPress={() => setDraft({ ...draft, education_level: lvl || undefined })}
                  style={[
                    styles.chip,
                    draft.education_level === (lvl || undefined) && styles.chipActive,
                  ]}
                  data-testid={`filter-edu-${(lvl || 'any').toLowerCase().replace(/\s/g, '-')}`}
                >
                  <Text
                    style={[
                      styles.chipText,
                      draft.education_level === (lvl || undefined) && styles.chipTextActive,
                    ]}
                  >
                    {lvl || 'Any'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>City</Text>
            <TextInput
              value={draft.city || ''}
              onChangeText={(v) => setDraft({ ...draft, city: v || undefined })}
              placeholder="e.g. London, Manchester, Luton"
              placeholderTextColor="#94A3B0"
              style={styles.input}
              data-testid="filter-city"
            />

            <Text style={styles.label}>Max distance</Text>
            {hasLocation ? (
              <View style={styles.chipRow}>
                {DISTANCE_STEPS.map((opt) => {
                  const active = draft.max_distance_km === opt.value;
                  return (
                    <Pressable
                      key={opt.label}
                      onPress={() => setDraft({ ...draft, max_distance_km: opt.value })}
                      style={[styles.chip, active && styles.chipActive]}
                      data-testid={`filter-distance-${opt.value ?? 'any'}`}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Pressable
                onPress={onRequestLocation}
                style={styles.locationCta}
                data-testid="enable-location-cta"
              >
                <Ionicons name="location-outline" size={18} color="#0F2942" />
                <Text style={styles.locationCtaText}>
                  Turn on location to filter matches by distance
                </Text>
              </Pressable>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable onPress={clearAll} style={styles.clearBtn} data-testid="clear-filters">
              <Text style={styles.clearBtnText}>Clear all</Text>
            </Pressable>
            <Pressable onPress={apply} style={styles.applyBtn} data-testid="apply-filters">
              <Text style={styles.applyBtnText}>Apply filters</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 41, 66, 0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#EEF2F7',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#0F2942' },
  body: { paddingHorizontal: 20, paddingTop: 8 },
  label: { fontSize: 13, fontWeight: '700', color: '#0F2942', marginTop: 16, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#F2F5FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: '#0F2942', borderColor: '#0F2942' },
  chipText: { fontSize: 13, color: '#4F6076', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dash: { color: '#94A3B0', fontSize: 16, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: '#D5DCE5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 14,
    color: '#0F2942',
    backgroundColor: '#fff',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: '#EEF2F7',
  },
  clearBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D5DCE5',
    backgroundColor: '#fff',
  },
  clearBtnText: { color: '#4F6076', fontWeight: '700' },
  applyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: '#0F2942',
    alignItems: 'center',
  },
  applyBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  locationCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE8F2',
    backgroundColor: '#F6FAFE',
  },
  locationCtaText: {
    flex: 1,
    color: '#0F2942',
    fontSize: 13,
    fontWeight: '600',
  },
});
