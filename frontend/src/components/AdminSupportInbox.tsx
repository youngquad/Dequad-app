import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  FlatList,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../services/api';

interface Conversation {
  user_id: string;
  name: string;
  email: string;
  university?: string;
  last_message: string;
  last_message_at: string;
  last_sender: string;
  unread_for_admin: number;
  total_messages: number;
}

interface SupportMessage {
  id: string;
  user_id: string;
  sender: 'user' | 'agent' | 'ai';
  text: string;
  is_ai: boolean;
  created_at: string;
}

type Props = {
  sessionToken: string | null;
};

export default function AdminSupportInbox({ sessionToken }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<FlatList<SupportMessage>>(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await api.get('/support/admin/conversations', sessionToken);
      setConversations(res?.conversations || []);
    } catch (e) {
      console.error('Load conversations error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [sessionToken]);

  const loadMessages = useCallback(
    async (userId: string) => {
      setIsLoadingMessages(true);
      try {
        const res = await api.get(`/support/admin/messages/${userId}`, sessionToken);
        setMessages(Array.isArray(res) ? res : []);
        // Optimistically clear unread badge for this conversation.
        setConversations((prev) =>
          prev.map((c) => (c.user_id === userId ? { ...c, unread_for_admin: 0 } : c)),
        );
      } catch (e) {
        console.error('Load messages error:', e);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [sessionToken],
  );

  useEffect(() => {
    loadConversations();
    const id = setInterval(loadConversations, 20_000); // poll every 20s
    return () => clearInterval(id);
  }, [loadConversations]);

  useEffect(() => {
    if (selectedUser) loadMessages(selectedUser.user_id);
  }, [selectedUser, loadMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 80);
    }
  }, [messages.length]);

  const showError = (msg: string) => {
    if (Platform.OS === 'web') window.alert(msg);
    else Alert.alert('Unable to send', msg);
  };

  const sendReply = async () => {
    if (!selectedUser || !reply.trim() || isSending) return;
    setIsSending(true);
    const text = reply.trim();
    setReply('');
    try {
      const res = await api.post(
        '/support/admin/reply',
        { user_id: selectedUser.user_id, text },
        sessionToken,
      );
      setMessages((prev) => [...prev, res.message]);
      // Refresh conversations to update preview.
      loadConversations();
    } catch (e: any) {
      setReply(text); // restore
      showError(e?.message || 'Could not send reply. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const formatPreview = (msg: string) => (msg?.length > 60 ? msg.slice(0, 57) + '…' : msg);
  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const today = new Date();
      const sameDay =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
      if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color="#6366F1" />
        <Text style={styles.loadingText}>Loading support inbox…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Conversations list */}
      <View style={[styles.column, styles.listColumn]}>
        <View style={styles.columnHeader}>
          <Ionicons name="chatbubbles" size={18} color="#818CF8" />
          <Text style={styles.columnTitle}>Support inbox</Text>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{conversations.length}</Text>
          </View>
        </View>
        {conversations.length === 0 ? (
          <View style={styles.emptyList}>
            <Ionicons name="happy-outline" size={28} color="#6B7280" />
            <Text style={styles.emptyListText}>No support conversations yet.</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {conversations.map((c) => {
              const selected = selectedUser?.user_id === c.user_id;
              return (
                <Pressable
                  key={c.user_id}
                  onPress={() => setSelectedUser(c)}
                  style={[styles.convoItem, selected && styles.convoItemSelected]}
                  data-testid={`support-convo-${c.user_id}`}
                >
                  <View style={styles.convoAvatar}>
                    <Text style={styles.convoAvatarText}>
                      {(c.name || '?').slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.convoTopRow}>
                      <Text style={styles.convoName} numberOfLines={1}>
                        {c.name || c.email}
                      </Text>
                      <Text style={styles.convoTime}>{formatTime(c.last_message_at)}</Text>
                    </View>
                    <Text style={styles.convoPreview} numberOfLines={1}>
                      {c.last_sender === 'user' ? '' : c.last_sender === 'ai' ? '🤖 ' : '🎧 '}
                      {formatPreview(c.last_message)}
                    </Text>
                  </View>
                  {c.unread_for_admin > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{c.unread_for_admin}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Thread + composer */}
      <View style={[styles.column, styles.threadColumn]}>
        {!selectedUser ? (
          <View style={styles.emptyThread}>
            <LinearGradient
              colors={['rgba(99,102,241,0.18)', 'rgba(139,92,246,0.08)']}
              style={styles.emptyIconBox}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={28} color="#818CF8" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>Select a conversation</Text>
            <Text style={styles.emptySubtitle}>
              Choose a student from the inbox to view the thread and reply as a human agent.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.threadHeader}>
              <View>
                <Text style={styles.threadName}>{selectedUser.name}</Text>
                <Text style={styles.threadMeta}>
                  {selectedUser.email}
                  {selectedUser.university ? `  •  ${selectedUser.university}` : ''}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => loadMessages(selectedUser.user_id)}
                style={styles.refreshBtn}
                data-testid="support-refresh-btn"
              >
                <Ionicons name="refresh" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {isLoadingMessages ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color="#6366F1" />
              </View>
            ) : (
              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(m) => m.id}
                contentContainerStyle={styles.messagesContent}
                renderItem={({ item }) => {
                  const isStudent = item.sender === 'user';
                  const isAI = item.sender === 'ai';
                  return (
                    <View
                      style={[
                        styles.msgRow,
                        isStudent ? styles.msgRowLeft : styles.msgRowRight,
                      ]}
                    >
                      <View
                        style={[
                          styles.bubble,
                          isStudent
                            ? styles.bubbleStudent
                            : isAI
                            ? styles.bubbleAI
                            : styles.bubbleAgent,
                        ]}
                      >
                        <Text style={styles.bubbleLabel}>
                          {isStudent ? 'Student' : isAI ? '🤖 AI auto-reply' : '🎧 You'}
                        </Text>
                        <Text style={styles.bubbleText}>{item.text}</Text>
                        <Text style={styles.bubbleTime}>{formatTime(item.created_at)}</Text>
                      </View>
                    </View>
                  );
                }}
                ListEmptyComponent={
                  <Text style={styles.threadEmptyText}>No messages yet.</Text>
                }
              />
            )}

            {/* Composer */}
            <View style={styles.composer}>
              <TextInput
                style={styles.input}
                value={reply}
                onChangeText={setReply}
                placeholder={`Reply to ${selectedUser.name}…`}
                placeholderTextColor="#64748B"
                multiline
                maxLength={2000}
                data-testid="support-admin-reply-input"
              />
              <Pressable
                onPress={sendReply}
                disabled={!reply.trim() || isSending}
                data-testid="support-admin-send-btn"
              >
                <LinearGradient
                  colors={reply.trim() && !isSending ? ['#10B981', '#059669'] : ['#374151', '#4B5563']}
                  style={styles.sendBtn}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="send" size={16} color="#fff" />
                      <Text style={styles.sendBtnText}>Send</Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    gap: 12,
    minHeight: 540,
    maxHeight: 720,
  },
  column: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.12)',
    overflow: 'hidden',
  },
  listColumn: { flex: 1, minWidth: 260 },
  threadColumn: { flex: 1.6, minWidth: 320 },

  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.12)',
  },
  columnTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '700', flex: 1 },
  countPill: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countPillText: { color: '#C7D2FE', fontSize: 12, fontWeight: '700' },

  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
  },
  loadingText: { color: '#94A3B8', fontSize: 13 },

  emptyList: { alignItems: 'center', padding: 32, gap: 10 },
  emptyListText: { color: '#94A3B8', fontSize: 13, textAlign: 'center' },

  convoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.07)',
  },
  convoItemSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  convoAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  convoAvatarText: { color: '#C7D2FE', fontWeight: '700' },
  convoTopRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2,
  },
  convoName: { color: '#F8FAFC', fontWeight: '600', fontSize: 14, flex: 1 },
  convoTime: { color: '#64748B', fontSize: 11 },
  convoPreview: { color: '#94A3B8', fontSize: 12 },
  unreadBadge: {
    minWidth: 22, paddingHorizontal: 6, height: 22, borderRadius: 11,
    backgroundColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center',
  },
  unreadBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.12)',
  },
  threadName: { color: '#F8FAFC', fontSize: 15, fontWeight: '700' },
  threadMeta: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  refreshBtn: { padding: 6 },

  messagesContent: { padding: 12, gap: 8 },
  msgRow: { flexDirection: 'row', marginBottom: 8 },
  msgRowLeft: { justifyContent: 'flex-start' },
  msgRowRight: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  bubbleStudent: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    borderBottomLeftRadius: 4,
  },
  bubbleAI: {
    backgroundColor: 'rgba(99, 102, 241, 0.20)',
    borderBottomRightRadius: 4,
  },
  bubbleAgent: {
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    borderBottomRightRadius: 4,
  },
  bubbleLabel: { color: '#CBD5E1', fontSize: 10, fontWeight: '600', marginBottom: 2 },
  bubbleText: { color: '#F1F5F9', fontSize: 14, lineHeight: 19 },
  bubbleTime: { color: 'rgba(226,232,240,0.5)', fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  threadEmptyText: { color: '#94A3B8', textAlign: 'center', padding: 32 },

  composer: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.12)',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 40, maxHeight: 100,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F8FAFC',
    fontSize: 14,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  sendBtnText: { color: '#fff', fontWeight: '700' },

  emptyThread: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  emptyIconBox: {
    width: 56, height: 56, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  emptySubtitle: { color: '#94A3B8', fontSize: 13, textAlign: 'center', maxWidth: 320 },
});
