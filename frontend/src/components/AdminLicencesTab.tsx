/**
 * Licences tab — super-admin registry of partner universities.
 * Students whose email domain matches an active licence get full access for free.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Switch, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { adminStyles } from '../utils/adminStyles';
import { notify, confirm } from '../utils/alert';

type Licence = {
  id: string;
  name: string;
  domains: string[];
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
  notes: string | null;
  students_covered: number;
  is_active_now: boolean;
};

type Props = { sessionToken: string | null };

const emptyForm = { name: '', domains: '', ends_at: '', notes: '', active: true };

export default function AdminLicencesTab({ sessionToken }: Props) {
  const [licences, setLicences] = useState<Licence[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const data = await api.get('/admin/university-licences', sessionToken);
      setLicences(data.licences || []);
    } catch (err) {
      console.error('Error loading licences:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionToken]);

  useEffect(() => { load(); }, [load]);

  const startCreate = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };
  const startEdit = (l: Licence) => {
    setEditingId(l.id);
    setForm({ name: l.name, domains: l.domains.join(', '), ends_at: l.ends_at ? l.ends_at.slice(0, 10) : '', notes: l.notes || '', active: l.active });
    setShowForm(true);
  };

  const save = async () => {
    const domains = form.domains.split(/[,\s]+/).map((d) => d.trim()).filter(Boolean);
    if (!form.name.trim() || domains.length === 0) {
      notify('Missing details', 'Enter the university name and at least one email domain (e.g. beds.ac.uk).');
      return;
    }
    if (form.ends_at && !/^\d{4}-\d{2}-\d{2}$/.test(form.ends_at)) {
      notify('Invalid date', 'Licence end date must be YYYY-MM-DD, or leave it blank for open-ended.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        domains,
        ends_at: form.ends_at ? `${form.ends_at}T23:59:59+00:00` : null,
        notes: form.notes.trim() || null,
        active: form.active,
      };
      if (editingId) await api.put(`/admin/university-licences/${editingId}`, payload, sessionToken);
      else await api.post('/admin/university-licences', payload, sessionToken);
      setShowForm(false);
      await load();
    } catch (err: any) {
      notify('Could not save', err?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (l: Licence) => {
    try {
      await api.put(`/admin/university-licences/${l.id}`, { active: !l.active }, sessionToken);
      await load();
    } catch (err: any) {
      notify('Could not update', err?.message || 'Please try again.');
    }
  };

  const remove = (l: Licence) => {
    confirm('Remove licence', `Remove ${l.name}? Students on ${l.domains.join(', ')} will lose free access immediately.`, async () => {
      await api.delete(`/admin/university-licences/${l.id}`, sessionToken);
      await load();
    });
  };

  return (
    <View style={adminStyles.content} testID="admin-licences-tab">
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={adminStyles.sectionTitle}>Partner University Licences</Text>
          <Text style={adminStyles.sectionSubtitle}>
            Students with an email on an active licence's domain get every Premium feature free.
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={startCreate} testID="licence-add-button">
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.formCard} testID="licence-form">
          <Text style={styles.formTitle}>{editingId ? 'Edit licence' : 'New partner university'}</Text>
          <TextInput style={styles.input} placeholder="University name" placeholderTextColor="#9CA3AF" value={form.name}
            onChangeText={(v) => setForm({ ...form, name: v })} testID="licence-name-input" />
          <TextInput style={styles.input} placeholder="Email domains, comma separated (e.g. beds.ac.uk, study.beds.ac.uk)" placeholderTextColor="#9CA3AF"
            value={form.domains} onChangeText={(v) => setForm({ ...form, domains: v })} autoCapitalize="none" testID="licence-domains-input" />
          <TextInput style={styles.input} placeholder="Licence end date YYYY-MM-DD (blank = open-ended)" placeholderTextColor="#9CA3AF"
            value={form.ends_at} onChangeText={(v) => setForm({ ...form, ends_at: v })} testID="licence-ends-input" />
          <TextInput style={styles.input} placeholder="Notes (contract ref, contact…)" placeholderTextColor="#9CA3AF" value={form.notes}
            onChangeText={(v) => setForm({ ...form, notes: v })} testID="licence-notes-input" />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Active</Text>
            <Switch value={form.active} onValueChange={(v) => setForm({ ...form, active: v })} testID="licence-active-switch" />
          </View>
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)} testID="licence-cancel-button">
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving} testID="licence-save-button">
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>{editingId ? 'Save changes' : 'Create licence'}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color="#6366F1" style={{ marginTop: 24 }} />
      ) : licences.length === 0 ? (
        <View style={styles.empty} testID="licence-empty">
          <Ionicons name="school-outline" size={36} color="#9CA3AF" />
          <Text style={styles.emptyText}>No partner universities yet. Add one to unlock features for its students.</Text>
        </View>
      ) : (
        licences.map((l) => (
          <View key={l.id} style={styles.card} testID={`licence-card-${l.id}`}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardName}>{l.name}</Text>
                <Text style={styles.cardDomains}>{l.domains.join(' · ')}</Text>
              </View>
              <View style={[styles.pill, l.is_active_now ? styles.pillOn : styles.pillOff]}>
                <Text style={[styles.pillText, l.is_active_now ? styles.pillTextOn : styles.pillTextOff]}>
                  {l.is_active_now ? 'Active' : l.active ? 'Expired' : 'Paused'}
                </Text>
              </View>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="people-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{l.students_covered} students covered</Text>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" style={{ marginLeft: 12 }} />
              <Text style={styles.metaText}>{l.ends_at ? `Ends ${l.ends_at.slice(0, 10)}` : 'Open-ended'}</Text>
            </View>
            {!!l.notes && <Text style={styles.notes}>{l.notes}</Text>}
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => toggleActive(l)} testID={`licence-toggle-${l.id}`}>
                <Ionicons name={l.active ? 'pause-circle-outline' : 'play-circle-outline'} size={16} color="#6366F1" />
                <Text style={styles.actionText}>{l.active ? 'Pause' : 'Resume'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => startEdit(l)} testID={`licence-edit-${l.id}`}>
                <Ionicons name="create-outline" size={16} color="#6366F1" />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => remove(l)} testID={`licence-delete-${l.id}`}>
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text style={[styles.actionText, { color: '#EF4444' }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#6366F1', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '700' },
  formCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB', gap: 10 },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#111827', backgroundColor: '#F9FAFB' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  switchLabel: { fontSize: 14, color: '#374151', fontWeight: '600' },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 4 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F3F4F6' },
  cancelText: { color: '#374151', fontWeight: '600' },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, backgroundColor: '#6366F1', minWidth: 130, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700' },
  empty: { alignItems: 'center', padding: 32, gap: 12 },
  emptyText: { color: '#6B7280', textAlign: 'center', fontSize: 14 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardDomains: { fontSize: 13, color: '#6366F1', marginTop: 2 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillOn: { backgroundColor: '#DCFCE7' },
  pillOff: { backgroundColor: '#FEE2E2' },
  pillText: { fontSize: 12, fontWeight: '700' },
  pillTextOn: { color: '#15803D' },
  pillTextOff: { color: '#B91C1C' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  metaText: { fontSize: 13, color: '#6B7280' },
  notes: { fontSize: 13, color: '#6B7280', marginTop: 8, fontStyle: 'italic' },
  cardActions: { flexDirection: 'row', gap: 16, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 13, color: '#6366F1', fontWeight: '600' },
});
